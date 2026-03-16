// src/components/admin/AdminSidebar.jsx
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Image,
    ShoppingCart,
    BookOpen,
    AlertTriangle,
    Settings,
    BarChart3,
    MessageSquare,
    Bell
} from "lucide-react";

const adminLinks = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Overview", path: "/admin/overview", icon: BarChart3 },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Artworks", path: "/admin/artworks", icon: Image },
    { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
    { name: "Courses", path: "/admin/courses", icon: BookOpen },
    { name: "Reports", path: "/admin/reports", icon: AlertTriangle },
    { name: "Messages", path: "/admin/messages", icon: MessageSquare },
    { name: "Notifications", path: "/admin/notifications", icon: Bell },
    { name: "Settings", path: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ isOpen = true }) {
    return (
        <aside className={`bg-gray-900 border-r border-gray-800 min-h-screen transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
            {/* Logo */}
            <div className="p-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        A
                    </div>
                    {isOpen && (
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Admin
                        </span>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
                {adminLinks.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "text-gray-400 hover:text-white hover:bg-gray-800"
                            }`
                        }
                    >
                        <link.icon className="w-5 h-5 flex-shrink-0" />
                        {isOpen && <span className="font-medium">{link.name}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
                <NavLink
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition"
                >
                    <span className="w-5 h-5">←</span>
                    {isOpen && <span>Back to Site</span>}
                </NavLink>
            </div>
        </aside>
    );
}
