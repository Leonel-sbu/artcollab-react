import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartService, formatZAR } from '../services/cartService';
import toast from 'react-hot-toast';
import { Trash2, ShoppingBag, CreditCard, ArrowRight, Loader } from 'lucide-react';
import StripePayment from '../components/payment/StripePayment';

export default function Cart() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkingOut, setCheckingOut] = useState(false);
    const [subtotal, setSubtotal] = useState(0);
    const [showPayment, setShowPayment] = useState(false);
    const [paymentIntent, setPaymentIntent] = useState(null);
    const [currentOrder, setCurrentOrder] = useState(null);

    // Load cart from backend
    useEffect(() => {
        if (user) {
            loadCart();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadCart = async () => {
        try {
            setLoading(true);
            const response = await cartService.getCart();
            if (response.success) {
                setCartItems(response.cart?.items || []);
                setSubtotal(response.subtotal || 0);
            }
        } catch (error) {
            console.error('Failed to load cart:', error);
            toast.error('Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (itemId) => {
        try {
            const response = await cartService.removeFromCart(itemId);
            if (response.success) {
                setCartItems(response.cart?.items || []);
                setSubtotal(response.subtotal || 0);
                toast.success('Item removed from cart');
            }
        } catch (error) {
            console.error('Failed to remove item:', error);
            toast.error('Failed to remove item');
        }
    };

    const updateQuantity = async (itemId, delta) => {
        try {
            const { data } = await cartService.getCart();
            const items = data.cart?.items || [];
            const updatedItems = items.map(item => {
                if (String(item._id || item.id) === String(itemId)) {
                    return { ...item, qty: Math.max(1, (item.qty || 1) + delta) };
                }
                return item;
            });

            const response = await cartService.setCart(updatedItems);
            if (response.success) {
                setCartItems(response.cart?.items || []);
                setSubtotal(response.subtotal || 0);
            }
        } catch (error) {
            console.error('Failed to update quantity:', error);
            toast.error('Failed to update quantity');
        }
    };

    const clearCart = async () => {
        try {
            const response = await cartService.clearCart();
            if (response.success) {
                setCartItems([]);
                setSubtotal(0);
                toast.success('Cart cleared');
            }
        } catch (error) {
            console.error('Failed to clear cart:', error);
            toast.error('Failed to clear cart');
        }
    };

    const handleCheckout = async () => {
        if (!user) {
            toast.error('Please login to checkout');
            navigate('/login');
            return;
        }

        if (cartItems.length === 0) {
            toast.error('Cart is empty');
            return;
        }

        try {
            setCheckingOut(true);

            // Create order and get payment intent
            const orderResponse = await cartService.checkout();

            if (orderResponse.success && orderResponse.order) {
                // Get Stripe payment intent
                const paymentResponse = await cartService.createPaymentIntent(orderResponse.order._id);

                if (paymentResponse.success) {
                    // Show payment form instead of redirecting
                    setCurrentOrder(orderResponse.order);
                    setPaymentIntent(paymentResponse.clientSecret);
                    setShowPayment(true);
                }
            }
        } catch (error) {
            console.error('Checkout failed:', error);
            toast.error(error.response?.data?.message || 'Checkout failed');
        } finally {
            setCheckingOut(false);
        }
    };

    // Handle successful payment
    const handlePaymentSuccess = async (paymentIntent) => {
        try {
            // Confirm the payment on backend
            await cartService.confirmPayment(currentOrder._id, paymentIntent.id);
            await loadCart();
            setShowPayment(false);
            setPaymentIntent(null);
            setCurrentOrder(null);
            toast.success('Payment successful! Thank you for your purchase.');
            navigate('/profile?tab=purchases');
        } catch (error) {
            console.error('Payment confirmation failed:', error);
            toast.error('Payment confirmed but failed to update order');
        }
    };

    // Cancel payment
    const handlePaymentCancel = () => {
        setShowPayment(false);
        setPaymentIntent(null);
        setCurrentOrder(null);
    };

    // Calculate totals in ZAR
    const tax = subtotal * 0.15; // 15% VAT
    const shipping = subtotal > 1500 ? 0 : 99; // Free shipping over R1500
    const total = subtotal + tax + shipping;

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex-1 py-8 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12">
                        <ShoppingBag className="w-24 h-24 mx-auto text-gray-400 mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Login Required</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">Please login to view your cart</p>
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

    if (cartItems.length === 0) {
        return (
            <div className="flex-1 py-8 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12">
                        <ShoppingBag className="w-24 h-24 mx-auto text-gray-400 mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">Looks like you haven't added anything to your cart yet.</p>
                        <button
                            onClick={() => navigate('/marketplace')}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                        >
                            Start Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
                    <button
                        onClick={clearCart}
                        className="text-red-500 hover:text-red-600 text-sm"
                    >
                        Clear Cart
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item._id || item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex gap-4">
                                {/* Image */}
                                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                                    {item.image ? (
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ShoppingBag className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className={`text-xs px-2 py-1 rounded-full ${item.kind === 'artwork'
                                                ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                                                : item.kind === 'course'
                                                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                                }`}>
                                                {item.kind === 'artwork' ? 'Artwork' : item.kind === 'course' ? 'Course' : 'Product'}
                                            </span>
                                            <h3 className="font-semibold text-gray-900 dark:text-white mt-2">{item.title}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {item.artist ? `by ${item.artist}` : item.instructor ? `by ${item.instructor}` : ''}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item._id || item.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        {/* Quantity */}
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => updateQuantity(item._id || item.id, -1)}
                                                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center text-gray-900 dark:text-white font-medium">{item.qty || 1}</span>
                                            <button
                                                onClick={() => updateQuantity(item._id || item.id, 1)}
                                                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Price */}
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                            {formatZAR((item.price || 0) * (item.qty || 1))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => navigate('/marketplace')}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm flex items-center gap-1"
                        >
                            ← Continue Shopping
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>

                            <div className="space-y-3 border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span>{formatZAR(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>VAT (15%)</span>
                                    <span>{formatZAR(tax)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Shipping</span>
                                    <span className={shipping === 0 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                                        {shipping === 0 ? 'FREE' : formatZAR(shipping)}
                                    </span>
                                </div>
                                {shipping > 0 && (
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                        Add {formatZAR(1500 - subtotal)} more for free shipping!
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white mb-6">
                                <span>Total (ZAR)</span>
                                <span>{formatZAR(total)}</span>
                            </div>

                            {/* Payment Form */}
                            {showPayment ? (
                                <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                                    <h3 className="text-lg font-semibold text-white mb-4">Complete Your Payment</h3>
                                    <StripePayment
                                        clientSecret={paymentIntent}
                                        amount={total}
                                        onSuccess={handlePaymentSuccess}
                                        onCancel={handlePaymentCancel}
                                    />
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={handleCheckout}
                                        disabled={checkingOut}
                                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        {checkingOut ? (
                                            <>
                                                <Loader className="w-5 h-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-5 h-5" />
                                                Checkout with Stripe
                                            </>
                                        )}
                                    </button>

                                    <div className="mt-4 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                                        <CreditCard className="w-4 h-4 mr-1" />
                                        Secure payment via Stripe
                                    </div>

                                    {/* Payment Methods */}
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-3">Accepted Payment Methods</p>
                                        <div className="flex justify-center space-x-2">
                                            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                                                Visa
                                            </div>
                                            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                                                Mastercard
                                            </div>
                                            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                                                Amex
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
