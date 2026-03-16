// src/components/shared/nav/NavActions.jsx
/**
 * NavActions - Navigation action icons (notifications, messages, cart, upload)
 */
import { Link } from 'react-router-dom';
import { MessageCircle, ShoppingCart, Upload } from 'lucide-react';

export function NavActions({
    cartCount = 0,
    unreadCount = 0,
    showUserActions = false,
    className = ''
}) {
    if (!showUserActions) return null;

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Link
                to="/messages"
                className="relative p-2 rounded-lg hover:bg-surface-800 transition"
            >
                <MessageCircle className="w-5 h-5 text-surface-300" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Link>

            <Link
                to="/cart"
                className="relative p-2 rounded-lg hover:bg-surface-800 transition"
            >
                <ShoppingCart className="w-5 h-5 text-surface-300" />
                {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {cartCount > 9 ? '9+' : cartCount}
                    </span>
                )}
            </Link>

            <Link
                to="/upload"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:scale-105 transition"
            >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
            </Link>
        </div>
    );
}
