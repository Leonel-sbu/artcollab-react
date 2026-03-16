import api from "./api";

// Get all services with filters
export async function getServices(params = {}) {
    const { data } = await api.get("/api/commissions", { params });
    return data;
}

// Get my services (created by logged in artist)
export async function getMyServices() {
    const { data } = await api.get("/api/commissions/my-services");
    return data;
}

// Get my bookings (where I'm the buyer)
export async function getMyBookings() {
    const { data } = await api.get("/api/commissions/my-bookings");
    return data;
}

// Get categories
export async function getCategories() {
    const { data } = await api.get("/api/commissions/categories");
    return data;
}

// Get single service
export async function getService(id) {
    const { data } = await api.get(`/api/commissions/${id}`);
    return data;
}

// Create a new service (artist offering)
export async function createService(formData) {
    const { data } = await api.post("/api/commissions", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
}

// Book a service (buyer requesting)
export async function bookService(serviceId, bookingData) {
    const { data } = await api.post(`/api/commissions/${serviceId}/book`, bookingData);
    return data;
}

// Update service
export async function updateService(id, updateData) {
    const { data } = await api.patch(`/api/commissions/${id}`, updateData);
    return data;
}

// Update booking status
export async function updateStatus(id, status) {
    const { data } = await api.patch(`/api/commissions/${id}/status`, { status });
    return data;
}

// Delete service
export async function deleteService(id) {
    const { data } = await api.delete(`/api/commissions/${id}`);
    return data;
}
