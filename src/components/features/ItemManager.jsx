import { useState } from 'react';
import { useSplit } from '../../contexts/SplitContext';
import { ShoppingBag, Plus, Trash2, User, Users, Check } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function ItemManager() {
    const { people, items, addItem, deleteItem } = useSplit();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [type, setType] = useState('personal');
    const [assignedTo, setAssignedTo] = useState([]);

    const togglePerson = (id) => {
        if (assignedTo.includes(id)) {
            setAssignedTo(assignedTo.filter(p => p !== id));
        } else {
            setAssignedTo([...assignedTo, id]);
        }
    };

    const selectAll = () => {
        if (assignedTo.length === people.length) {
            setAssignedTo([]);
        } else {
            setAssignedTo(people.map(p => p.id));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !price) return;

        let finalAssigned = assignedTo;
        if (finalAssigned.length === 0) {
            alert("Please assign to someone.");
            return;
        }

        addItem({
            name,
            price: parseFloat(price),
            type,
            assignedTo: finalAssigned
        });
        setName('');
        setPrice('');
        setAssignedTo([]);
        setType('personal');
    };

    return (
        <GlassCard delay={0.2} className="bg-zinc-900/40 border border-zinc-800/40 shadow-xl backdrop-blur-md">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3 tracking-wide">
                <span className="p-2 bg-green-500/10 text-green-400 rounded-xl ring-1 ring-green-500/20"><ShoppingBag size={18} /></span>
                Items
            </h2>

            {/* Add Item Form */}
            <form onSubmit={handleSubmit} className="mb-8 space-y-5">
                <div className="grid grid-cols-5 gap-3">
                    <div className="col-span-3">
                        <label className="block text-xs uppercase text-zinc-500 mb-1 ml-1 font-bold tracking-wider">Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Milk"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-zinc-950/30 border border-zinc-800/50 text-zinc-100 rounded-xl px-4 py-3 outline-none focus:border-green-500/30 focus:ring-1 focus:ring-green-500/20 transition-all placeholder:text-zinc-600"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs uppercase text-zinc-500 mb-1 ml-1 font-bold tracking-wider">Price</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-zinc-500">₹</span>
                            <input
                                type="number"
                                placeholder="0"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                className="w-full bg-zinc-950/30 border border-zinc-800/50 text-zinc-100 rounded-xl pl-7 pr-3 py-3 outline-none focus:border-green-500/30 focus:ring-1 focus:ring-green-500/20 transition-all placeholder:text-zinc-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Type Toggle */}
                <div className="bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-800/50 flex gap-3 relative">
                    <button
                        type="button"
                        onClick={() => { setType('personal'); setAssignedTo([]); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${type === 'personal' ? 'bg-zinc-800 text-white shadow-md ring-1 ring-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <User size={16} /> Personal
                    </button>
                    <button
                        type="button"
                        onClick={() => { setType('shared'); setAssignedTo(people.map(p => p.id)); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${type === 'shared' ? 'bg-zinc-800 text-white shadow-md ring-1 ring-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <Users size={16} /> Shared
                    </button>
                </div>

                {/* Assignment Selection */}
                <div className="bg-zinc-900/30 p-3 rounded-xl border border-zinc-800/30">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-xs uppercase font-bold text-zinc-500 tracking-wider">
                            {type === 'personal' ? 'Assign To' : 'Split Among'}
                        </p>
                        {type === 'shared' && (
                            <button
                                type="button"
                                onClick={selectAll}
                                className="text-xs text-green-400 hover:text-green-300 transition-colors"
                            >
                                {assignedTo.length === people.length ? 'None' : 'All'}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {people.map(person => {
                            const isSelected = assignedTo.includes(person.id);
                            return (
                                <button
                                    key={person.id}
                                    type="button"
                                    onClick={() => {
                                        if (type === 'personal') {
                                            setAssignedTo([person.id]);
                                        } else {
                                            togglePerson(person.id);
                                        }
                                    }}
                                    className={`relative pl-2 pr-3 py-2 rounded-lg border text-xs flex items-center justify-center gap-1.5 transition-all duration-200 ${isSelected
                                        ? 'bg-green-500/10 border-green-500/30 text-green-300'
                                        : 'bg-zinc-950/30 border-zinc-800/50 text-zinc-500 hover:border-zinc-700'
                                        }`}
                                >
                                    <span>{person.emoji}</span>
                                    <span className="truncate max-w-[60px]">{person.name}</span>
                                    {isSelected && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-0 right-0 p-0.5"><Check size={8} /></motion.span>}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 transform active:scale-[0.98]"
                >
                    <Plus size={20} /> Add Item
                </button>
            </form>

            {/* Items List */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className="group flex justify-between items-center bg-zinc-800/20 p-4 rounded-xl border border-zinc-800/50 hover:bg-zinc-800/40 hover:border-zinc-700/50 transition-colors"
                        >
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="font-medium text-zinc-200">{item.name}</h3>
                                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${item.type === 'personal'
                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                        }`}>
                                        {item.type}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <p className="text-zinc-400 font-mono text-sm">₹{item.price}</p>
                                    <div className="h-1 w-1 bg-zinc-700 rounded-full" />
                                    <div className="flex -space-x-1.5 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                        {item.assignedTo.map(id => {
                                            const p = people.find(p => p.id === id);
                                            return p ? (
                                                <div key={id} className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px]" title={p.name}>
                                                    {p.emoji}
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => deleteItem(item.id)}
                                className="text-zinc-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                            >
                                <Trash2 size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {items.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8 border-2 border-dashed border-zinc-800/50 rounded-xl"
                    >
                        <ShoppingBag size={32} className="mx-auto text-zinc-700 mb-2" />
                        <p className="text-zinc-600 text-sm">No items yet</p>
                    </motion.div>
                )}
            </div>
        </GlassCard>
    );
}
