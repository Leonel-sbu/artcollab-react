// src/components/admin/AdminStats.jsx
import {
    Users,
    Image,
    ShoppingCart,
    BookOpen,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Eye,
    Heart,
    AlertCircle
} from "lucide-react";

const StatCard = ({ title, value, change, changeType, icon: Icon, color = "blue" }) => {
    const colorClasses = {
        blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400",
        green: "from-green-500/20 to-green-600/10 border-green-500/30 text-green-400",
        purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400",
        orange: "from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400",
        red: "from-red-500/20 to-red-600/10 border-red-500/30 text-red-400",
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-2xl p-6`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-400 text-sm mb-1">{title}</p>
                    <p className="text-3xl font-bold text-white">{value}</p>
                    {change && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${changeType === "positive" ? "text-green-400" : "text-red-400"
                            }`}>
                            {changeType === "positive" ? (
                                <TrendingUp className="w-4 h-4" />
                            ) : (
                                <TrendingDown className="w-4 h-4" />
                            )}
                            <span>{change}</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl bg-gray-800/50`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

export default function AdminStats({ stats }) {
    const defaultStats = {
        totalUsers: stats?.totalUsers || 0,
        totalArtworks: stats?.totalArtworks || 0,
        totalOrders: stats?.totalOrders || 0,
        totalRevenue: stats?.totalRevenue || 0,
        pendingArtworks: stats?.pendingArtworks || 0,
        activeCourses: stats?.activeCourses || 0,
        totalViews: stats?.totalViews || 0,
        totalLikes: stats?.totalLikes || 0,
    };

    return (
        <div className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Users"
                    value={defaultStats.totalUsers.toLocaleString()}
                    change="+12% this month"
                    changeType="positive"
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Total Artworks"
                    value={defaultStats.totalArtworks.toLocaleString()}
                    change="+8% this month"
                    changeType="positive"
                    icon={Image}
                    color="purple"
                />
                <StatCard
                    title="Total Orders"
                    value={defaultStats.totalOrders.toLocaleString()}
                    change="+24% this month"
                    changeType="positive"
                    icon={ShoppingCart}
                    color="green"
                />
                <StatCard
                    title="Total Revenue"
                    value={`R ${defaultStats.totalRevenue.toLocaleString()}`}
                    change="+18% this month"
                    changeType="positive"
                    icon={DollarSign}
                    color="orange"
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Pending Reviews"
                    value={defaultStats.pendingArtworks}
                    icon={AlertCircle}
                    color="red"
                />
                <StatCard
                    title="Active Courses"
                    value={defaultStats.activeCourses}
                    icon={BookOpen}
                    color="blue"
                />
                <StatCard
                    title="Total Views"
                    value={defaultStats.totalViews.toLocaleString()}
                    icon={Eye}
                    color="purple"
                />
                <StatCard
                    title="Total Likes"
                    value={defaultStats.totalLikes.toLocaleString()}
                    icon={Heart}
                    color="green"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Pending Actions</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                            <span className="text-orange-300">Artworks pending review</span>
                            <span className="text-white font-bold">{defaultStats.pendingArtworks}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <span className="text-blue-300">New user registrations</span>
                            <span className="text-white font-bold">5</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <span className="text-red-300">User reports</span>
                            <span className="text-white font-bold">2</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-gray-400">New artwork uploaded</span>
                            <span className="text-gray-500 ml-auto">2m ago</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-gray-400">New user registered</span>
                            <span className="text-gray-500 ml-auto">15m ago</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span className="text-gray-400">Order completed</span>
                            <span className="text-gray-500 ml-auto">1h ago</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <span className="text-gray-400">Course enrolled</span>
                            <span className="text-gray-500 ml-auto">3h ago</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Top Categories</h3>
                    <div className="space-y-3">
                        {["Digital Art", "Photography", "Traditional", "3D Art", "Illustration"].map((cat, i) => (
                            <div key={cat} className="flex items-center gap-3">
                                <span className="text-gray-500 text-sm w-4">{i + 1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300">{cat}</span>
                                        <span className="text-gray-500">{100 - i * 15}%</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                            style={{ width: `${100 - i * 15}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
