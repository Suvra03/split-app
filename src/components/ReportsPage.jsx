import { useSplit } from '../contexts/SplitContext';
import { GlassCard } from './common/GlassCard';
import { ArrowLeft, Calendar, FileText, ChevronDown, ChevronUp, User, Users, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';

function ReportCard({ report, index, onDelete }) {
    const [expanded, setExpanded] = useState(false);

    // ... (rest of component logic unchanged)

    // Calculate Detailed Debt Breakdown for this Snapshot
    const debtBreakdown = (() => {
        const matrix = {}; // matrix[debtorId][creditorId] = amount
        const people = report.peopleState;

        // Initialize matrix
        people.forEach(p1 => {
            matrix[p1.id] = {};
            people.forEach(p2 => {
                if (p1.id !== p2.id) matrix[p1.id][p2.id] = 0;
            });
        });

        // Calculate debts from items
        report.items.forEach(item => {
            const payerId = item.paidBy || (people.find(p => p.isOwner)?.id || '1');
            const consumers = item.assignedTo;
            const perPersonShare = (item.type === 'personal' ? item.price : item.price / consumers.length);

            consumers.forEach(consumerId => {
                if (consumerId !== payerId && matrix[consumerId]) {
                    matrix[consumerId][payerId] = (matrix[consumerId][payerId] || 0) + perPersonShare;
                }
            });
        });

        // Net the debts (if A owes B 10 and B owes A 5, then A owes B 5)
        const netDebts = {};
        people.forEach(p => { netDebts[p.id] = { name: p.name, emoji: p.emoji, owes: [], isOwedBy: [], totalOwe: 0, totalOwed: 0 }; });

        for (let i = 0; i < people.length; i++) {
            for (let j = i + 1; j < people.length; j++) {
                const idA = people[i].id;
                const idB = people[j].id;

                const aOwesB = matrix[idA][idB] || 0;
                const bOwesA = matrix[idB][idA] || 0;

                if (aOwesB > bOwesA) {
                    const amount = aOwesB - bOwesA;
                    if (amount > 0.5) {
                        netDebts[idA].owes.push({ name: people[j].name, amount });
                        netDebts[idA].totalOwe += amount;
                        netDebts[idB].isOwedBy.push({ name: people[i].name, amount });
                        netDebts[idB].totalOwed += amount;
                    }
                } else if (bOwesA > aOwesB) {
                    const amount = bOwesA - aOwesB;
                    if (amount > 0.5) {
                        netDebts[idB].owes.push({ name: people[i].name, amount });
                        netDebts[idB].totalOwe += amount;
                        netDebts[idA].isOwedBy.push({ name: people[j].name, amount });
                        netDebts[idA].totalOwed += amount;
                    }
                }
            }
        }

        return netDebts;
    })();

    return (
        <GlassCard delay={index * 0.1} className="bg-zinc-900/40 border-zinc-800/40 overflow-hidden group">
            {/* Header */}
            <div
                className="flex justify-between items-center p-1"
            >
                <div onClick={() => setExpanded(!expanded)} className="flex items-center gap-4 flex-1 cursor-pointer">
                    <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex flex-col items-center justify-center border border-zinc-700/50 shadow-inner">
                        <span className="text-xs font-bold text-zinc-500 uppercase">{new Date(report.date).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-lg font-bold text-white leading-none">{new Date(report.date).getDate()}</span>
                    </div>
                    <div>
                        <p className="text-zinc-500 text-xs font-bold tracking-widest uppercase mb-0.5">Report Total</p>
                        <p className="text-2xl font-bold text-white tracking-tight">₹{report.grandTotal.toFixed(0)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(report.id); }}
                        className="p-2 text-zinc-600 hover:text-red-400 hover:bg-white/5 rounded-full transition-all"
                        title="Delete Report"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button onClick={() => setExpanded(!expanded)} className={`p-2 rounded-full transition-all ${expanded ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>
                        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-6 border-t border-zinc-800/50 mt-4 space-y-6">

                            {/* People Breakdown */}
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-3 px-1">User Balances & Debts</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-1">
                                    {Object.entries(debtBreakdown).map(([id, data]) => (
                                        <div key={id} className="bg-zinc-950/30 p-4 rounded-2xl border border-zinc-800/40 flex flex-col gap-3 min-w-0">
                                            <div className="flex items-center justify-between border-b border-zinc-800/30 pb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl shrink-0">{data.emoji}</span>
                                                    <span className="text-sm font-bold text-white truncate">{data.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    {data.totalOwe > 0 ? (
                                                        <span className="text-[10px] items-center gap-1 font-bold text-red-400 flex justify-end">OWES ₹{data.totalOwe.toFixed(0)}</span>
                                                    ) : data.totalOwed > 0 ? (
                                                        <span className="text-[10px] items-center gap-1 font-bold text-green-400 flex justify-end">OWED ₹{data.totalOwed.toFixed(0)}</span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Settled</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-1.5 min-h-[40px]">
                                                {data.owes.length > 0 && (
                                                    <div className="space-y-1">
                                                        {data.owes.map((o, i) => (
                                                            <div key={i} className="flex justify-between items-center text-[11px] text-zinc-400">
                                                                <span>Owes {o.name}</span>
                                                                <span className="font-mono text-zinc-300">₹{o.amount.toFixed(0)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {data.isOwedBy.length > 0 && (
                                                    <div className="space-y-1">
                                                        {data.isOwedBy.map((o, i) => (
                                                            <div key={i} className="flex justify-between items-center text-[11px] text-zinc-500">
                                                                <span>Owed by {o.name}</span>
                                                                <span className="font-mono text-green-500/70">₹{o.amount.toFixed(0)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {data.owes.length === 0 && data.isOwedBy.length === 0 && (
                                                    <p className="text-[10px] text-zinc-600 italic">No debts for this session</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Item List */}
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-3">Itemized History</p>
                                <div className="space-y-2">
                                    {[...report.items].reverse().map(item => {
                                        const payerId = item.paidBy || (report.peopleState.find(p => p.isOwner)?.id || '1');
                                        const payer = report.peopleState.find(p => p.id === payerId);

                                        return (
                                            <div key={item.id} className="flex justify-between items-center text-sm py-2 px-3 hover:bg-zinc-800/20 rounded-lg transition-colors border border-transparent hover:border-zinc-800/30">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 rounded-lg ${item.type === 'personal' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                                        {item.type === 'personal' ? <User size={12} /> : <Users size={12} />}
                                                    </div>
                                                    <div>
                                                        <span className="text-zinc-300 block leading-none mb-0.5">{item.name}</span>
                                                        <span className="text-[10px] text-zinc-600 font-medium">Paid by: {payer ? payer.name : 'Unknown'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex -space-x-1 grayscale opacity-40 scale-75">
                                                        {item.assignedTo.map(uid => {
                                                            const p = report.peopleState.find(ps => ps.id === uid);
                                                            return p ? <div key={uid} className="w-4 h-4 bg-zinc-800 rounded-full flex items-center justify-center text-[8px] border border-zinc-700">{p.emoji}</div> : null
                                                        })}
                                                    </div>
                                                    <span className="font-mono text-zinc-400">₹{item.price}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GlassCard>
    );
}

export default function ReportsPage() {
    const { reports, deleteReport } = useSplit();

    return (
        <div className="min-h-screen bg-black text-zinc-200 p-4 font-inter selection:bg-green-500/30 overflow-x-hidden relative">
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
                <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-green-900/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-lg mx-auto pb-20 pt-8">
                <header className="mb-8 flex items-center gap-4">
                    <Link to="/" className="p-2 bg-zinc-900/50 rounded-full text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold text-white">History & Reports</h1>
                </header>

                <div className="space-y-4">
                    {reports.length === 0 ? (
                        <div className="text-center py-12 opacity-50">
                            <FileText size={48} className="mx-auto mb-4 text-zinc-700" />
                            <p>No reports archived yet.</p>
                        </div>
                    ) : (
                        [...reports].reverse().map((report, idx) => (
                            <ReportCard key={report.id} report={report} index={idx} onDelete={deleteReport} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
