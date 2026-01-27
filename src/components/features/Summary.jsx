import { useSplit } from '../../contexts/SplitContext';
import { Calculator, ArrowRight, Save, Check } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Summary() {
    const { people, items, archiveSession, settlePerson } = useSplit();
    const navigate = useNavigate();

    const breakdown = people.map(person => {
        let expenseScope = 0; // Usage/Consumption
        let amountPaid = 0;   // Contribution

        items.forEach(item => {
            // 1. Calculate Consumption (Expense Scope)
            if (item.assignedTo.includes(person.id)) {
                const myShare = (item.type === 'personal' ? item.price : item.price / item.assignedTo.length);
                expenseScope += myShare;
            }

            // 2. Calculate Paid Amount
            const payerId = item.paidBy || (people.find(p => p.isOwner)?.id || '1');
            if (payerId === person.id) {
                amountPaid += item.price;
            }
        });

        const previous = person.previousBalance || 0;

        // Net Due = (What I ate) - (What I paid) + (Old Debt)
        // Positive = I owe money. Negative = I am owed money.
        const netDue = expenseScope - amountPaid + previous;

        return {
            ...person,
            personalTotal: expenseScope, // Mapping to existing UI usage (though name is slightly off, we use it for expense column)
            sharedTotal: 0,              // Unused now as we combined it
            previous,
            total: netDue
        };
    });

    const currentTotal = items.reduce((sum, item) => sum + item.price, 0);

    const handleExport = () => {
        if (window.confirm("This will archive current items and carry forward balances. Continue?")) {
            archiveSession();
            navigate('/reports');
        }
    };

    return (
        <GlassCard delay={0.3} className="border-t-4 border-t-green-500 bg-zinc-900/40 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3 tracking-wide">
                    <span className="p-2 bg-green-500/10 text-green-400 rounded-xl ring-1 ring-green-500/20"><Calculator size={18} /></span>
                    Summary
                </h2>
                <div className="text-right">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Current Bill</p>
                    <p className="text-3xl font-bold text-white tracking-tight">₹{currentTotal.toFixed(2)}</p>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-zinc-800/40 bg-zinc-950/20">
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="bg-zinc-900/40 text-zinc-500 text-[10px] sm:text-xs uppercase tracking-wider">
                            <th className="p-2 sm:p-3 font-bold">Person</th>
                            <th className="p-2 sm:p-3 text-right font-bold w-[30%] sm:w-1/3 leading-tight">Exp. Scope</th>
                            <th className="p-2 sm:p-3 text-right font-bold w-[30%] sm:w-1/3 bg-zinc-900/60 text-zinc-400">Net Due</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                        {breakdown.map((person, idx) => (
                            <motion.tr
                                key={person.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 + 0.4 }}
                                className="group hover:bg-zinc-800/20 transition-colors"
                            >
                                <td className="p-2 sm:p-3 font-medium text-zinc-200 flex items-center gap-2">
                                    <span className="text-sm sm:text-lg bg-zinc-800/40 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-lg border border-zinc-700/30">{person.emoji}</span>
                                    <span className="truncate max-w-[60px] sm:max-w-none text-xs sm:text-sm">{person.name}</span>
                                    {person.isOwner && <span className="text-[8px] sm:text-[9px] bg-green-900/20 text-green-400 px-1 py-0.5 rounded border border-green-900/30 font-bold tracking-wide">YOU</span>}
                                </td>
                                <td className="p-2 sm:p-3 text-right text-zinc-300 font-bold text-xs sm:text-sm">
                                    ₹{(person.personalTotal + person.sharedTotal).toFixed(0)}
                                </td>
                                <td className="p-2 sm:p-3 text-right font-bold text-green-400 bg-green-500/5 border-l border-zinc-800/40 relative group/cell text-xs sm:text-sm">
                                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                                        {Math.abs(person.total) > 1 && !person.isOwner && (
                                            <button
                                                onClick={() => settlePerson(person.id)}
                                                className={`opacity-100 sm:opacity-0 sm:group-hover/cell:opacity-100 p-1 rounded-full text-white transition-all shadow-lg transform active:scale-90 ${person.total > 0 ? 'bg-green-500 hover:bg-green-400' : 'bg-red-500 hover:bg-red-400'}`}
                                                title="Settle Up"
                                            >
                                                <Check size={10} className="sm:w-3 sm:h-3" />
                                            </button>
                                        )}
                                        {Math.abs(person.total) < 1 && !person.isOwner && (
                                            <span className="text-green-500 flex items-center"><Check size={12} className="sm:w-[14px] sm:h-[14px]" /></span>
                                        )}
                                        <span>₹{Math.max(0, person.total).toFixed(0)}</span>
                                    </div>
                                    <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/5 transition-colors pointer-events-none" />
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Visual */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleExport}
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 text-green-400 px-4 py-2 rounded-lg flex items-center gap-2 transition-all uppercase font-bold tracking-wider hover:shadow-lg hover:shadow-green-900/20 border border-zinc-700 hover:border-green-500/30"
                >
                    <Save size={14} /> Save & Start New
                </button>
            </div>
        </GlassCard>
    );
}
