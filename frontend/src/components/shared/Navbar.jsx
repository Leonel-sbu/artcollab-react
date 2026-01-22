// src/components/shared/Navbar.jsx
import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    Menu,
    X,
    Upload,
    User,
    ShoppingCart,
    Settings,
    LogOut,
    ChevronDown
} from 'lucide-react'

const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'VR Studio', path: '/vr-studio' },
    { name: 'Learn', path: '/learn' },
    { name: 'Services', path: '/services' },
    { name: 'Community', path: '/community' }
]

const Navbar = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const [mobileOpen, setMobileOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

    const userInitial =
        user?.displayName?.charAt(0).toUpperCase() ||
        user?.email?.charAt(0).toUpperCase() ||
        'U'

    const handleLogout = () => {
        logout()
        setDropdownOpen(false)
        setMobileOpen(false)
        navigate('/')
    }

    useEffect(() => {
        const closeDropdown = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', closeDropdown)
        return () => document.removeEventListener('mousedown', closeDropdown)
    }, [])

    return (
        <nav className="fixed top-0 w-full z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold flex items-center justify-center">
                            A
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            ArtCollab
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-4">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-lg font-medium transition ${isActive
                                        ? 'bg-blue-500/20 text-white border border-blue-500/30'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                                    }`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}

                        {user && (
                            <>
                                <Link
                                    to="/upload"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 transition"
                                >
                                    <Upload className="w-4 h-4" />
                                    Upload
                                </Link>

                                {/* User Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold">
                                            {userInitial}
                                        </div>
                                        <ChevronDown
                                            className={`w-4 h-4 transition ${dropdownOpen ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </button>

                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-gray-900 border border-gray-800 shadow-xl overflow-hidden">
                                            <div className="p-4 border-b border-gray-800">
                                                <p className="text-white font-medium">
                                                    {user.displayName || 'Artist'}
                                                </p>
                                                <p className="text-gray-400 text-sm truncate">
                                                    {user.email}
                                                </p>
                                            </div>

                                            <div className="p-2 space-y-1">
                                                <NavItem to="/profile" icon={User} text="Profile" />
                                                <NavItem to="/cart" icon={ShoppingCart} text="Cart" />
                                                <NavItem to="/settings" icon={Settings} text="Settings" />
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-gray-800"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-800"
                    >
                        {mobileOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="md:hidden py-4 border-t border-gray-800 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setMobileOpen(false)}
                                className="block px-4 py-2 rounded-lg hover:bg-gray-800"
                            >
                                {link.name}
                            </Link>
                        ))}

                        {user && (
                            <>
                                <Link
                                    to="/upload"
                                    className="block px-4 py-2 text-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Upload Art
                                </Link>

                                <div className="pt-4 border-t border-gray-800 space-y-2">
                                    <MobileItem to="/profile" text="Profile" />
                                    <MobileItem to="/cart" text="Cart" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 rounded-lg text-red-400 hover:bg-gray-800"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    )
}

const NavItem = ({ to, icon: Icon, text }) => (
    <Link
        to={to}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white"
    >
        <Icon className="w-4 h-4" />
        {text}
    </Link>
)

const MobileItem = ({ to, text }) => (
    <Link
        to={to}
        className="block px-4 py-2 rounded-lg hover:bg-gray-800"
    >
        {text}
    </Link>
)

export default Navbar
