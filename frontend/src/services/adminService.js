import api from './api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Admin API endpoints
export const adminService = {
    // Get admin stats
    getStats: async () => {
        const response = await api.get('/api/admin/stats');
        return response.data;
    },

    // Get all users
    getUsers: async () => {
        const response = await api.get('/api/admin/users');
        return response.data;
    },

    // Get pending artworks (using the new endpoint)
    getPendingArtworks: async () => {
        const response = await api.get('/api/artworks/pending');
        return response.data;
    },

    // Approve artwork - publish to marketplace
    approveArtwork: async (id) => {
        const response = await api.post(`/api/artworks/${id}/approve`);
        return response.data;
    },

    // Reject artwork
    rejectArtwork: async (id) => {
        const response = await api.post(`/api/artworks/${id}/reject`);
        return response.data;
    },

    // Update artwork status
    updateArtworkStatus: async (id, status) => {
        const response = await api.put(`/api/admin/artworks/${id}/status`, { status });
        return response.data;
    },

    // Get all reports
    getReports: async () => {
        const response = await api.get('/api/admin/reports');
        return response.data;
    },

    // Update report status
    updateReportStatus: async (id, status) => {
        const response = await api.put(`/api/admin/reports/${id}/status`, { status });
        return response.data;
    },

    // Delete user
    deleteUser: async (id) => {
        const response = await api.delete(`/api/admin/users/${id}`);
        return response.data;
    },

    // Update user role
    updateUserRole: async (id, role) => {
        const response = await api.put(`/api/admin/users/${id}/role`, { role });
        return response.data;
    },

    // Get all orders (admin)
    getAllOrders: async () => {
        const response = await api.get('/api/admin/orders');
        return response.data;
    },

    // Get all courses (admin)
    getAllCourses: async () => {
        const response = await api.get('/api/admin/courses');
        return response.data;
    }
};

// Format currency
export const formatZAR = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: 2
    }).format(amount);
};
