import { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const SplitContext = createContext();



function splitReducer(state, action) {
    switch (action.type) {
        case 'ADD_PERSON':
            return {
                ...state,
                people: [...state.people, { ...action.payload, id: uuidv4(), history: [] }]
            };
        case 'UPDATE_PERSON':
            return {
                ...state,
                people: state.people.map(p => p.id === action.payload.id ? { ...p, ...action.payload.updates } : p)
            };
        case 'DELETE_PERSON':
            return {
                ...state,
                people: state.people.filter(p => p.id !== action.payload)
            };
        case 'ADD_ITEM':
            const { price, assignedTo, name, type } = action.payload;
            return {
                ...state,
                items: [...state.items, { ...action.payload, id: uuidv4() }],
                people: state.people.map(person => {
                    if (assignedTo.includes(person.id)) {
                        const amount = type === 'personal' ? price : (price / assignedTo.length);
                        const newHistoryItem = {
                            id: uuidv4(),
                            date: new Date().toISOString(),
                            description: name,
                            amount: amount,
                            type: 'expense'
                        };
                        return {
                            ...person,
                            history: [newHistoryItem, ...(person.history || [])]
                        };
                    }
                    return person;
                })
            };
        case 'DELETE_ITEM':
            return {
                ...state,
                items: state.items.filter(i => i.id !== action.payload)
            };
        case 'UPDATE_ITEM':
            return {
                ...state,
                items: state.items.map(i => i.id === action.payload.id ? { ...i, ...action.payload.updates } : i)
            };
        case 'SETTLE_DEBT':
            return {
                ...state,
                people: state.people.map(p => {
                    if (p.id === action.payload.id) {
                        // We are effectively "paying off" the total debt.
                        // To allow the dashboard to show 0, we set previousBalance to negate the *current* items' sum.
                        // BUT we also want to record this payment.

                        // Calculating the offsetting balance is complex inside reducer without access to items loop easily (unless we pass amount).
                        // We passed 'amount' in payload which IS the total debt.

                        // Current Calculation: Total = ItemsShare + PrevBalance
                        // New Calculation: Total = ItemsShare + NewPrevBalance = 0
                        // => NewPrevBalance = -ItemsShare

                        // We know Total = Amount. So ItemsShare = Amount - OldPrevBalance.
                        // NewPrevBalance = -(Amount - OldPrevBalance) = OldPrevBalance - Amount.

                        const newHistoryItem = {
                            id: uuidv4(),
                            date: new Date().toISOString(),
                            description: 'Cleared Dues',
                            amount: -action.payload.amount,
                            type: 'settlement'
                        };

                        return {
                            ...p,
                            // Adjust previous balance so the net result (Items + Prev) is 0
                            previousBalance: p.previousBalance - action.payload.amount,
                            history: [newHistoryItem, ...(p.history || [])]
                        };
                    }
                    return p;
                })
            };
        case 'ARCHIVE_SESSION':
            return {
                ...state,
                reports: [...(state.reports || []), action.payload.report],
                items: [], // Clear current items
                people: state.people.map(p => ({
                    ...p,
                    previousBalance: action.payload.totals[p.id] || 0
                }))
            };
        default:
            return state;
    }
}

const getInitialState = () => {
    const saved = localStorage.getItem('split_app_data');
    if (saved) {
        return JSON.parse(saved);
    }
    return {
        people: [
            { id: '1', name: 'Suvra', isOwner: true, emoji: '👤' }
        ],
        items: [],
    };
};

export function SplitProvider({ children }) {
    const [state, dispatch] = useReducer(splitReducer, null, getInitialState);

    // Persist to LocalStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('split_app_data', JSON.stringify(state));
    }, [state]);

    const addPerson = (name, emoji = '👤') => {
        dispatch({ type: 'ADD_PERSON', payload: { name, emoji, isOwner: false } });
    };

    const deletePerson = (id) => {
        dispatch({ type: 'DELETE_PERSON', payload: id });
    };

    const addItem = (item) => {
        dispatch({ type: 'ADD_ITEM', payload: item });
    };

    const deleteItem = (id) => {
        dispatch({ type: 'DELETE_ITEM', payload: id });
    };

    const updateItem = (id, updates) => {
        dispatch({ type: 'UPDATE_ITEM', payload: { id, updates } });
    };

    const settlePerson = (id) => {
        // Calculate current liability
        const person = state.people.find(p => p.id === id);
        if (!person) return;

        let currentLiability = 0;
        state.items.forEach(item => {
            if (item.assignedTo.includes(id)) {
                if (item.type === 'personal') {
                    currentLiability += item.price;
                } else {
                    currentLiability += item.price / item.assignedTo.length;
                }
            }
        });

        const totalDue = currentLiability + (person.previousBalance || 0);

        // Dispatch SETTLE_DEBT with the total amount to clear
        dispatch({
            type: 'SETTLE_DEBT',
            payload: {
                id,
                amount: totalDue
            }
        });
    };

    const archiveSession = () => {
        // Calculate totals to carry forward
        const totals = {};

        state.people.forEach(person => {
            let personalTotal = 0;
            let sharedTotal = 0;

            state.items.forEach(item => {
                if (item.assignedTo.includes(person.id)) {
                    if (item.type === 'personal') {
                        personalTotal += item.price;
                    } else {
                        sharedTotal += item.price / item.assignedTo.length;
                    }
                }
            });
            totals[person.id] = personalTotal + sharedTotal + (person.previousBalance || 0);
        });

        // Create Report
        const report = {
            id: uuidv4(),
            date: new Date().toISOString(),
            grandTotal: state.items.reduce((sum, i) => sum + i.price, 0),
            items: state.items,
            peopleState: state.people
        };

        dispatch({ type: 'ARCHIVE_SESSION', payload: { report, totals } });
    };

    const resetSession = () => {
        // Clear data but keep owner
        const resetState = {
            people: [{ id: '1', name: 'Suvra', isOwner: true, emoji: '👤' }],
            items: []
        };
        localStorage.setItem('split_app_data', JSON.stringify(resetState));
        // Force reload or dispatch a RESET action (not implemented, will rely on reload for MVP simplicity or just manual clean)
        // Actually let's dispatch a RESET action if we wanted, but for now user didn't ask for reset button.
    };

    return (
        <SplitContext.Provider value={{
            people: state.people,
            items: state.items,
            reports: state.reports || [],
            addPerson,
            deletePerson,
            addItem,
            deleteItem,
            updateItem,
            settlePerson,
            archiveSession
        }}>
            {children}
        </SplitContext.Provider>
    );
}

export function useSplit() {
    return useContext(SplitContext);
}
