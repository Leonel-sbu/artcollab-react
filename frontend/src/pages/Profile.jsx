import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cartService, formatZAR } from '../services/cartService';
import { getDashboardStats } from '../services/dashboardService';
import { uploadAvatar } from '../services/userService';
import toast from 'react-hot-toast';
import { ShoppingBag, BookOpen, TrendingUp, Users, Palette, DollarSign, Eye, Camera } from 'lucide-react';

export default function Profile() {
    const { user, refreshAuth } = useAuth();
    const navigate = useNavigate();
    const avatarInputRef = useRef(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [userStats, setUserStats] = useState({
        followers: 0,
        following: 0,
        artworks: 0,
        sales: 0,
        views: 0,
        earnings: 0
    });

    // Get tab from URL query param
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab && ['overview', 'artworks', 'purchases', 'courses'].includes(tab)) {
            setActiveTab(tab);
        }
    }, []);

    useEffect(() => {
        if (user) {
            loadUserData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadUserData = async () => {
        try {
            setLoading(true);
            const [ordersResponse, statsResponse] = await Promise.all([
                cartService.getOrders(),
                getDashboardStats().catch(() => null),
            ]);

            if (ordersResponse?.success) {
                setOrders(ordersResponse.items || []);
            }

            // followers/following come from the live user object (populated by /api/auth/me)
            const followersCount = Array.isArray(user?.followers) ? user.followers.length : 0;
            const followingCount = Array.isArray(user?.following) ? user.following.length : 0;

            if (statsResponse?.success) {
                setUserStats({
                    followers: statsResponse.data?.followers ?? followersCount,
                    following: followingCount,
                    artworks: statsResponse.data?.totalArtworks || 0,
                    sales: statsResponse.data?.totalOrders || 0,
                    views: 0,
                    earnings: statsResponse.data?.totalSalesZAR || 0,
                });
            } else {
                setUserStats({
                    followers: followersCount,
                    following: followingCount,
                    artworks: 0,
                    sales: ordersResponse?.items?.length || 0,
                    views: 0,
                    earnings: 0,
                });
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
            if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                toast.error("Unable to connect to server. Please check your connection.");
            } else if (error.response?.status === 401) {
                toast.error("Please log in to view your profile.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarUploading(true);
        try {
            const res = await uploadAvatar(file);
            if (res?.success) {
                toast.success('Avatar updated');
                await refreshAuth(); // Reload user so avatar shows instantly
            } else {
                toast.error(res?.message || 'Upload failed');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to upload avatar');
        } finally {
            setAvatarUploading(false);
            e.target.value = '';
        }
    };

    const userData = {
        name: user?.name || user?.displayName || 'Artist',
        email: user?.email || '',
        avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'user'}`,
        bio: user?.bio || 'Digital artist and creative enthusiast.',
        location: user?.location || 'Johannesburg, South Africa',
        role: user?.role || 'Member',
        joinedAt: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' }) : 'Unknown'
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'artworks', label: 'My Artworks', icon: Palette },
        { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
        { id: 'courses', label: 'My Courses', icon: BookOpen }
    ];

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex-1 py-8 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12">
                        <Users className="w-24 h-24 mx-auto text-gray-400 mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Login Required</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">Please login to view your profile</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
                    {/* Cover Image */}
                    <div className="h-32 md:h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                    <div className="px-4 md:px-6 pb-6">
                        <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-4">
                            {/* Avatar */}
                            <div className="relative group">
                                <img
                                    src={userData.avatar}
                                    alt={userData.name}
                                    className="w-24 md:w-32 h-24 md:h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={avatarUploading}
                                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-wait"
                                >
                                    <Camera className="w-6 h-6 text-white" />
                                </button>
                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </div>

                            {/* User Info */}
                            <div className="md:ml-6 mt-4 md:mt-0 flex-1">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{userData.name}</h1>
                                        <p className="text-gray-600 dark:text-gray-400">{userData.location}</p>
                                        <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full mt-1 inline-block">
                                            {userData.role}
                                        </span>
                                    </div>
                                    <div className="mt-4 md:mt-0 flex space-x-3">
                                        <button
                                            onClick={() => toast.success('Share feature coming soon')}
                                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-sm"
                                        >
                                            Share
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        <p className="text-gray-700 dark:text-gray-300 mb-4">{userData.bio}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Member since {userData.joinedAt}</p>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-4 md:gap-6 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                            <div className="text-center">
                                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{userStats.followers}</p>
                                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Followers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{userStats.following}</p>
                                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Following</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{userStats.artworks}</p>
                                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Artworks</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{userStats.sales}</p>
                                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Sales</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Quick Stats */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">This Month</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-green-500 mb-2" />
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatZAR(userStats.earnings)}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Earnings</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <Eye className="w-6 h-6 text-blue-500 mb-2" />
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.views}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Views</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Orders</h3>
                            {orders.length > 0 ? (
                                <div className="space-y-3">
                                    {orders.slice(0, 3).map((order) => (
                                        <div key={order._id} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Order</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{formatZAR(order.subtotal)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-sm">No orders yet</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'artworks' && (
                    <div className="text-center py-12">
                        <Palette className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">My Artworks</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Upload your first artwork to get started</p>
                        <button
                            onClick={() => navigate('/upload')}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                        >
                            Upload Artwork
                        </button>
                    </div>
                )}

                {activeTab === 'purchases' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Purchase History</h3>
                        {orders.length > 0 ? (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div key={order._id} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {order.items?.length || 0} item(s)
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(order.createdAt).toLocaleDateString('en-ZA')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {formatZAR(order.subtotal)}
                                            </p>
                                            <span className={`text-sm ${order.status === 'paid' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                                                }`}>
                                                {order.status === 'paid' ? 'Paid' : order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <ShoppingBag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">No purchases yet</p>
                                <button
                                    onClick={() => navigate('/marketplace')}
                                    className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                                >
                                    Browse Marketplace
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'courses' && (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">My Courses</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Enroll in courses to start learning</p>
                        <button
                            onClick={() => navigate('/learn')}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                        >
                            Browse Courses
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
