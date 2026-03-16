// src/components/ui/PageContainer.jsx
/**
 * PageContainer - Standard page wrapper with consistent padding and max-width
 */
export function PageContainer({
    children,
    className = '',
    size = 'default', // 'default' | 'wide' | 'narrow' | 'full'
    padding = true
}) {
    const sizeClasses = {
        narrow: 'max-w-3xl',
        default: 'max-w-7xl',
        wide: 'max-w-full',
        full: 'max-w-full px-0',
    };

    return (
        <div
            className={`
        w-full mx-auto 
        ${sizeClasses[size]}
        ${padding ? 'px-4 sm:px-6 lg:px-8 py-6 sm:py-8' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
}
