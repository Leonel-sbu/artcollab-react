// src/components/shared/nav/NavLogo.jsx
/**
 * NavLogo - Brand logo for navigation
 */
import { Link } from 'react-router-dom';

export function NavLogo({ className = '' }) {
    return (
        <Link
            to="/"
            className={`flex items-center gap-3 ${className}`}
        >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold flex items-center justify-center">
                A
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent">
                ArtCollab
            </span>
        </Link>
    );
}
