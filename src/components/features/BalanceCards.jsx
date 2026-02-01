import { useSplit } from '../../contexts/SplitContext';
import { GlassCard } from '../common/GlassCard';
import { Check, Clock, TrendingUp, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BalanceCards() {
    const { people, items, settlePerson } = useSplit();

    // Calculate Debt Matrix for Active Session
    const activeBalances = (() => {
        const matrix = {};
        const ownerId = people.find(p => p.isOwner)?.id || '1';

        // Initialize matrix
        people.forEach(p1 => {
            matrix[p1.id] = {};
            people.forEach(p2 => {
                if (p1.id !== p2.id) matrix[p1.id][p2.id] = 0;
            });
        });

        // Calculate debts from items
        items.forEach(item => {
            const owner = people.find(p => p.isOwner) || people[0];
            const payerId = item.paidBy || (owner ? owner.id : '1');
            const consumers = item.assignedTo || [];
            const perPersonShare = (item.type === 'personal' ? item.price : item.price / (consumers.length || 1));

            consumers.forEach(consumerId => {
                if (consumerId !== payerId && matrix[consumerId]) {
                    matrix[consumerId][payerId] = (matrix[consumerId][payerId] || 0) + perPersonShare;
                }
            });
        });

        // Net debts and include previous balances
        const netBalances = people.map(person => {
            const owes = [];
            const isOwedBy = [];
            let currentNetDue = 0;

            people.forEach(other => {
                if (person.id === other.id) return;

                const aOwesB = (matrix[person.id][other.id] || 0);
                const bOwesA = (matrix[other.id][person.id] || 0);

                if (aOwesB > bOwesA) {
                    const amount = aOwesB - bOwesA;
                    if (amount > 0.5) {
                        owes.push({ name: other.name, amount });
                        currentNetDue += amount;
                    }
                } else if (bOwesA > aOwesB) {
                    const amount = bOwesA - aOwesB;
                    if (amount > 0.5) {
                        isOwedBy.push({ name: other.name, amount });
                        currentNetDue -= amount;
                    }
                }
            });

            // Net total including previous balance
            const totalDue = currentNetDue + (person.previousBalance || 0);

            return {
                ...person,
                owes,
                isOwedBy,
                totalDue,
                history: person.history || []
            };
        });

        return netBalances;
    })();

    if (activeBalances.length === 0) return null;

    return (
        <section className="space-y-4">
            <motion.h2
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold text-white flex items-center gap-3 tracking-wide px-1"
            >
                <span className="p-2 bg-green-500/10 text-green-400 rounded-xl ring-1 ring-green-500/20"><TrendingUp size={18} /></span>
                Active Balances
            </motion.h2>

            <div className="grid grid-cols-1 gap-4">
                {activeBalances.map((person, idx) => (
                    <GlassCard key={person.id} delay={0.3 + idx * 0.1} className="bg-zinc-900/40 border-zinc-800/40 relative overflow-hidden group min-h-[340px] flex flex-col">
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            <span className="text-6xl grayscale opacity-10 select-none">{person.emoji}</span>
                        </div>

                        <div className="relative z-10 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-2xl border border-zinc-700/50 shadow-inner">
                                        {person.emoji}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white leading-none mb-1">{person.name}</h3>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5">Net Result</p>
                                    <p className={`text-2xl font-bold ${person.totalDue > 0 ? 'text-white' : 'text-green-400'}`}>
                                        ₹{Math.abs(person.totalDue).toFixed(0)}
                                    </p>
                                </div>
                            </div>

                            {/* Debt Breakdown */}
                            <div className="mb-4 space-y-2 bg-zinc-950/20 p-3 rounded-xl border border-zinc-800/20 min-h-[60px]">
                                {person.owes.length > 0 && (
                                    <div className="space-y-1">
                                        {person.owes.map((o, i) => (
                                            <div key={i} className="flex justify-between items-center text-xs text-zinc-400">
                                                <span>Owes {o.name}</span>
                                                <span className="font-mono text-zinc-300">₹{(o.amount || 0).toFixed(0)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {person.isOwedBy.length > 0 && (
                                    <div className="space-y-1">
                                        {person.isOwedBy.map((o, i) => (
                                            <div key={i} className="flex justify-between items-center text-xs text-zinc-500">
                                                <span>Owed by {o.name}</span>
                                                <span className="font-mono text-green-500/70">₹{(o.amount || 0).toFixed(0)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {person.previousBalance !== 0 && (
                                    <div className="flex justify-between items-center text-xs text-zinc-600 italic border-t border-zinc-800/30 pt-1 mt-1">
                                        <span>Previous Balance</span>
                                        <span>₹{(person.previousBalance || 0).toFixed(0)}</span>
                                    </div>
                                )}
                                {person.owes.length === 0 && person.isOwedBy.length === 0 && person.previousBalance === 0 && (
                                    <p className="text-xs text-zinc-600 text-center py-2">No active dues</p>
                                )}
                            </div>

                            {/* History Scroll Area */}
                            <div className="bg-zinc-950/30 rounded-xl border border-zinc-800/30 p-3 mb-4 h-32 flex flex-col min-w-0">
                                <div className="flex items-center gap-2 mb-2 text-[10px] text-zinc-500 uppercase font-bold tracking-wider flex-shrink-0">
                                    <History size={10} /> Recent Activity
                                </div>
                                <div className="overflow-y-auto scrollbar-hide flex-1">
                                    {person.history.length === 0 ? (
                                        <p className="text-zinc-600 text-xs text-center py-4 italic">No recent history</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {person.history.map(hist => (
                                                <div key={hist.id} className="flex justify-between items-center text-[10px] sm:text-xs gap-2">
                                                    <div className="flex items-center gap-2 overflow-hidden min-w-0">
                                                        <span className="text-zinc-500 font-mono text-[9px] sm:text-[10px] shrink-0">
                                                            {new Date(hist.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}
                                                        </span>
                                                        <span className={`truncate ${hist.type === 'settlement' ? 'text-green-400' : 'text-zinc-300'}`}>
                                                            {hist.description}
                                                        </span>
                                                    </div>
                                                    <span className={`font-medium shrink-0 ${hist.type === 'settlement' ? 'text-green-500' : 'text-red-400'}`}>
                                                        {hist.type === 'settlement' ? '' : '+'}{hist.amount > 0 ? `₹${(hist.amount || 0).toFixed(0)}` : `₹${Math.abs(hist.amount || 0).toFixed(0)}`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => settlePerson(person.id)}
                                    disabled={Math.abs(person.totalDue) < 1}
                                    className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${person.totalDue > 1
                                        ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20 active:scale-[0.98]'
                                        : person.totalDue < -1
                                            ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20 active:scale-[0.98]'
                                            : 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed'
                                        }`}
                                >
                                    {person.totalDue > 1 ? (
                                        <><Check size={16} /> Settle Balance</>
                                    ) : person.totalDue < -1 ? (
                                        <><Check size={16} /> Settle Balance</>
                                    ) : (
                                        <><Check size={16} /> All Settled</>
                                    )}
                                </button>


                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </section>
    );
}
