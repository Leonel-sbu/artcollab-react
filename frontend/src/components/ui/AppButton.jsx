// src/components/ui/AppButton.jsx
/**
 * AppButton - Consistent button component with multiple variants
 */
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export const AppButton = forwardRef(function AppButton(
    {
        children,
        variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger'
        size = 'default', // 'small' | 'default' | 'large'
        loading = false,
        disabled = false,
        className = '',
        icon: Icon,
        iconPosition = 'left',
        fullWidth = false,
        ...props
    },
    ref
) {
    // Variant styles - elegant, not loud
    const variantClasses = {
        primary: `
      bg-brand-500 hover:bg-brand-600 
      text-white font-medium
      shadow-lg shadow-brand-500/20
      hover:shadow-brand-500/30
      focus:ring-2 focus:ring-brand-500/50
    `,
        secondary: `
      bg-surface-700 hover:bg-surface-600
      text-white font-medium
      border border-surface-600
      focus:ring-2 focus:ring-surface-500/50
    `,
        ghost: `
      bg-transparent hover:bg-surface-700/50
      text-surface-300 hover:text-white
      focus:ring-2 focus:ring-surface-500/30
    `,
        danger: `
      bg-red-500/20 hover:bg-red-500/30
      text-red-400
      border border-red-500/30
      focus:ring-2 focus:ring-red-500/30
    `,
    };

    // Size styles
    const sizeClasses = {
        small: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
        default: 'px-4 py-2.5 text-sm rounded-xl gap-2',
        large: 'px-6 py-3 text-base rounded-xl gap-2.5',
    };

    return (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={`
        inline-flex items-center justify-center
        font-medium transition-all duration-200
        focus:outline-none focus:ring-offset-2 focus:ring-offset-surface-900
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            {...props}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <>
                    {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
                    {children}
                    {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
                </>
            )}
        </button>
    );
});

/**
 * AppButtonGroup - Group of buttons with consistent spacing
 */
export function AppButtonGroup({ children, className = '', vertical = false }) {
    return (
        <div
            className={`
        flex ${vertical ? 'flex-col' : 'flex-row'} 
        gap-2 ${vertical ? 'w-full' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
}
