// src/components/ui/SurfaceCard.jsx
/**
 * SurfaceCard - Consistent card component with elegant dark surfaces
 */
import { motion } from 'framer-motion';

export function SurfaceCard({
    children,
    className = '',
    hover = false,
    padding = 'default', // 'none' | 'default' | 'large'
    onClick,
}) {
    const paddingClasses = {
        none: '',
        default: 'p-4 sm:p-5',
        large: 'p-6 sm:p-8',
    };

    const Component = hover ? motion.div : 'div';
    const hoverProps = hover ? {
        whileHover: { scale: 1.01 },
        transition: { duration: 0.2 },
    } : {};

    return (
        <Component
            className={`
        bg-surface-800/60 
        border border-surface-700/50 
        rounded-2xl 
        shadow-card
        ${hover ? 'cursor-pointer transition-shadow hover:shadow-card-hover' : ''}
        ${paddingClasses[padding]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
            onClick={onClick}
            {...hoverProps}
        >
            {children}
        </Component>
    );
}

/**
 * SurfaceCardHeader - Card header with title and optional action
 */
export function SurfaceCardHeader({ title, subtitle, action, className = '' }) {
    return (
        <div className={`flex items-start justify-between mb-4 ${className}`}>
            <div>
                {subtitle && <p className="text-sm text-surface-400 mb-1">{subtitle}</p>}
                <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}

/**
 * SurfaceCardFooter - Card footer for actions
 */
export function SurfaceCardFooter({ children, className = '' }) {
    return (
        <div className={`mt-4 pt-4 border-t border-surface-700/50 ${className}`}>
            {children}
        </div>
    );
}
