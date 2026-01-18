import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Navbar = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const [mobileOpen, setMobileOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

    const handleLogout = () => {
        logout()
        setDropdownOpen(false)
        setMobileOpen(false)
        navigate('/')
    }

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Marketplace', path: '/marketplace' },
        { name: 'VR Studio', path: '/vr' },
        { name: 'Learn', path: '/learn' },
        { name: 'Services', path: '/services' },
        { name: 'Community', path: '/community' }
    ]

    const userInitial =
        user?.displayName?.charAt(0).toUpperCase() ||
        user?.email?.charAt(0).toUpperCase() ||
        'U'

    return (
        <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur border-b border-gray-800">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                            A
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                            ArtCollab
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-4">
                        {navLinks.map(link => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded-lg font-medium transition ${isActive
                                        ? 'text-white bg-gray-800'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                                    }`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}

                        {user && (
                            <Link
                                to="/create"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl hover:opacity-90 transition"
                            >
                                <span className="text-lg">＋</span> upload
                            </Link>
                        )}

                        {/* User Dropdown */}
                        {user && (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white font-semibold flex items-center justify-center hover:opacity-90 transition"
                                >
                                    {userInitial}
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden">

                                        <div className="p-4 border-b border-gray-800">
                                            <p className="text-white font-medium">
                                                {user.displayName || 'Artist'}
                                            </p>
                                            <p className="text-gray-400 text-sm">{user.email}</p>
                                        </div>

                                        <div className="p-2">
                                            <Link
                                                to="/cart"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition"
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                                    />
                                                </svg>
                                                Cart
                                            </Link>
                                            <Link
                                                to="/profile"
                                                onClick={() => setDropdownOpen(false)}
                                                className="block px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition"
                                            >
                                                Profile
                                            </Link>
                                            <Link
                                                to="/settings"
                                                onClick={() => setDropdownOpen(false)}
                                                className="block px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition"
                                            >
                                                Settings
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-3 py-2 rounded-lg text-red-400 hover:bg-gray-800 transition"
                                            >
                                                Logout
                                            </button>
                                        </div>

                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar