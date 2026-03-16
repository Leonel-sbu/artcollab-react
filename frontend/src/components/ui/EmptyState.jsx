// src/components/ui/EmptyState.jsx
/**
 * EmptyState - Consistent empty state component
 */
import { motion } from 'framer-motion';
import { AppButton } from './AppButton';

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    actionLabel = 'Get Started',
    className = '',
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
        flex flex-col items-center justify-center
        py-12 px-4 text-center
        ${className}
      `}
        >
            {Icon && (
                <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-surface-500" />
                </div>
            )}
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            {description && (
                <p className="text-surface-400 max-w-sm mb-6">{description}</p>
            )}
            {action && (
                <AppButton onClick={action}>
                    {actionLabel}
                </AppButton>
            )}
        </motion.div>
    );
}
