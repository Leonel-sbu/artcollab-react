// src/components/shared/nav/UserMenu.jsx
/**
 * UserMenu - User dropdown menu with avatar
 */
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    User,
    MessageCircle,
    ShoppingCart,
    LogOut,
    ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function UserMenu({ user, onLogout }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const userInitial =
        user?.displayName?.charAt(0).toUpperCase() ||
        user?.email?.charAt(0).toUpperCase() ||
        'U';

    useEffect(() => {
        const closeDropdown = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', closeDropdown);
        return () => document.removeEventListener('mousedown', closeDropdown);
    }, []);

    const handleLogout = () => {
        onLogout();
        setIsOpen(false);
        navigate('/');
    };

    const menuItems = [
        { to: '/profile', icon: User, text: 'Profile' },
        { to: '/messages', icon: MessageCircle, text: 'Messages' },
        { to: '/cart', icon: ShoppingCart, text: 'Cart' },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-800 transition"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center font-semibold">
                    {userInitial}
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-surface-400 transition ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-surface-900 border border-surface-700 shadow-xl overflow-hidden">
                    <div className="p-4 border-b border-surface-700">
                        <p className="text-white font-medium">
                            {user.displayName || 'Artist'}
                        </p>
                        <p className="text-surface-400 text-sm truncate">
                            {user.email}
                        </p>
                    </div>

                    <div className="p-2 space-y-1">
                        {menuItems.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-surface-300 hover:bg-surface-800 hover:text-white transition"
                            >
                                <item.icon className="w-4 h-4" />
                                {item.text}
                            </Link>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-surface-800 transition"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
