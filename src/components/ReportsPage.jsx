import { useSplit } from '../contexts/SplitContext';
import { GlassCard } from './common/GlassCard';
import { ArrowLeft, Calendar, FileText, ChevronDown, ChevronUp, User, Users, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';

function ReportCard({ report, index, onDelete }) {
    const [expanded, setExpanded] = useState(false);

    // ... (rest of component logic unchanged)

    // Calculate Balances for this Snapshot (copy logic for safe replacement or assume rest is same)
    const breakdown = report.peopleState.map(person => {
        let totalShare = 0;
        report.items.forEach(item => {
            if (item.assignedTo.includes(person.id)) {
                if (item.type === 'personal') {
                    totalShare += item.price;
                } else {
                    totalShare += item.price / item.assignedTo.length;
                }
            }
        });
        return { ...person, totalShare };
    });

    return (
        <GlassCard delay={index * 0.1} className="bg-zinc-900/40 border-zinc-800/40 overflow-hidden group">
            {/* Header */}
            <div
                className="flex justify-between items-center p-1"
            >
                <div onClick={() => setExpanded(!expanded)} className="flex items-center gap-4 flex-1 cursor-pointer">
                    <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-col flex-col items-center justify-center border border-zinc-700/50 shadow-inner">
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
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-3">User Balances</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {breakdown.map(p => (
                                        <div key={p.id} className="bg-zinc-950/30 p-3 rounded-xl border border-zinc-800/30 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{p.emoji}</span>
                                                <span className="text-sm font-medium text-zinc-300">{p.name}</span>
                                            </div>
                                            <span className="text-sm font-bold text-green-400">₹{p.totalShare.toFixed(0)}</span>
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
