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
            const { price, assignedTo, name, type, paidBy } = action.payload;
            // Safe owner check (assuming ID 1 is owner if flag missing, but usually state has it)
            const ownerId = state.people.find(p => p.isOwner)?.id || '1';

            return {
                ...state,
                items: [...state.items, { ...action.payload, id: uuidv4() }],
                people: state.people.map(person => {
                    const perPersonShare = type === 'personal' ? price : (price / assignedTo.length);
                    const payer = paidBy || ownerId;

                    // Case A: Owner Paid (Default)
                    if (payer === ownerId) {
                        // If this person consumed it (and is not owner), they owe Owner.
                        if (assignedTo.includes(person.id) && !person.isOwner) {
                            const newHistoryItem = {
                                id: uuidv4(),
                                date: new Date().toISOString(),
                                description: name,
                                amount: perPersonShare,
                                type: 'expense'
                            };
                            return {
                                ...person,
                                history: [newHistoryItem, ...(person.history || [])]
                            };
                        }
                    }
                    // Case B: This Person Paid
                    else if (payer === person.id) {
                        // If they paid for Owner (Owner assigned)
                        if (assignedTo.includes(ownerId)) {
                            // Owner owes them -> Credit them.
                            // To keep it simple as requested: just show it as a credit entry.
                            const newHistoryItem = {
                                id: uuidv4(),
                                date: new Date().toISOString(),
                                description: name,
                                amount: -perPersonShare,
                                type: 'settlement'
                            };
                            return {
                                ...person,
                                history: [newHistoryItem, ...(person.history || [])]
                            };
                        }
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
        case 'CLEAR_HISTORY':
            return {
                ...state,
                people: state.people.map(p => {
                    if (p.id === action.payload) {
                        return { ...p, history: [] }; // Wipe history
                    }
                    return p;
                })
            };
        case 'DELETE_REPORT':
            return {
                ...state,
                reports: state.reports.filter(r => r.id !== action.payload)
            };
        case 'RESET_APP':
            return {
                people: [{ id: '1', name: 'Suvra', isOwner: true, emoji: '👤' }],
                items: [],
                reports: []
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

        const ownerId = state.people.find(p => p.isOwner)?.id || '1';
        let currentShare = 0;

        state.items.forEach(item => {
            const payerId = item.paidBy || ownerId;
            const perPersonShare = (item.type === 'personal' ? item.price : item.price / item.assignedTo.length);

            // If Owner Paid -> Friend owes Owner (Debit)
            if (payerId === ownerId) {
                if (item.assignedTo.includes(person.id)) {
                    currentShare += perPersonShare;
                }
            }
            // If Friend Paid -> Owner owes Friend (Credit)
            else if (payerId === person.id) {
                if (item.assignedTo.includes(ownerId)) {
                    currentShare -= perPersonShare;
                }
            }
        });

        const totalDue = currentShare + (person.previousBalance || 0);

        // Dispatch SETTLE_DEBT with the total amount to clear
        dispatch({
            type: 'SETTLE_DEBT',
            payload: {
                id,
                amount: totalDue
            }
        });
    };

    const clearHistory = (id) => {
        if (window.confirm("Are you sure you want to delete this history? It cannot be undone.")) {
            dispatch({ type: 'CLEAR_HISTORY', payload: id });
        }
    };

    const deleteReport = (id) => {
        if (window.confirm("Are you sure you want to delete this report?")) {
            dispatch({ type: 'DELETE_REPORT', payload: id });
        }
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

    const resetApp = () => {
        if (window.confirm("CRITICAL: This will delete ALL data (people, items, history, reports). Are you sure?")) {
            dispatch({ type: 'RESET_APP' });
            localStorage.removeItem('split_app_data');
            window.location.reload();
        }
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
            clearHistory,
            archiveSession,
            deleteReport,
            resetApp
        }}>
            {children}
        </SplitContext.Provider>
    );
}

export function useSplit() {
    return useContext(SplitContext);
}
