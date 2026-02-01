import { useSplit } from '../../contexts/SplitContext';
import { Calculator, ArrowRight, Save, Check } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Summary() {
    const { people, items, archiveSession, settlePerson } = useSplit();
    const navigate = useNavigate();

    const breakdown = people.map(person => {
        let shares = [];
        let totalPaid = 0;

        items.forEach(item => {
            // 1. Calculate Individual Item Share
            if (item.assignedTo && item.assignedTo.includes(person.id)) {
                const myShare = (item.type === 'personal' ? item.price : item.price / (item.assignedTo.length || 1));
                shares.push(myShare);
            }

            // 2. Track what this person paid
            const owner = people.find(p => p.isOwner) || people[0];
            const payerId = item.paidBy || (owner ? owner.id : '1');
            if (payerId === person.id) {
                totalPaid += item.price;
            }
        });

        const expenseScope = shares.reduce((a, b) => a + b, 0);
        const previous = person.previousBalance || 0;
        const netDue = expenseScope - totalPaid + previous;

        return {
            ...person,
            shares,
            totalPaid,
            netDue
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

            <div className="overflow-x-auto rounded-2xl border border-zinc-800/40 bg-zinc-950/20 scrollbar-hide">
                <table className="w-full text-left text-sm border-collapse min-w-[300px]">
                    <thead>
                        <tr className="bg-zinc-900/40 text-zinc-500 text-[9px] sm:text-xs uppercase tracking-wider">
                            <th className="p-3 font-bold">Person</th>
                            <th className="p-3 text-right font-bold w-1/2">Net Due (Breakdown = Total)</th>
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
                                <td className="p-3 font-medium text-zinc-200">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base sm:text-lg bg-zinc-800/40 w-6 h-6 flex items-center justify-center rounded border border-zinc-700/30 shrink-0">{person.emoji}</span>
                                        <div className="flex flex-col min-w-0">
                                            <span className="truncate text-xs sm:text-sm">{person.name}</span>
                                        </div>
                                    </div>
                                </td>

                                <td className="p-3 text-right font-bold relative group/cell">
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center justify-end gap-2">
                                            {person.netDue > 1 && (
                                                <button
                                                    onClick={() => settlePerson(person.id)}
                                                    className="opacity-100 sm:opacity-0 sm:group-hover/cell:opacity-100 p-1 rounded-full bg-green-500 hover:bg-green-400 text-white transition-all shadow-lg transform active:scale-90"
                                                    title="Settle Up"
                                                >
                                                    <Check size={10} />
                                                </button>
                                            )}

                                            {person.shares.length > 0 ? (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] sm:text-xs text-zinc-500 font-mono tracking-tighter">
                                                        {person.shares.map(s => `₹${(s || 0).toFixed(0)}`).join(' + ')}
                                                        {(person.previousBalance || 0) > 0 && ` + ₹${(person.previousBalance || 0).toFixed(0)} (old)`}
                                                    </span>
                                                    <span className={`text-xs sm:text-sm ${person.netDue > 0 ? 'text-green-400' : 'text-blue-400'}`}>
                                                        {person.netDue > 0 ? `₹${(person.netDue || 0).toFixed(0)}` : person.totalPaid > 0 ? `PAID ₹${(person.totalPaid || 0).toFixed(0)}` : 'SETTLED'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className={`text-xs sm:text-sm ${person.totalPaid > 0 ? 'text-blue-400' : 'text-zinc-600'}`}>
                                                    {person.totalPaid > 0 ? `PAID ₹${person.totalPaid.toFixed(0)}` : 'No Activity'}
                                                </span>
                                            )}
                                        </div>
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
