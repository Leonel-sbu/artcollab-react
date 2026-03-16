// src/components/ui/SectionHeader.jsx
/**
 * SectionHeader - Consistent section titles with optional actions
 */
import { motion } from 'framer-motion';

export function SectionHeader({
    title,
    subtitle,
    action,
    className = '',
    align = 'left' // 'left' | 'center' | 'right'
}) {
    const alignClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 ${alignClasses[align]} ${className}`}
        >
            <div className={alignClasses[align]}>
                {subtitle ? (
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white">{title}</h2>
                        <p className="text-surface-400 mt-1 text-sm sm:text-base">{subtitle}</p>
                    </div>
                ) : (
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">{title}</h2>
                )}
            </div>
            {action && <div className={alignClasses[align]}>{action}</div>}
        </motion.div>
    );
}
