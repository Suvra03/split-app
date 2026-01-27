import { useSplit } from '../../contexts/SplitContext';
import { GlassCard } from '../common/GlassCard';
import { Check, Clock, TrendingUp, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BalanceCards() {
    const { people, items, settlePerson } = useSplit();

    // Calculate balances functionality
    const balances = people.map(person => {
        // usually we track what friends owe Suvra, but if Suvra also wants to see his own "expense share", we just verify the math.
        // The "Total Due" for Suvra in this logic is "How much Suvra SHOULD pay" to the pool vs "How much Suvra PAID"? 
        // Currently 'totalDue' logic is: calculated share + previous balance. 
        // For simple split apps where one person pays everything and splits later, "Suvra" usually pays upfront.
        // But if this is just "What is everyone's share", then showing Suvra is fine.
        // I will just remove the filter.


        let currentShare = 0;
        items.forEach(item => {
            if (item.assignedTo.includes(person.id)) {
                currentShare += (item.type === 'personal' ? item.price : item.price / item.assignedTo.length);
            }
        });

        const totalDue = currentShare + (person.previousBalance || 0);

        return {
            ...person,
            totalDue,
            history: person.history || []
        };
    }).filter(Boolean);

    if (balances.length === 0) return null;

    return (
        <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3 tracking-wide px-1">
                <span className="p-2 bg-green-500/10 text-green-400 rounded-xl ring-1 ring-green-500/20"><TrendingUp size={18} /></span>
                Active Balances
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {balances.map((person, idx) => (
                    <GlassCard key={person.id} delay={idx * 0.1} className="bg-zinc-900/40 border-zinc-800/40 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            <span className="text-6xl grayscale opacity-10 select-none">{person.emoji}</span>
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-2xl border border-zinc-700/50 shadow-inner">
                                        {person.emoji}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white leading-none mb-1">{person.name}</h3>
                                        <p className="text-xs text-zinc-500 font-medium">Friend</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5">Due</p>
                                    <p className={`text-2xl font-bold ${person.totalDue > 0 ? 'text-white' : 'text-green-400'}`}>
                                        ₹{Math.max(0, person.totalDue).toFixed(0)}
                                    </p>
                                </div>
                            </div>

                            {/* History Scroll Area */}
                            <div className="bg-zinc-950/30 rounded-xl border border-zinc-800/30 p-3 h-32 overflow-y-auto mb-4 scrollbar-hide">
                                <div className="flex items-center gap-2 mb-2 text-[10px] text-zinc-500 uppercase font-bold tracking-wider sticky top-0 bg-transparent backdrop-blur-sm">
                                    <History size={10} /> Recent Activity
                                </div>
                                {person.history.length === 0 ? (
                                    <p className="text-zinc-600 text-xs text-center py-8 italic">No recent history</p>
                                ) : (
                                    <div className="space-y-2">
                                        {person.history.map(hist => (
                                            <div key={hist.id} className="flex justify-between items-center text-xs">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <span className="text-zinc-500 font-mono text-[10px] whitespace-nowrap">
                                                        {new Date(hist.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}
                                                    </span>
                                                    <span className={`truncate ${hist.type === 'settlement' ? 'text-green-400' : 'text-zinc-300'}`}>
                                                        {hist.description}
                                                    </span>
                                                </div>
                                                <span className={`font-medium whitespace-nowrap ${hist.type === 'settlement' ? 'text-green-500' : 'text-red-400'}`}>
                                                    {hist.type === 'settlement' ? '' : '+'}{hist.amount > 0 ? `₹${hist.amount.toFixed(0)}` : `₹${Math.abs(hist.amount).toFixed(0)}`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => settlePerson(person.id)}
                                disabled={person.totalDue <= 0}
                                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${person.totalDue > 0
                                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20 active:scale-[0.98]'
                                    : 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed'
                                    }`}
                            >
                                {person.totalDue > 0 ? (
                                    <><Check size={16} /> Clear Due</>
                                ) : (
                                    <><Check size={16} /> All Settled</>
                                )}
                            </button>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </section>
    );
}
