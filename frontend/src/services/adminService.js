import api from './api';

export const adminService = {
    getStats: async () => {
        const { data } = await api.get('/api/admin/stats');
        return data;
    },

    // Users
    getUsers: async (page = 1, limit = 20) => {
        const { data } = await api.get('/api/admin/users', { params: { page, limit } });
        return data;
    },
    updateUserRole: async (id, role) => {
        const { data } = await api.put(`/api/admin/users/${id}/role`, { role });
        return data;
    },
    deleteUser: async (id) => {
        const { data } = await api.delete(`/api/admin/users/${id}`);
        return data;
    },

    // Artworks
    getPendingArtworks: async () => {
        const { data } = await api.get('/api/artworks/pending');
        return data;
    },
    approveArtwork: async (id) => {
        const { data } = await api.post(`/api/artworks/${id}/approve`);
        return data;
    },
    rejectArtwork: async (id) => {
        const { data } = await api.post(`/api/artworks/${id}/reject`);
        return data;
    },

    // Reports
    getReports: async () => {
        const { data } = await api.get('/api/admin/reports');
        return data;
    },
    updateReportStatus: async (id, status) => {
        const { data } = await api.put(`/api/admin/reports/${id}/status`, { status });
        return data;
    },

    // Courses
    getAllCourses: async (page = 1, limit = 20, status = '') => {
        const params = { page, limit };
        if (status) params.status = status;
        const { data } = await api.get('/api/admin/courses', { params });
        return data;
    },
    setCourseStatus: async (id, status) => {
        const { data } = await api.put(`/api/admin/courses/${id}/status`, { status });
        return data;
    },

    // Orders
    getAllOrders: async (page = 1, limit = 20, status = '') => {
        const params = { page, limit };
        if (status) params.status = status;
        const { data } = await api.get('/api/admin/orders', { params });
        return data;
    },

    // Enrollments / Students
    getEnrollments: async (page = 1, limit = 20, courseId = '', userId = '') => {
        const params = { page, limit };
        if (courseId) params.courseId = courseId;
        if (userId) params.userId = userId;
        const { data } = await api.get('/api/admin/enrollments', { params });
        return data;
    },
    removeEnrollment: async (id) => {
        const { data } = await api.delete(`/api/admin/enrollments/${id}`);
        return data;
    },
};

export const formatZAR = (amount) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 2 }).format(amount || 0);
