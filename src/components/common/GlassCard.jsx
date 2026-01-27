import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export function GlassCard({ children, className, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            className={cn(
                "bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-4 sm:p-6 shadow-xl",
                className
            )}
        >
            {children}
        </motion.div>
    );
}
