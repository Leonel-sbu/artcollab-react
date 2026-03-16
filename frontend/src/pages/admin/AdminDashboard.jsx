import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Palette,
    BookOpen,
    ShoppingCart,
    AlertTriangle,
    TrendingUp,
    DollarSign,
    Eye,
    Check,
    X,
    RefreshCw,
    LogOut,
    Menu,
    BarChart3
} from 'lucide-react';
import { adminService, formatZAR } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Helper to resolve image URL
const resolveImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_BASE}${url}`;
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ users: 0, artworks: 0, courses: 0, orders: 0, openReports: 0 });
    const [users, setUsers] = useState([]);
    const [artworks, setArtworks] = useState([]);
    const [reports, setReports] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        // Check if user is admin
        if (!user || user.role !== 'admin') {
            toast.error('Access denied. Admin privileges required.');
            navigate('/admin/login');
            return;
        }
        loadData();
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes, artworksRes, reportsRes] = await Promise.all([
                adminService.getStats(),
                adminService.getUsers(),
                adminService.getPendingArtworks(),
                adminService.getReports()
            ]);

            if (statsRes.success) setStats(statsRes.stats);
            if (usersRes.success) setUsers(usersRes.items || []);
            if (artworksRes.success) setArtworks(artworksRes.items || []);
            if (reportsRes.success) setReports(reportsRes.items || []);
        } catch (error) {
            console.error('Failed to load admin data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleArtworkAction = async (id, action) => {
        try {
            if (action === 'published') {
                await adminService.approveArtwork(id);
                toast.success('Artwork approved and published to marketplace!');
            } else if (action === 'rejected') {
                await adminService.rejectArtwork(id);
                toast.success('Artwork rejected');
            }
            loadData();
        } catch (error) {
            console.error('Failed to update artwork:', error);
            toast.error('Failed to update artwork');
        }
    };

    const handleReportAction = async (id, status) => {
        try {
            await adminService.updateReportStatus(id, status);
            toast.success(`Report ${status}`);
            loadData();
        } catch (error) {
            toast.error('Failed to update report');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'artworks', label: 'Artworks', icon: Palette },
        { id: 'reports', label: 'Reports', icon: AlertTriangle },
    ];

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-sm">{label}</p>
                    <p className="text-3xl font-bold text-white mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Top Header */}
            <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 text-gray-400 hover:text-white"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold">A</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                                <p className="text-xs text-gray-400">ArtCollab Management</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400 text-sm hidden sm:block">{user?.email}</span>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-200`}>
                    <nav className="p-4 space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
                                <button
                                    onClick={loadData}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard icon={Users} label="Total Users" value={stats.users} color="bg-blue-500/20 text-blue-400" />
                                <StatCard icon={Palette} label="Artworks" value={stats.artworks} color="bg-purple-500/20 text-purple-400" />
                                <StatCard icon={BookOpen} label="Courses" value={stats.courses} color="bg-green-500/20 text-green-400" />
                                <StatCard icon={ShoppingCart} label="Orders" value={stats.orders} color="bg-orange-500/20 text-orange-400" />
                            </div>

                            {/* Pending Reports Alert */}
                            {stats.openReports > 0 && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-4">
                                    <AlertTriangle className="w-8 h-8 text-red-400" />
                                    <div className="flex-1">
                                        <p className="text-white font-medium">{stats.openReports} pending reports need attention</p>
                                        <p className="text-gray-400 text-sm">Review and resolve reports to keep the platform safe</p>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('reports')}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                                    >
                                        Review
                                    </button>
                                </div>
                            )}

                            {/* Recent Activity */}
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <h3 className="text-lg font-semibold text-white mb-4">Recent Users</h3>
                                <div className="space-y-3">
                                    {users.slice(0, 5).map((u) => (
                                        <div key={u._id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{u.name}</p>
                                                    <p className="text-gray-400 text-sm">{u.email}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs ${u.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                                u.role === 'artist' ? 'bg-purple-500/20 text-purple-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white">User Management</h2>
                                <span className="text-gray-400">{users.length} users</span>
                            </div>

                            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {users.map((u) => (
                                            <tr key={u._id} className="hover:bg-gray-700/50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                                            {u.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-white font-medium">{u.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-400">{u.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs ${u.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                                        u.role === 'artist' ? 'bg-purple-500/20 text-purple-400' :
                                                            'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-400 text-sm">
                                                    {new Date(u.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'artworks' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white">Pending Artworks</h2>
                                <span className="text-gray-400">{artworks.length} pending</span>
                            </div>

                            {artworks.length === 0 ? (
                                <div className="text-center py-12">
                                    <Palette className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                                    <p className="text-gray-400">No pending artworks to review</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {artworks.map((artwork) => (
                                        <div key={artwork._id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                            <img
                                                src={resolveImageUrl(artwork.imageUrl)}
                                                alt={artwork.title}
                                                className="w-full h-48 object-cover"
                                            />
                                            <div className="p-4">
                                                <h3 className="text-white font-semibold">{artwork.title}</h3>
                                                <p className="text-gray-400 text-sm">by {artwork.artist?.name}</p>
                                                <p className="text-gray-500 text-xs mt-2">
                                                    {new Date(artwork.createdAt).toLocaleDateString()}
                                                </p>
                                                <div className="flex gap-2 mt-4">
                                                    <button
                                                        onClick={() => handleArtworkAction(artwork._id, 'published')}
                                                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2"
                                                    >
                                                        <Check className="w-4 h-4" /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleArtworkAction(artwork._id, 'rejected')}
                                                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2"
                                                    >
                                                        <X className="w-4 h-4" /> Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white">Content Reports</h2>
                                <span className="text-gray-400">{reports.length} reports</span>
                            </div>

                            {reports.length === 0 ? (
                                <div className="text-center py-12">
                                    <AlertTriangle className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                                    <p className="text-gray-400">No reports to review</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reports.map((report) => (
                                        <div key={report._id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-white font-semibold">{report.title || 'Content Report'}</h3>
                                                    <p className="text-gray-400 mt-1">{report.description || 'No description'}</p>
                                                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                                        <span>By: {report.reporter?.name || 'Unknown'}</span>
                                                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs ${report.status === 'open' ? 'bg-red-500/20 text-red-400' :
                                                    report.status === 'reviewing' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-green-500/20 text-green-400'
                                                    }`}>
                                                    {report.status}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => handleReportAction(report._id, 'resolved')}
                                                    className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                                                >
                                                    Mark Resolved
                                                </button>
                                                <button
                                                    onClick={() => handleReportAction(report._id, 'rejected')}
                                                    className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
