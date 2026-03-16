import api from './api';

// Cart API endpoints
export const cartService = {
    // Get user's cart
    getCart: async () => {
        const response = await api.get('/api/cart');
        return response.data;
    },

    // Update cart items
    setCart: async (items) => {
        const response = await api.put('/api/cart', { items });
        return response.data;
    },

    // Add single item to cart
    addToCart: async (item) => {
        const { data } = await api.get('/api/cart');
        const currentItems = data.cart?.items || [];

        // Check if item already exists
        const existingIndex = currentItems.findIndex(
            i => i.kind === item.kind && String(i.refId) === String(item.refId)
        );

        let newItems;
        if (existingIndex >= 0) {
            // Update quantity
            newItems = [...currentItems];
            newItems[existingIndex] = {
                ...newItems[existingIndex],
                qty: (newItems[existingIndex].qty || 1) + (item.qty || 1)
            };
        } else {
            newItems = [...currentItems, item];
        }

        const response = await api.put('/api/cart', { items: newItems });
        return response.data;
    },

    // Remove item from cart
    removeFromCart: async (itemId) => {
        const { data } = await api.get('/api/cart');
        const currentItems = data.cart?.items || [];
        const newItems = currentItems.filter(i => String(i._id || i.id) !== String(itemId));

        const response = await api.put('/api/cart', { items: newItems });
        return response.data;
    },

    // Clear cart
    clearCart: async () => {
        const response = await api.delete('/api/cart');
        return response.data;
    },

    // Checkout - create order
    checkout: async () => {
        const response = await api.post('/api/orders/checkout');
        return response.data;
    },

    // Get Stripe payment intent
    createPaymentIntent: async (orderId) => {
        const response = await api.post('/api/payments/create-payment-intent', { orderId });
        return response.data;
    },

    // Confirm payment
    confirmPayment: async (orderId, paymentIntentId) => {
        const response = await api.post('/api/payments/confirm', { orderId, paymentIntentId });
        return response.data;
    },

    // Get user's orders
    getOrders: async () => {
        const response = await api.get('/api/orders/mine');
        return response.data;
    }
};

// Currency formatter for ZAR
export const formatZAR = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: 2
    }).format(amount);
};

// Convert USD to ZAR (approximate rate - should fetch from API in production)
export const convertToZAR = (usdAmount, rate = 18.5) => {
    return usdAmount * rate;
};
