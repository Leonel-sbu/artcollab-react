// src/components/shared/nav/NavLinks.jsx
/**
 * NavLinks - Desktop navigation links
 */
import { NavLink } from 'react-router-dom';

const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'VR Studio', path: '/vr-studio' },
    { name: 'Learn', path: '/learn' },
    { name: 'Services', path: '/services' },
    { name: 'Community', path: '/community' }
];

export function NavLinks({ className = '' }) {
    return (
        <div className={`hidden md:flex items-center gap-2 ${className}`}>
            {navLinks.map((link) => (
                <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) =>
                        `px-4 py-2 rounded-lg font-medium transition ${isActive
                            ? 'bg-brand-500/20 text-white border border-brand-500/30'
                            : 'text-surface-300 hover:text-white hover:bg-surface-800/50'
                        }`
                    }
                >
                    {link.name}
                </NavLink>
            ))}
        </div>
    );
}

export { navLinks };
