// src/components/shared/NotificationDropdown.jsx
import { useState, useEffect, useRef } from "react";
import { Bell, Heart, MessageSquare, ShoppingCart, BookOpen, X, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getNotifications, markAsRead } from "../../services/notificationService";

const NotificationDropdown = () => {
    const { isAuthed } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (isAuthed && isOpen) {
            fetchNotifications();
        }
    }, [isAuthed, isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await getNotifications();
            if (res?.success) {
                setNotifications(res.notifications || []);
            }
        } catch (err) {
            console.error("Failed to load notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case "like":
                return <Heart className="w-4 h-4 text-red-400" />;
            case "comment":
                return <MessageSquare className="w-4 h-4 text-blue-400" />;
            case "order":
            case "purchase":
                return <ShoppingCart className="w-4 h-4 text-green-400" />;
            case "commission":
                return <BookOpen className="w-4 h-4 text-purple-400" />;
            default:
                return <Bell className="w-4 h-4 text-gray-400" />;
        }
    };

    const getNotificationMessage = (notification) => {
        switch (notification.type) {
            case "like":
                return "liked your post";
            case "comment":
                return "commented on your post";
            case "order":
                return "purchased your artwork";
            case "commission":
                return notification.message || "requested a commission";
            default:
                return notification.message || "New notification";
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (!isAuthed) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                        <h3 className="text-white font-semibold">Notifications</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-400">
                                Loading...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 transition ${!notification.isRead ? "bg-blue-500/5" : ""
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white">
                                                <span className="font-semibold">
                                                    {notification.sender?.name || "Someone"}
                                                </span>{" "}
                                                {getNotificationMessage(notification)}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(notification.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification._id)}
                                                className="flex-shrink-0 text-gray-400 hover:text-blue-400"
                                                title="Mark as read"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-800 text-center">
                            <button className="text-sm text-blue-400 hover:text-blue-300">
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
