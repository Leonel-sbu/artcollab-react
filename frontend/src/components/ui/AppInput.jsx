// src/components/ui/AppInput.jsx
/**
 * AppInput - Consistent input component with label and error handling
 */
import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const AppInput = forwardRef(function AppInput(
    {
        label,
        error,
        hint,
        icon: Icon,
        className = '',
        containerClassName = '',
        type = 'text',
        ...props
    },
    ref
) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className={`w-full ${containerClassName}`}>
            {label && (
                <label className="block text-sm font-medium text-surface-300 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
                        <Icon className="w-5 h-5" />
                    </div>
                )}
                <input
                    ref={ref}
                    type={inputType}
                    className={`
            w-full bg-surface-800 border rounded-xl
            text-white placeholder:text-surface-500
            transition-all duration-200
            focus:outline-none focus:ring-2
            ${Icon ? 'pl-11 pr-11' : 'px-4'}
            ${isPassword ? 'pr-11' : ''}
            py-3 
            ${error
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-surface-600 focus:border-brand-500 focus:ring-brand-500/20'
                        }
            ${className}
          `}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                )}
            </div>
            {error && (
                <p className="mt-1.5 text-sm text-red-400">{error}</p>
            )}
            {hint && !error && (
                <p className="mt-1.5 text-sm text-surface-500">{hint}</p>
            )}
        </div>
    );
});

/**
 * AppTextarea - Multi-line text input
 */
export const AppTextarea = forwardRef(function AppTextarea(
    { label, error, hint, className = '', containerClassName = '', rows = 4, ...props },
    ref
) {
    return (
        <div className={`w-full ${containerClassName}`}>
            {label && (
                <label className="block text-sm font-medium text-surface-300 mb-2">
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                rows={rows}
                className={`
          w-full bg-surface-800 border rounded-xl
          text-white placeholder:text-surface-500
          px-4 py-3
          transition-all duration-200
          focus:outline-none focus:ring-2
          ${error
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-surface-600 focus:border-brand-500 focus:ring-brand-500/20'
                    }
          ${className}
        `}
                {...props}
            />
            {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
            {hint && !error && <p className="mt-1.5 text-sm text-surface-500">{hint}</p>}
        </div>
    );
});

/**
 * AppSelect - Dropdown select input
 */
export const AppSelect = forwardRef(function AppSelect(
    { label, error, hint, options = [], placeholder = 'Select...', className = '', containerClassName = '', ...props },
    ref
) {
    return (
        <div className={`w-full ${containerClassName}`}>
            {label && (
                <label className="block text-sm font-medium text-surface-300 mb-2">
                    {label}
                </label>
            )}
            <select
                ref={ref}
                className={`
          w-full bg-surface-800 border rounded-xl
          text-white
          px-4 py-3
          transition-all duration-200
          focus:outline-none focus:ring-2
          ${error
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-surface-600 focus:border-brand-500 focus:ring-brand-500/20'
                    }
          ${className}
        `}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled className="bg-surface-800">
                        {placeholder}
                    </option>
                )}
                {options.map((opt) => (
                    <option
                        key={opt.value}
                        value={opt.value}
                        className="bg-surface-800"
                    >
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
            {hint && !error && <p className="mt-1.5 text-sm text-surface-500">{hint}</p>}
        </div>
    );
});
