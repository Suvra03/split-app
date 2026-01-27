import { useState } from 'react';
import { useSplit } from '../../contexts/SplitContext';
import { Trash2, Plus, User } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function PeopleManager() {
    const { people, addPerson, deletePerson } = useSplit();
    const [newName, setNewName] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        if (newName.trim()) {
            addPerson(newName.trim());
            setNewName('');
        }
    };

    return (
        <GlassCard delay={0.1} className="bg-zinc-900/40 border border-zinc-800/40 shadow-xl backdrop-blur-md">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-wide">Friends</h2>
                    <p className="text-zinc-500 text-xs mt-1 font-medium">{people.length} Active</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center shadow-inner ring-1 ring-green-500/20">
                    <User size={20} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {people.map(person => (
                        <motion.div
                            key={person.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`flex items-center justify-between p-2 rounded-2xl border transition-all group ${person.isOwner
                                ? 'bg-green-900/10 border-green-500/20 shadow-sm'
                                : 'bg-zinc-800/30 border-zinc-700/30 hover:bg-zinc-800/50 hover:border-zinc-600/50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center bg-zinc-800/50 rounded-full text-base shadow-sm border border-zinc-700/50">
                                    {person.emoji}
                                </div>
                                <div>
                                    <p className={`font-medium text-sm ${person.isOwner ? 'text-green-200' : 'text-zinc-200'}`}>
                                        {person.name}
                                    </p>
                                    {person.isOwner && <p className="text-[9px] uppercase tracking-wider text-green-400/60 font-bold">You</p>}
                                </div>
                            </div>

                            <button
                                onClick={() => deletePerson(person.id)}
                                className="text-zinc-500 hover:text-red-400 transition-colors p-1.5 opacity-0 group-hover:opacity-100"
                                aria-label="Remove person"
                            >
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <form onSubmit={handleAdd} className="relative group">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Add a friend..."
                    className="w-full bg-zinc-950/30 border border-zinc-800/50 text-zinc-200 rounded-2xl pl-4 pr-12 py-3.5 outline-none focus:border-green-500/30 focus:ring-1 focus:ring-green-500/20 transition-all placeholder:text-zinc-600 shadow-inner"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-2 p-1.5 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-all shadow-lg shadow-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                    disabled={!newName.trim()}
                >
                    <Plus size={20} />
                </button>
            </form>
        </GlassCard>
    );
}
