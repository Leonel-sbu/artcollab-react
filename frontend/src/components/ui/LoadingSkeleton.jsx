// src/components/ui/LoadingSkeleton.jsx
/**
 * LoadingSkeleton - Consistent loading placeholder component
 */

/**
 * Generic shimmer skeleton
 */
export function Skeleton({ className = '' }) {
    return (
        <div
            className={`
        animate-pulse bg-surface-700 rounded
        ${className}
      `}
        />
    );
}

/**
 * Text skeleton with optional width
 */
export function TextSkeleton({ lines = 1, className = '' }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
                />
            ))}
        </div>
    );
}

/**
 * Avatar skeleton
 */
export function AvatarSkeleton({ size = 'md', className = '' }) {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-14 h-14',
        xl: 'w-20 h-20',
    };
    return <Skeleton className={`rounded-full ${sizes[size]} ${className}`} />;
}

/**
 * Card skeleton for lists
 */
export function CardSkeleton({ className = '' }) {
    return (
        <div className={`bg-surface-800 rounded-xl p-4 space-y-3 ${className}`}>
            <div className="flex items-center gap-3">
                <AvatarSkeleton size="md" />
                <div className="flex-1">
                    <Skeleton className="h-4 w-1/3 mb-2" />
                    <Skeleton className="h-3 w-1/4" />
                </div>
            </div>
            <TextSkeleton lines={2} />
            <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
            </div>
        </div>
    );
}

/**
 * Table row skeleton
 */
export function TableRowSkeleton({ columns = 4, className = '' }) {
    return (
        <tr className={className}>
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <Skeleton className="h-4" />
                </td>
            ))}
        </tr>
    );
}

/**
 * Form skeleton
 */
export function FormSkeleton({ fields = 3, className = '' }) {
    return (
        <div className={`space-y-4 ${className}`}>
            {Array.from({ length: fields }).map((_, i) => (
                <div key={i}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ))}
            <Skeleton className="h-12 w-full mt-6" />
        </div>
    );
}

/**
 * Grid skeleton for artwork cards
 */
export function GridSkeleton({ count = 4, className = '' }) {
    return (
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
            {Array.from({ count }).map((_, i) => (
                <div key={i} className="bg-surface-800 rounded-xl overflow-hidden">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-3 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Full page loading state
 */
export function PageLoader({ className = '' }) {
    return (
        <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-surface-400 text-sm">Loading...</p>
            </div>
        </div>
    );
}
