import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Palette, BookOpen, ShoppingCart, AlertTriangle,
    TrendingUp, DollarSign, Eye, Check, X, RefreshCw, LogOut,
    Menu, BarChart3, Trash2, ChevronLeft, ChevronRight,
    Shield, Star, Clock, Package, FileText, Search,
    CheckCircle, XCircle, Loader, AlertCircle, Globe, GraduationCap, Plus, Info
} from 'lucide-react';
import { adminService, formatZAR } from '../../services/adminService';
import { createCourse } from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ROLES = ['buyer', 'artist', 'learner', 'admin'];

const statusBadge = (status, map) => {
    const cfg = map[status] || { label: status, cls: 'bg-gray-500/20 text-gray-400' };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.cls}`}>
            {cfg.label}
        </span>
    );
};

const roleBadge = (role) => statusBadge(role, {
    admin:   { label: 'Admin',   cls: 'bg-red-500/20 text-red-400 border border-red-500/30' },
    artist:  { label: 'Artist',  cls: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' },
    buyer:   { label: 'Buyer',   cls: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
    learner: { label: 'Learner', cls: 'bg-green-500/20 text-green-400 border border-green-500/30' },
});

const orderStatusBadge = (s) => statusBadge(s, {
    pending:        { label: 'Pending',        cls: 'bg-yellow-500/20 text-yellow-400' },
    paid:           { label: 'Paid',           cls: 'bg-green-500/20 text-green-400' },
    payment_failed: { label: 'Failed',         cls: 'bg-red-500/20 text-red-400' },
    refund_pending: { label: 'Refund Pending', cls: 'bg-orange-500/20 text-orange-400' },
    refunded:       { label: 'Refunded',       cls: 'bg-gray-500/20 text-gray-400' },
});

const courseStatusBadge = (s) => statusBadge(s, {
    draft:     { label: 'Draft',     cls: 'bg-gray-500/20 text-gray-400' },
    published: { label: 'Published', cls: 'bg-green-500/20 text-green-400' },
    archived:  { label: 'Archived',  cls: 'bg-red-500/20 text-red-400' },
});

const reportStatusBadge = (s) => statusBadge(s, {
    pending:   { label: 'Pending',   cls: 'bg-yellow-500/20 text-yellow-400' },
    reviewing: { label: 'Reviewing', cls: 'bg-blue-500/20 text-blue-400' },
    resolved:  { label: 'Resolved',  cls: 'bg-green-500/20 text-green-400' },
    rejected:  { label: 'Dismissed', cls: 'bg-gray-500/20 text-gray-400' },
});

const REPORT_REASON_LABELS = {
    spam: 'Spam', harassment: 'Harassment', hate_speech: 'Hate Speech',
    nudity: 'Nudity', copyright: 'Copyright', fraud: 'Fraud',
    scam: 'Scam', violence: 'Violence', inappropriate: 'Inappropriate',
    misinformation: 'Misinformation', other: 'Other',
};

function Paginator({ pagination, onPage }) {
    if (!pagination || pagination.pages <= 1) return null;
    const { page, pages } = pagination;
    return (
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">
                Page {page} of {pages} — {pagination.total} total
            </p>
            <div className="flex gap-2">
                <button
                    disabled={page <= 1}
                    onClick={() => onPage(page - 1)}
                    className="p-2 rounded-lg bg-gray-700 text-white disabled:opacity-40 hover:bg-gray-600 transition"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                    disabled={page >= pages}
                    onClick={() => onPage(page + 1)}
                    className="p-2 rounded-lg bg-gray-700 text-white disabled:opacity-40 hover:bg-gray-600 transition"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                    <p className="text-white font-medium">{message}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm text-white transition">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

function ArtworkDetailModal({ artwork, onApprove, onReject, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl max-w-lg w-full border border-gray-700 shadow-2xl overflow-hidden">
                <img
                    src={artwork.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image'}
                    alt={artwork.title}
                    className="w-full h-64 object-cover"
                    onError={e => { e.target.src = 'https://via.placeholder.com/600x400?text=No+Image'; }}
                />
                <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h3 className="text-xl font-bold text-white">{artwork.title}</h3>
                            <p className="text-gray-400 text-sm">by {artwork.artist?.name} · {artwork.artist?.email}</p>
                        </div>
                        <span className="text-lg font-bold text-green-400">{formatZAR(artwork.price)}</span>
                    </div>
                    {artwork.description && (
                        <p className="text-gray-300 text-sm mb-3 leading-relaxed">{artwork.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-4 text-xs text-gray-400">
                        <span className="bg-gray-700 px-2 py-1 rounded">Category: {artwork.category}</span>
                        <span className="bg-gray-700 px-2 py-1 rounded">License: {artwork.licenseType}</span>
                        <span className="bg-gray-700 px-2 py-1 rounded">Submitted: {new Date(artwork.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onApprove} className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center gap-2 text-white font-medium transition">
                            <Check className="w-4 h-4" /> Approve & Publish
                        </button>
                        <button onClick={onReject} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center gap-2 text-white font-medium transition">
                            <X className="w-4 h-4" /> Reject
                        </button>
                        <button onClick={onClose} className="py-2.5 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // id of item being actioned

    // Data
    const [stats, setStats] = useState({ users: 0, artworks: 0, courses: 0, orders: 0, openReports: 0 });
    const [users, setUsers] = useState([]);
    const [userPage, setUserPage] = useState(1);
    const [userPagination, setUserPagination] = useState(null);
    const [userSearch, setUserSearch] = useState('');

    const [artworks, setArtworks] = useState([]);
    const [selectedArtwork, setSelectedArtwork] = useState(null);

    const [reports, setReports] = useState([]);
    const [reportFilter, setReportFilter] = useState('');

    const [courses, setCourses] = useState([]);
    const [coursePage, setCoursePage] = useState(1);
    const [coursePagination, setCoursePagination] = useState(null);
    const [courseStatusFilter, setCourseStatusFilter] = useState('');

    const [orders, setOrders] = useState([]);
    const [orderPage, setOrderPage] = useState(1);
    const [orderPagination, setOrderPagination] = useState(null);
    const [orderStatusFilter, setOrderStatusFilter] = useState('');

    const [enrollments, setEnrollments] = useState([]);
    const [enrollPage, setEnrollPage] = useState(1);
    const [enrollPagination, setEnrollPagination] = useState(null);
    const [enrollCourseFilter, setEnrollCourseFilter] = useState('');

    const [confirm, setConfirm] = useState(null); // { message, onConfirm }
    const [showCreateCourse, setShowCreateCourse] = useState(false);
    const [createCourseForm, setCreateCourseForm] = useState({ title: '', description: '', thumbnailUrl: '', category: 'art', difficulty: 'all', pricingOneTime: 0, lessons: [] });
    const [creatingCourse, setCreatingCourse] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            toast.error('Access denied. Admin privileges required.');
            navigate('/admin/login');
            return;
        }
        loadStats();
        loadArtworks();
    }, [user]);

    useEffect(() => { if (activeTab === 'users') loadUsers(); }, [activeTab, userPage]);
    useEffect(() => { if (activeTab === 'reports') loadReports(); }, [activeTab, reportFilter]);
    useEffect(() => { if (activeTab === 'courses') loadCourses(); }, [activeTab, coursePage, courseStatusFilter]);
    useEffect(() => { if (activeTab === 'orders') loadOrders(); }, [activeTab, orderPage, orderStatusFilter]);
    useEffect(() => { if (activeTab === 'students') loadEnrollments(); }, [activeTab, enrollPage, enrollCourseFilter]);

    const loadStats = async () => {
        try {
            const res = await adminService.getStats();
            if (res.success) setStats(res.stats);
        } catch { }
    };

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await adminService.getUsers(userPage, 15);
            if (res.success) {
                setUsers(res.items || []);
                setUserPagination(res.pagination ? {
                    page: res.pagination.currentPage,
                    pages: res.pagination.totalPages,
                    total: res.pagination.totalUsers,
                    limit: res.pagination.limit,
                } : null);
            }
        } catch { toast.error('Failed to load users'); }
        finally { setLoading(false); }
    };

    const loadArtworks = async () => {
        setLoading(true);
        try {
            const res = await adminService.getPendingArtworks();
            if (res.success) setArtworks(res.items || []);
        } catch { }
        finally { setLoading(false); }
    };

    const loadReports = async () => {
        setLoading(true);
        try {
            const res = await adminService.getReports();
            if (res.success) {
                const all = res.items || [];
                setReports(reportFilter ? all.filter(r => r.status === reportFilter) : all);
            }
        } catch { toast.error('Failed to load reports'); }
        finally { setLoading(false); }
    };

    const loadCourses = async () => {
        setLoading(true);
        try {
            const res = await adminService.getAllCourses(coursePage, 12, courseStatusFilter);
            if (res.success) {
                setCourses(res.items || []);
                setCoursePagination(res.pagination || null);
            }
        } catch { toast.error('Failed to load courses'); }
        finally { setLoading(false); }
    };

    const loadOrders = async () => {
        setLoading(true);
        try {
            const res = await adminService.getAllOrders(orderPage, 15, orderStatusFilter);
            if (res.success) {
                setOrders(res.items || []);
                setOrderPagination(res.pagination || null);
            }
        } catch { toast.error('Failed to load orders'); }
        finally { setLoading(false); }
    };

    const loadEnrollments = async () => {
        setLoading(true);
        try {
            const res = await adminService.getEnrollments(enrollPage, 20, enrollCourseFilter);
            if (res.success) {
                setEnrollments(res.items || []);
                setEnrollPagination(res.pagination || null);
            }
        } catch { toast.error('Failed to load enrollments'); }
        finally { setLoading(false); }
    };

    // ---- Actions ----
    const handleArtworkAction = async (id, action) => {
        setActionLoading(id);
        try {
            if (action === 'approve') await adminService.approveArtwork(id);
            else await adminService.rejectArtwork(id);
            toast.success(action === 'approve' ? 'Artwork published to marketplace!' : 'Artwork rejected');
            setSelectedArtwork(null);
            await loadArtworks();
            await loadStats();
        } catch { toast.error('Action failed'); }
        finally { setActionLoading(null); }
    };

    const handleReportAction = async (id, status) => {
        setActionLoading(id);
        try {
            await adminService.updateReportStatus(id, status);
            toast.success(`Report ${status === 'resolved' ? 'resolved' : 'dismissed'}`);
            await loadReports();
            await loadStats();
        } catch { toast.error('Failed to update report'); }
        finally { setActionLoading(null); }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await adminService.updateUserRole(userId, newRole);
            toast.success(`Role updated to ${newRole}`);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
            await loadStats();
        } catch (e) { toast.error(e.response?.data?.message || 'Failed to update role'); }
    };

    const handleDeleteUser = (u) => {
        setConfirm({
            message: `Delete user "${u.name}"? This cannot be undone.`,
            onConfirm: async () => {
                setConfirm(null);
                try {
                    await adminService.deleteUser(u._id);
                    toast.success('User deleted');
                    await loadUsers();
                    await loadStats();
                } catch (e) { toast.error(e.response?.data?.message || 'Failed to delete user'); }
            },
        });
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setCreatingCourse(true);
        try {
            const res = await createCourse({
                title: createCourseForm.title,
                description: createCourseForm.description,
                thumbnailUrl: createCourseForm.thumbnailUrl,
                category: createCourseForm.category,
                difficulty: createCourseForm.difficulty,
                lessons: createCourseForm.lessons.map((l, i) => ({ ...l, order: i })),
                pricing: {
                    oneTime: { enabled: Number(createCourseForm.pricingOneTime) > 0, price: Number(createCourseForm.pricingOneTime) },
                    monthly: { enabled: false, price: 0 },
                    yearly:  { enabled: false, price: 0 },
                },
            });
            if (res?.success) {
                toast.success('Course created as draft!');
                setShowCreateCourse(false);
                setCreateCourseForm({ title: '', description: '', thumbnailUrl: '', category: 'art', difficulty: 'all', pricingOneTime: 0, lessons: [] });
                await loadCourses();
                await loadStats();
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to create course');
        } finally {
            setCreatingCourse(false);
        }
    };

    const handleRemoveEnrollment = (enrollment) => {
        setConfirm({
            message: `Remove "${enrollment.user?.name}" from "${enrollment.course?.title}"?`,
            onConfirm: async () => {
                setConfirm(null);
                try {
                    await adminService.removeEnrollment(enrollment._id);
                    toast.success('Enrollment removed');
                    await loadEnrollments();
                } catch (e) { toast.error(e.response?.data?.message || 'Failed to remove enrollment'); }
            },
        });
    };

    const handleCourseStatus = async (id, status) => {
        setActionLoading(id);
        try {
            await adminService.setCourseStatus(id, status);
            toast.success(`Course ${status}`);
            await loadCourses();
        } catch { toast.error('Failed to update course'); }
        finally { setActionLoading(null); }
    };

    // ---- Filtered users search (client-side on loaded page) ----
    const filteredUsers = userSearch
        ? users.filter(u => u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()))
        : users;

    const menuItems = [
        { id: 'overview',  label: 'Overview',  icon: BarChart3 },
        { id: 'users',     label: 'Users',     icon: Users,       badge: stats.users },
        { id: 'artworks',  label: 'Artworks',  icon: Palette,     badge: artworks.length },
        { id: 'courses',   label: 'Courses',   icon: BookOpen },
        { id: 'students',  label: 'Students',  icon: GraduationCap },
        { id: 'orders',    label: 'Orders',    icon: ShoppingCart },
        { id: 'reports',   label: 'Reports',   icon: AlertTriangle, badge: stats.openReports, badgeRed: true },
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            {/* Top Header */}
            <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-gray-400 hover:text-white">
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-white leading-tight">Admin Dashboard</p>
                            <p className="text-xs text-gray-500 leading-tight">ArtCollab Management</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-sm hidden sm:block">{user?.email}</span>
                        <button onClick={() => { logout(); navigate('/admin/login'); }}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                {sidebarOpen && (
                    <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
                )}
                <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
                    fixed lg:static inset-y-0 left-0 z-40 w-56 bg-gray-900 border-r border-gray-800
                    transform transition-transform duration-200 flex flex-col pt-2`}>
                    <nav className="p-3 space-y-1 flex-1">
                        {menuItems.map(({ id, label, icon: Icon, badge, badgeRed }) => (
                            <button key={id}
                                onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm ${
                                    activeTab === id
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}>
                                <span className="flex items-center gap-2.5">
                                    <Icon className="w-4 h-4" /> {label}
                                </span>
                                {badge > 0 && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${badgeRed ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                                        {badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main */}
                <main className="flex-1 overflow-y-auto p-5 lg:p-6">

                    {/* ===== OVERVIEW ===== */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">Dashboard Overview</h2>
                                <button onClick={() => { loadStats(); loadArtworks(); }}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
                                    <RefreshCw className="w-4 h-4" /> Refresh
                                </button>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                {[
                                    { label: 'Users',    value: stats.users,       icon: Users,        color: 'text-blue-400',   bg: 'bg-blue-500/10',    tab: 'users' },
                                    { label: 'Artworks', value: stats.artworks,    icon: Palette,      color: 'text-purple-400', bg: 'bg-purple-500/10',  tab: 'artworks' },
                                    { label: 'Courses',  value: stats.courses,     icon: BookOpen,     color: 'text-green-400',  bg: 'bg-green-500/10',   tab: 'courses' },
                                    { label: 'Orders',   value: stats.orders,      icon: ShoppingCart, color: 'text-orange-400', bg: 'bg-orange-500/10',  tab: 'orders' },
                                    { label: 'Reports',  value: stats.openReports, icon: AlertTriangle,color: 'text-red-400',    bg: 'bg-red-500/10',     tab: 'reports' },
                                ].map(({ label, value, icon: Icon, color, bg, tab }) => (
                                    <button key={label} onClick={() => setActiveTab(tab)}
                                        className={`${bg} rounded-xl p-4 border border-gray-800 hover:border-gray-600 transition text-left`}>
                                        <Icon className={`w-5 h-5 ${color} mb-2`} />
                                        <div className="text-2xl font-bold text-white">{value}</div>
                                        <div className="text-xs text-gray-400">{label}</div>
                                    </button>
                                ))}
                            </div>

                            {stats.openReports > 0 && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-4">
                                    <AlertTriangle className="w-7 h-7 text-red-400 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-white font-medium">{stats.openReports} open reports need attention</p>
                                        <p className="text-gray-400 text-sm">Review and resolve reports to keep the platform safe</p>
                                    </div>
                                    <button onClick={() => setActiveTab('reports')}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition">
                                        Review Now
                                    </button>
                                </div>
                            )}

                            {artworks.length > 0 && (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-4">
                                    <Palette className="w-7 h-7 text-yellow-400 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-white font-medium">{artworks.length} artwork{artworks.length > 1 ? 's' : ''} awaiting approval</p>
                                        <p className="text-gray-400 text-sm">Review submissions before they appear in the marketplace</p>
                                    </div>
                                    <button onClick={() => setActiveTab('artworks')}
                                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-medium transition">
                                        Review
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== USERS ===== */}
                    {activeTab === 'users' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <h2 className="text-2xl font-bold">User Management</h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search name or email..."
                                        value={userSearch}
                                        onChange={e => setUserSearch(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-64"
                                    />
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-indigo-500" /></div>
                            ) : (
                                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-800 text-gray-400 text-xs uppercase">
                                            <tr>
                                                <th className="px-4 py-3 text-left">User</th>
                                                <th className="px-4 py-3 text-left hidden md:table-cell">Email</th>
                                                <th className="px-4 py-3 text-left">Role</th>
                                                <th className="px-4 py-3 text-left hidden lg:table-cell">Joined</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {filteredUsers.map(u => (
                                                <tr key={u._id} className="hover:bg-gray-800/50 transition">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                                {u.name?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="font-medium text-white truncate max-w-[120px]">{u.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{u.email}</td>
                                                    <td className="px-4 py-3">
                                                        <select
                                                            value={u.role}
                                                            onChange={e => handleRoleChange(u._id, e.target.value)}
                                                            disabled={u._id === user?._id}
                                                            className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                                                        {new Date(u.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            onClick={() => handleDeleteUser(u)}
                                                            disabled={u._id === user?._id}
                                                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                            title="Delete user"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <div className="px-4 pb-4">
                                        <Paginator pagination={userPagination} onPage={p => setUserPage(p)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== ARTWORKS ===== */}
                    {activeTab === 'artworks' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">Pending Artworks</h2>
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 text-sm">{artworks.length} pending</span>
                                    <button onClick={loadArtworks} className="p-2 hover:bg-gray-800 rounded-lg transition">
                                        <RefreshCw className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-indigo-500" /></div>
                            ) : artworks.length === 0 ? (
                                <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800">
                                    <CheckCircle className="w-14 h-14 mx-auto text-green-500 mb-3" />
                                    <p className="text-white font-semibold">All caught up!</p>
                                    <p className="text-gray-400 text-sm">No pending artworks to review</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {artworks.map(artwork => (
                                        <div key={artwork._id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-gray-600 transition group">
                                            <div className="relative">
                                                <img
                                                    src={artwork.imageUrl || 'https://via.placeholder.com/400x250?text=No+Image'}
                                                    alt={artwork.title}
                                                    className="w-full h-44 object-cover"
                                                    onError={e => { e.target.src = 'https://via.placeholder.com/400x250?text=No+Image'; }}
                                                />
                                                <button
                                                    onClick={() => setSelectedArtwork(artwork)}
                                                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-lg opacity-0 group-hover:opacity-100 transition"
                                                    title="View details"
                                                >
                                                    <Eye className="w-4 h-4 text-white" />
                                                </button>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold text-white truncate">{artwork.title}</h3>
                                                <p className="text-gray-400 text-xs mt-0.5">by {artwork.artist?.name}</p>
                                                <div className="flex items-center justify-between mt-1 mb-3">
                                                    <span className="text-green-400 text-sm font-medium">{formatZAR(artwork.price)}</span>
                                                    <span className="text-gray-500 text-xs">{new Date(artwork.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleArtworkAction(artwork._id, 'approve')}
                                                        disabled={actionLoading === artwork._id}
                                                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 rounded-lg flex items-center justify-center gap-1.5 text-sm font-medium transition"
                                                    >
                                                        {actionLoading === artwork._id ? <Loader className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleArtworkAction(artwork._id, 'reject')}
                                                        disabled={actionLoading === artwork._id}
                                                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-lg flex items-center justify-center gap-1.5 text-sm font-medium transition"
                                                    >
                                                        <X className="w-3 h-3" /> Reject
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedArtwork(artwork)}
                                                        className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition"
                                                        title="Details"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== COURSES ===== */}
                    {activeTab === 'courses' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <h2 className="text-2xl font-bold">Course Management</h2>
                                <div className="flex gap-2 flex-wrap">
                                    <button onClick={() => setShowCreateCourse(true)}
                                        className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition">
                                        <Plus className="w-4 h-4" /> Create Course
                                    </button>
                                    {['', 'draft', 'published', 'archived'].map(s => (
                                        <button key={s}
                                            onClick={() => { setCourseStatusFilter(s); setCoursePage(1); }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                                courseStatusFilter === s
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                            }`}>
                                            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-indigo-500" /></div>
                            ) : courses.length === 0 ? (
                                <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800">
                                    <BookOpen className="w-14 h-14 mx-auto text-gray-600 mb-3" />
                                    <p className="text-gray-400">No courses found</p>
                                </div>
                            ) : (
                                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-800 text-gray-400 text-xs uppercase">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Course</th>
                                                <th className="px-4 py-3 text-left hidden md:table-cell">Instructor</th>
                                                <th className="px-4 py-3 text-left hidden lg:table-cell">Students</th>
                                                <th className="px-4 py-3 text-left">Status</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {courses.map(c => (
                                                <tr key={c._id} className="hover:bg-gray-800/50 transition">
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium text-white truncate max-w-[180px]">{c.title}</p>
                                                        <p className="text-xs text-gray-500">{c.category} · {c.difficulty}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{c.instructor?.name}</td>
                                                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">{c.enrollmentCount || 0}</td>
                                                    <td className="px-4 py-3">{courseStatusBadge(c.status)}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex gap-1 justify-end">
                                                            {c.status !== 'published' && (
                                                                <button
                                                                    onClick={() => handleCourseStatus(c._id, 'published')}
                                                                    disabled={actionLoading === c._id}
                                                                    className="px-2.5 py-1 bg-green-600/80 hover:bg-green-600 rounded-lg text-xs flex items-center gap-1 transition disabled:opacity-50"
                                                                >
                                                                    <Globe className="w-3 h-3" /> Publish
                                                                </button>
                                                            )}
                                                            {c.status === 'published' && (
                                                                <button
                                                                    onClick={() => handleCourseStatus(c._id, 'archived')}
                                                                    disabled={actionLoading === c._id}
                                                                    className="px-2.5 py-1 bg-gray-600/80 hover:bg-gray-600 rounded-lg text-xs flex items-center gap-1 transition disabled:opacity-50"
                                                                >
                                                                    <XCircle className="w-3 h-3" /> Archive
                                                                </button>
                                                            )}
                                                            {c.status === 'archived' && (
                                                                <button
                                                                    onClick={() => handleCourseStatus(c._id, 'draft')}
                                                                    disabled={actionLoading === c._id}
                                                                    className="px-2.5 py-1 bg-yellow-600/80 hover:bg-yellow-600 rounded-lg text-xs flex items-center gap-1 transition disabled:opacity-50"
                                                                >
                                                                    <FileText className="w-3 h-3" /> Restore
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="px-4 pb-4">
                                        <Paginator pagination={coursePagination} onPage={p => setCoursePage(p)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== ORDERS ===== */}
                    {activeTab === 'orders' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <h2 className="text-2xl font-bold">Order Management</h2>
                                <div className="flex gap-2 flex-wrap">
                                    {['', 'pending', 'paid', 'payment_failed', 'refund_pending', 'refunded'].map(s => (
                                        <button key={s}
                                            onClick={() => { setOrderStatusFilter(s); setOrderPage(1); }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                                orderStatusFilter === s
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                            }`}>
                                            {s === '' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-indigo-500" /></div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800">
                                    <ShoppingCart className="w-14 h-14 mx-auto text-gray-600 mb-3" />
                                    <p className="text-gray-400">No orders found</p>
                                </div>
                            ) : (
                                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-800 text-gray-400 text-xs uppercase">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Order ID</th>
                                                <th className="px-4 py-3 text-left hidden md:table-cell">Customer</th>
                                                <th className="px-4 py-3 text-left hidden lg:table-cell">Items</th>
                                                <th className="px-4 py-3 text-left">Total</th>
                                                <th className="px-4 py-3 text-left">Status</th>
                                                <th className="px-4 py-3 text-left hidden lg:table-cell">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {orders.map(o => (
                                                <tr key={o._id} className="hover:bg-gray-800/50 transition">
                                                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                                                        #{o._id.slice(-8).toUpperCase()}
                                                    </td>
                                                    <td className="px-4 py-3 hidden md:table-cell">
                                                        <p className="text-white text-xs">{o.user?.name}</p>
                                                        <p className="text-gray-500 text-xs">{o.user?.email}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell text-xs">
                                                        {(o.items || []).length} item{(o.items || []).length !== 1 ? 's' : ''}
                                                    </td>
                                                    <td className="px-4 py-3 text-white font-medium">{formatZAR(o.subtotal)}</td>
                                                    <td className="px-4 py-3">{orderStatusBadge(o.status)}</td>
                                                    <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                                                        {new Date(o.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="px-4 pb-4">
                                        <Paginator pagination={orderPagination} onPage={p => setOrderPage(p)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== REPORTS ===== */}
                    {activeTab === 'reports' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <h2 className="text-2xl font-bold">Content Reports</h2>
                                <div className="flex gap-2 flex-wrap">
                                    {['', 'pending', 'reviewing', 'resolved', 'rejected'].map(s => (
                                        <button key={s}
                                            onClick={() => setReportFilter(s)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                                reportFilter === s
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                            }`}>
                                            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-indigo-500" /></div>
                            ) : reports.length === 0 ? (
                                <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800">
                                    <CheckCircle className="w-14 h-14 mx-auto text-green-500 mb-3" />
                                    <p className="text-white font-semibold">No reports here</p>
                                    <p className="text-gray-400 text-sm">
                                        {reportFilter ? `No ${reportFilter} reports` : 'All clear!'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {reports.map(report => (
                                        <div key={report._id} className="bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <span className="font-semibold text-white capitalize">
                                                            {REPORT_REASON_LABELS[report.reason] || report.reason}
                                                        </span>
                                                        <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-400 capitalize">
                                                            {report.targetType?.replace('_', ' ')}
                                                        </span>
                                                        {reportStatusBadge(report.status)}
                                                    </div>
                                                    {report.details && (
                                                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{report.details}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                        <span>Reported by: <span className="text-gray-400">{report.reporter?.name || 'Unknown'}</span></span>
                                                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {(report.status === 'pending' || report.status === 'reviewing') && (
                                                <div className="flex gap-2 flex-wrap">
                                                    <button
                                                        onClick={() => handleReportAction(report._id, 'reviewing')}
                                                        disabled={actionLoading === report._id || report.status === 'reviewing'}
                                                        className="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 rounded-lg text-xs disabled:opacity-50 transition"
                                                    >
                                                        Mark Reviewing
                                                    </button>
                                                    <button
                                                        onClick={() => handleReportAction(report._id, 'resolved')}
                                                        disabled={actionLoading === report._id}
                                                        className="px-3 py-1.5 bg-green-600/80 hover:bg-green-600 rounded-lg text-xs disabled:opacity-50 transition"
                                                    >
                                                        {actionLoading === report._id ? <Loader className="w-3 h-3 animate-spin inline" /> : null}
                                                        Resolve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReportAction(report._id, 'rejected')}
                                                        disabled={actionLoading === report._id}
                                                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs disabled:opacity-50 transition"
                                                    >
                                                        Dismiss
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {/* ===== STUDENTS ===== */}
                    {activeTab === 'students' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <h2 className="text-2xl font-bold">Student Enrollments</h2>
                                <button onClick={loadEnrollments}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
                                    <RefreshCw className="w-4 h-4" /> Refresh
                                </button>
                            </div>

                            <div className="relative max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Filter by course ID..."
                                    value={enrollCourseFilter}
                                    onChange={e => { setEnrollCourseFilter(e.target.value); setEnrollPage(1); }}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-indigo-500" /></div>
                            ) : enrollments.length === 0 ? (
                                <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800">
                                    <GraduationCap className="w-14 h-14 mx-auto text-gray-600 mb-3" />
                                    <p className="text-gray-400">No enrollments found</p>
                                </div>
                            ) : (
                                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-800 text-gray-400 text-xs uppercase">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Student</th>
                                                <th className="px-4 py-3 text-left hidden md:table-cell">Course</th>
                                                <th className="px-4 py-3 text-left hidden lg:table-cell">Progress</th>
                                                <th className="px-4 py-3 text-left hidden lg:table-cell">Enrolled</th>
                                                <th className="px-4 py-3 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {enrollments.map(enrollment => (
                                                <tr key={enrollment._id} className="hover:bg-gray-800/50 transition">
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-white">{enrollment.user?.name || 'Unknown'}</div>
                                                        <div className="text-gray-500 text-xs">{enrollment.user?.email}</div>
                                                    </td>
                                                    <td className="px-4 py-3 hidden md:table-cell">
                                                        <div className="text-gray-300 line-clamp-1">{enrollment.course?.title || '—'}</div>
                                                        {enrollment.course?.category && (
                                                            <div className="text-gray-600 text-xs capitalize">{enrollment.course.category}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 hidden lg:table-cell">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${enrollment.progress || 0}%` }} />
                                                            </div>
                                                            <span className="text-xs text-gray-400">{enrollment.progress || 0}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs">
                                                        {new Date(enrollment.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => handleRemoveEnrollment(enrollment)}
                                                            className="p-1.5 bg-red-900/40 hover:bg-red-700/60 text-red-400 hover:text-red-300 rounded-lg transition"
                                                            title="Remove enrollment"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="p-4">
                                        <Paginator pagination={enrollPagination} onPage={setEnrollPage} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </main>
            </div>

            {/* Modals */}
            {selectedArtwork && (
                <ArtworkDetailModal
                    artwork={selectedArtwork}
                    onApprove={() => handleArtworkAction(selectedArtwork._id, 'approve')}
                    onReject={() => handleArtworkAction(selectedArtwork._id, 'reject')}
                    onClose={() => setSelectedArtwork(null)}
                />
            )}
            {confirm && (
                <ConfirmModal
                    message={confirm.message}
                    onConfirm={confirm.onConfirm}
                    onCancel={() => setConfirm(null)}
                />
            )}

            {/* Create Course Modal */}
            {showCreateCourse && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Create New Course</h2>
                            <button onClick={() => setShowCreateCourse(false)} className="p-1.5 hover:bg-gray-700 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateCourse} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-1.5">Title <span className="text-red-400">*</span></label>
                                <input type="text" required
                                    value={createCourseForm.title}
                                    onChange={e => setCreateCourseForm(p => ({ ...p, title: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                                    placeholder="e.g., Mastering Procreate"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-300 mb-1.5">Category</label>
                                    <select value={createCourseForm.category}
                                        onChange={e => setCreateCourseForm(p => ({ ...p, category: e.target.value }))}
                                        className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white">
                                        {[['art','🎨 Digital Art'],['design','✏️ Design'],['3d','🎲 3D Modeling'],['animation','🎬 Animation'],['photography','📷 Photography'],['music','🎵 Music'],['business','💼 Business'],['other','🎭 Other']].map(([v, l]) => (
                                            <option key={v} value={v}>{l}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-300 mb-1.5">Difficulty</label>
                                    <select value={createCourseForm.difficulty}
                                        onChange={e => setCreateCourseForm(p => ({ ...p, difficulty: e.target.value }))}
                                        className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white">
                                        <option value="all">📚 All Levels</option>
                                        <option value="beginner">🌱 Beginner</option>
                                        <option value="intermediate">⚡ Intermediate</option>
                                        <option value="advanced">🔥 Advanced</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1.5">Description</label>
                                <textarea value={createCourseForm.description}
                                    onChange={e => setCreateCourseForm(p => ({ ...p, description: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white h-24 resize-none focus:border-indigo-500 focus:outline-none"
                                    placeholder="What will students learn?" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1.5">Thumbnail URL</label>
                                <input type="url"
                                    value={createCourseForm.thumbnailUrl}
                                    onChange={e => setCreateCourseForm(p => ({ ...p, thumbnailUrl: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                                    placeholder="https://..." />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1.5">One-time Price (ZAR)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R</span>
                                    <input type="number" min="0" step="1"
                                        value={createCourseForm.pricingOneTime}
                                        onChange={e => setCreateCourseForm(p => ({ ...p, pricingOneTime: e.target.value }))}
                                        className="w-full pl-7 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                                        placeholder="0 = free" />
                                </div>
                            </div>

                            {/* Lessons */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm text-gray-300 font-medium">Lessons ({createCourseForm.lessons.length})</label>
                                    <button type="button"
                                        onClick={() => setCreateCourseForm(p => ({
                                            ...p,
                                            lessons: [...p.lessons, { title: '', videoUrl: '', description: '', durationSec: 0, isFree: false }]
                                        }))}
                                        className="flex items-center gap-1 px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 text-xs rounded-lg transition">
                                        <Plus className="w-3.5 h-3.5" /> Add Lesson
                                    </button>
                                </div>

                                {createCourseForm.lessons.length === 0 && (
                                    <p className="text-xs text-gray-500 py-3 text-center border border-dashed border-gray-600 rounded-lg">
                                        No lessons yet. Click "Add Lesson" to add video content.
                                    </p>
                                )}

                                <div className="space-y-3">
                                    {createCourseForm.lessons.map((lesson, idx) => (
                                        <div key={idx} className="bg-gray-700/50 border border-gray-600 rounded-xl p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-indigo-400">Lesson {idx + 1}</span>
                                                <button type="button"
                                                    onClick={() => setCreateCourseForm(p => ({ ...p, lessons: p.lessons.filter((_, i) => i !== idx) }))}
                                                    className="p-1 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded transition">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Lesson title *"
                                                value={lesson.title}
                                                onChange={e => setCreateCourseForm(p => ({ ...p, lessons: p.lessons.map((l, i) => i === idx ? { ...l, title: e.target.value } : l) }))}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none"
                                            />
                                            <input
                                                type="url"
                                                placeholder="Video URL (YouTube, Vimeo, direct MP4...)"
                                                value={lesson.videoUrl}
                                                onChange={e => setCreateCourseForm(p => ({ ...p, lessons: p.lessons.map((l, i) => i === idx ? { ...l, videoUrl: e.target.value } : l) }))}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="Duration (seconds)"
                                                    value={lesson.durationSec || ''}
                                                    onChange={e => setCreateCourseForm(p => ({ ...p, lessons: p.lessons.map((l, i) => i === idx ? { ...l, durationSec: Number(e.target.value) } : l) }))}
                                                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none"
                                                />
                                                <label className="flex items-center gap-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={lesson.isFree}
                                                        onChange={e => setCreateCourseForm(p => ({ ...p, lessons: p.lessons.map((l, i) => i === idx ? { ...l, isFree: e.target.checked } : l) }))}
                                                        className="accent-indigo-500"
                                                    />
                                                    <span className="text-xs text-gray-300">Free preview</span>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" disabled={creatingCourse}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2">
                                {creatingCourse ? <><RefreshCw className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Course Draft'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
