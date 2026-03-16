// src/components/shared/nav/MobileMenu.jsx
/**
 * MobileMenu - Mobile navigation menu
 */
import { Link } from 'react-router-dom';
import { navLinks } from './NavLinks';

export function MobileMenu({ isOpen, onClose, user, onLogout }) {
    if (!isOpen) return null;

    return (
        <div className="md:hidden py-4 border-t border-surface-700 space-y-2">
            {navLinks.map((link) => (
                <Link
                    key={link.name}
                    to={link.path}
                    onClick={onClose}
                    className="block px-4 py-2 rounded-lg text-surface-300 hover:bg-surface-800 hover:text-white transition"
                >
                    {link.name}
                </Link>
            ))}

            {user && (
                <>
                    <Link
                        to="/upload"
                        className="block px-4 py-2 text-center rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 text-white"
                        onClick={onClose}
                    >
                        Upload Art
                    </Link>

                    <div className="pt-4 border-t border-surface-700 space-y-2">
                        <Link
                            to="/profile"
                            onClick={onClose}
                            className="block px-4 py-2 rounded-lg text-surface-300 hover:bg-surface-800"
                        >
                            Profile
                        </Link>
                        <Link
                            to="/cart"
                            onClick={onClose}
                            className="block px-4 py-2 rounded-lg text-surface-300 hover:bg-surface-800"
                        >
                            Cart
                        </Link>
                        <button
                            onClick={() => {
                                onLogout();
                                onClose();
                            }}
                            className="w-full text-left px-4 py-2 rounded-lg text-red-400 hover:bg-surface-800"
                        >
                            Logout
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
