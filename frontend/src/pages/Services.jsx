// src/pages/Services.jsx - Complete Services Page with Full Backend Integration
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Palette, Search, Filter, Plus, X, Clock, CheckCircle,
    Star, Trash2, Edit, Eye, Calendar, DollarSign,
    Image as ImageIcon, Briefcase, ShoppingBag, User, ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
    getServices, getMyServices, getMyBookings, getCategories,
    getService, createService, bookService, updateService,
    updateStatus, deleteService
} from "../services/commissionService";

// Category icons mapping
const categoryIcons = {
    portrait: "👤", landscape: "🏞️", digital: "💻", traditional: "🎨",
    "3d": "🎲", animation: "🎬", nft: "🔷", logo: "📌",
    illustration: "✏️", other: "🎭"
};

const statusColors = {
    requested: "bg-yellow-500/20 text-yellow-400",
    accepted: "bg-blue-500/20 text-blue-400",
    in_progress: "bg-purple-500/20 text-purple-400",
    delivered: "bg-green-500/20 text-green-400",
    completed: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400"
};

const Services = () => {
    const { user, isAuthed } = useAuth();

    // Tab state
    const [activeTab, setActiveTab] = useState("browse"); // browse, my-services, bookings

    // Data state
    const [services, setServices] = useState([]);
    const [myServices, setMyServices] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter state
    const [filters, setFilters] = useState({
        search: "",
        category: "",
        minPrice: "",
        maxPrice: ""
    });

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "illustration",
        deliveryDays: 7,
        revisions: 3,
        budget: "",
        features: "",
        tags: ""
    });

    const [bookingData, setBookingData] = useState({
        title: "",
        description: "",
        budget: ""
    });

    // Fetch data on mount and tab change
    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadData();
    }, [activeTab, filters]);

    const loadCategories = async () => {
        try {
            const res = await getCategories();
            if (res?.success) {
                setCategories(res.categories);
            }
        } catch (err) {
            console.error("Failed to load categories:", err);
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === "browse") {
                const params = {};
                if (filters.search) params.search = filters.search;
                if (filters.category) params.category = filters.category;
                if (filters.minPrice) params.minPrice = filters.minPrice;
                if (filters.maxPrice) params.maxPrice = filters.maxPrice;

                const res = await getServices(params);
                if (res?.success) {
                    setServices(res.items || []);
                }
            } else if (activeTab === "my-services") {
                const res = await getMyServices();
                if (res?.success) {
                    setMyServices(res.items || []);
                }
            } else if (activeTab === "bookings") {
                const res = await getMyBookings();
                if (res?.success) {
                    setMyBookings(res.items || []);
                }
            }
        } catch (err) {
            console.error("Failed to load data:", err);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    // Create service
    const handleCreateService = async (e) => {
        e.preventDefault();

        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("category", formData.category);
            data.append("deliveryDays", formData.deliveryDays);
            data.append("revisions", formData.revisions);
            data.append("budget", formData.budget || 0);
            data.append("features", formData.features);
            data.append("tags", formData.tags);

            const res = await createService(data);
            if (res?.success) {
                toast.success("Service created successfully!");
                setShowCreateModal(false);
                setFormData({
                    title: "", description: "", category: "illustration",
                    deliveryDays: 7, revisions: 3, budget: "", features: "", tags: ""
                });
                loadData();
            } else {
                toast.error(res?.message || "Failed to create service");
            }
        } catch (err) {
            toast.error("Failed to create service");
        }
    };

    // Book service - validates before sending request
    const handleBookService = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!bookingData.title?.trim()) {
            toast.error("Project title is required");
            return;
        }
        if (!bookingData.description?.trim()) {
            toast.error("Project details are required");
            return;
        }
        const budgetNum = parseFloat(bookingData.budget);
        if (!bookingData.budget || isNaN(budgetNum) || budgetNum <= 0) {
            toast.error("Please enter a valid positive budget");
            return;
        }

        // Prevent booking demo services
        if (selectedService.isDemo) {
            toast.error("Demo services cannot be booked");
            return;
        }

        try {
            // Build payload - backend gets serviceId from URL, so only send booking details
            const payload = {
                title: bookingData.title.trim(),
                description: bookingData.description.trim(),
                budget: budgetNum
            };

            const res = await bookService(selectedService._id, payload);
            if (res?.success) {
                toast.success("Service booked successfully!");
                setShowBookingModal(false);
                setBookingData({ title: "", description: "", budget: "" });
                // Refresh bookings and switch to bookings tab
                loadData();
                setActiveTab("bookings");
            } else {
                toast.error(res?.message || "Failed to book service");
            }
        } catch (err) {
            console.error("Book service error:", err);
            toast.error(err?.response?.data?.message || "Failed to book service");
        }
    };

    // Update status
    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const res = await updateStatus(id, newStatus);
            if (res?.success) {
                toast.success(`Status updated to ${newStatus}`);
                loadData();
            } else {
                toast.error(res?.message || "Failed to update status");
            }
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    // Delete service
    const handleDeleteService = async (id) => {
        if (!confirm("Are you sure you want to delete this service?")) return;

        try {
            const res = await deleteService(id);
            if (res?.success) {
                toast.success("Service deleted");
                loadData();
            } else {
                toast.error(res?.message || "Failed to delete");
            }
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    // View service details
    const handleViewService = async (service) => {
        try {
            const res = await getService(service._id);
            if (res?.success) {
                setSelectedService(res.item);
                setShowViewModal(true);
            }
        } catch (err) {
            toast.error("Failed to load service details");
        }
    };

    // Default services for browsing when API is empty
    // Marked as isDemo: true to prevent booking requests to backend
    const defaultServices = [
        { _id: "1", title: "Custom Portrait Commission", description: "Professional portrait artwork tailored to your vision", category: "portrait", budget: 500, deliveryDays: 14, revisions: 3, artist: { name: "Artists" }, features: ["High resolution", "2 revisions included", "Source files"], isDemo: true },
        { _id: "2", title: "Digital Illustration", description: "Custom digital artwork for any purpose", category: "digital", budget: 300, deliveryDays: 7, revisions: 2, artist: { name: "Digital Studios" }, features: ["PNG & JPEG", "1 revision", "Commercial use"], isDemo: true },
        { _id: "3", title: "NFT Artwork", description: "Unique NFT-ready artwork for collection", category: "nft", budget: 200, deliveryDays: 5, revisions: 1, artist: { name: "NFT Creators" }, features: ["Multiple formats", "Metadata ready", "Collection ready"], isDemo: true },
        { _id: "4", title: "Logo Design", description: "Professional logo design for your brand", category: "logo", budget: 400, deliveryDays: 10, revisions: 3, artist: { name: "Design Pro" }, features: ["Vector files", "Brand guidelines", "Unlimited concepts"], isDemo: true },
    ];

    const displayServices = services.length > 0 ? services : defaultServices;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Art Services Marketplace
                    </h1>
                    <p className="text-gray-400">Find the perfect artist for your commission or offer your services</p>
                </motion.div>

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-gray-800/50 rounded-xl p-1 flex gap-1">
                        {[
                            { id: "browse", label: "Browse Services", icon: Search },
                            { id: "my-services", label: "My Services", icon: Briefcase },
                            { id: "bookings", label: "My Bookings", icon: ShoppingBag }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 rounded-lg flex items-center gap-2 transition ${activeTab === tab.id
                                    ? "bg-purple-600 text-white"
                                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Browse Tab Filters */}
                {activeTab === "browse" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-800/30 rounded-xl p-4 mb-8">
                        <div className="flex flex-wrap gap-4 items-center">
                            {/* Search */}
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search services..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                ))}
                            </select>

                            {/* Price Range */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                    className="w-24 px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                    className="w-24 px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                />
                            </div>

                            {/* Create Button */}
                            {isAuthed && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold flex items-center gap-2 hover:opacity-90"
                                >
                                    <Plus className="w-5 h-5" />
                                    Create Service
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Services Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                        <p className="mt-4 text-gray-400">Loading...</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(activeTab === "browse" ? displayServices : activeTab === "my-services" ? myServices : myBookings).map((service, index) => (
                            <motion.div
                                key={service._id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-gray-800/50 border border-gray-700 overflow-hidden hover:border-purple-500/50 transition group"
                            >
                                {/* Card Header */}
                                <div className="p-5 border-b border-gray-700">
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="text-3xl">{categoryIcons[service.category] || "🎨"}</span>
                                        {service.featured && (
                                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Featured</span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                                    <p className="text-gray-400 text-sm line-clamp-2">{service.description}</p>
                                </div>

                                {/* Card Body */}
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-300">{service.artist?.name || "Artist"}</span>
                                    </div>

                                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {service.deliveryDays || 7} days
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" />
                                            {service.revisions || 3} revisions
                                        </span>
                                    </div>

                                    {/* Status Badge (for bookings) */}
                                    {activeTab === "bookings" && service.status && (
                                        <div className="mb-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[service.status] || "bg-gray-500/20 text-gray-400"}`}>
                                                {service.status.replace("_", " ").toUpperCase()}
                                            </span>
                                        </div>
                                    )}

                                    {/* Price */}
                                    <div className="text-2xl font-bold text-purple-400 mb-4">
                                        R {(service.budget || service.pricing?.basic?.price || 0).toLocaleString()}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {activeTab === "browse" ? (
                                            <>
                                                <button
                                                    onClick={() => { setSelectedService(service); setShowViewModal(true); }}
                                                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition"
                                                >
                                                    View
                                                </button>
                                                {isAuthed && !service.isDemo && (
                                                    <button
                                                        onClick={() => { setSelectedService(service); setShowBookingModal(true); }}
                                                        className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 rounded-lg text-sm font-medium transition"
                                                    >
                                                        Book
                                                    </button>
                                                )}
                                                {isAuthed && service.isDemo && (
                                                    <button
                                                        disabled
                                                        className="flex-1 py-2 bg-gray-600 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
                                                    >
                                                        Demo
                                                    </button>
                                                )}
                                            </>
                                        ) : activeTab === "my-services" ? (
                                            <>
                                                <button
                                                    onClick={() => handleDeleteService(service._id)}
                                                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                {service.status === "requested" && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(service._id, "accepted")}
                                                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition"
                                                    >
                                                        Accept
                                                    </button>
                                                )}
                                                {service.status === "accepted" && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(service._id, "completed")}
                                                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && (activeTab === "browse" ? displayServices : activeTab === "my-services" ? myServices : myBookings).length === 0 && (
                    <div className="text-center py-16">
                        <Palette className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No services found</h3>
                        <p className="text-gray-400 mb-6">
                            {activeTab === "browse"
                                ? "Try adjusting your filters or check back later"
                                : activeTab === "my-services"
                                    ? "Create your first service to get started"
                                    : "Book a service to see your bookings here"}
                        </p>
                        {activeTab === "my-services" && isAuthed && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold"
                            >
                                Create Service
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Create Service Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto"
                    >
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full my-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Create New Service</h2>
                                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateService} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Service Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        placeholder="e.g., Custom Portrait Commission"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-2">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-2">Starting Price (ZAR)</label>
                                        <input
                                            type="number"
                                            value={formData.budget}
                                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                            placeholder="500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-2">Delivery Days</label>
                                        <input
                                            type="number"
                                            value={formData.deliveryDays}
                                            onChange={(e) => setFormData({ ...formData, deliveryDays: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-2">Revisions Included</label>
                                        <input
                                            type="number"
                                            value={formData.revisions}
                                            onChange={(e) => setFormData({ ...formData, revisions: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-24"
                                        placeholder="Describe your service in detail..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Features (comma separated)</label>
                                    <input
                                        type="text"
                                        value={formData.features}
                                        onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        placeholder="High resolution, Source files, Commercial use"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        placeholder="portrait, digital, artwork"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 rounded-lg font-semibold"
                                >
                                    Create Service
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Booking Modal */}
            <AnimatePresence>
                {showBookingModal && selectedService && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-gray-800 rounded-2xl p-6 max-w-md w-full">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Book Service</h2>
                                <button onClick={() => setShowBookingModal(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold">{selectedService.title}</h3>
                                <p className="text-gray-400 text-sm">by {selectedService.artist?.name}</p>
                                <p className="text-purple-400 font-bold mt-2">R {(selectedService.budget || 0).toLocaleString()}</p>
                            </div>

                            <form onSubmit={handleBookService} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Project Title *</label>
                                    <input
                                        type="text"
                                        value={bookingData.title}
                                        onChange={(e) => setBookingData({ ...bookingData, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        placeholder="My custom portrait"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Project Details</label>
                                    <textarea
                                        value={bookingData.description}
                                        onChange={(e) => setBookingData({ ...bookingData, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-24"
                                        placeholder="Describe what you want..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Your Budget (ZAR)</label>
                                    <input
                                        type="number"
                                        value={bookingData.budget}
                                        onChange={(e) => setBookingData({ ...bookingData, budget: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        placeholder={selectedService.budget}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 rounded-lg font-semibold"
                                >
                                    Confirm Booking
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* View Service Modal */}
            <AnimatePresence>
                {showViewModal && selectedService && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="text-4xl">{categoryIcons[selectedService.category] || "🎨"}</span>
                                    <h2 className="text-2xl font-bold mt-2">{selectedService.title}</h2>
                                </div>
                                <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-gray-400">
                                    <span className="flex items-center gap-1"><User className="w-4 h-4" /> {selectedService.artist?.name}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedService.deliveryDays || 7} days</span>
                                    <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> {selectedService.revisions || 3} revisions</span>
                                </div>

                                <p className="text-gray-300">{selectedService.description}</p>

                                <div className="text-3xl font-bold text-purple-400">
                                    R {(selectedService.budget || 0).toLocaleString()}
                                </div>

                                {selectedService.features?.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-2">What's Included:</h4>
                                        <ul className="space-y-2">
                                            {selectedService.features.map((feature, i) => (
                                                <li key={i} className="flex items-center gap-2 text-gray-300">
                                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {isAuthed && !selectedService?.isDemo && (
                                <button
                                    onClick={() => { setShowViewModal(false); setShowBookingModal(true); }}
                                    className="w-full mt-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 rounded-lg font-semibold"
                                >
                                    Book This Service
                                </button>
                            )}
                            {isAuthed && selectedService?.isDemo && (
                                <button
                                    disabled
                                    className="w-full mt-6 py-3 bg-gray-600 text-gray-400 rounded-lg font-semibold cursor-not-allowed"
                                >
                                    Demo - Cannot Book
                                </button>
                            )}
                            {!isAuthed && (
                                <button
                                    onClick={() => toast.error("Please login to book services")}
                                    className="w-full mt-6 py-3 bg-gray-600 text-gray-300 rounded-lg font-semibold"
                                >
                                    Login to Book
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Services;
