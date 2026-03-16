// src/components/cart/Checkout.jsx
import { useState } from "react";
import { CreditCard, ShieldCheck, Lock } from "lucide-react";

export default function Checkout({ cartItems, total, onConfirm, loading }) {
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        cardNumber: "",
        expiry: "",
        cvv: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm?.(formData);
    };

    const subtotal = total;
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping over R500
    const tax = Math.round(subtotal * 0.15); // 15% VAT
    const finalTotal = subtotal + shipping + tax;

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400">Your cart is empty</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>

                <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                        <div key={item._id} className="flex justify-between items-center">
                            <span className="text-gray-300">
                                {item.artwork?.title || "Item"} x {item.quantity}
                            </span>
                            <span className="text-white font-medium">
                                R {((item.artwork?.price || 0) * item.quantity).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-800 pt-4 space-y-2">
                    <div className="flex justify-between text-gray-400">
                        <span>Subtotal</span>
                        <span>R {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? "FREE" : `R ${shipping}`}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                        <span>VAT (15%)</span>
                        <span>R {tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-xl pt-4 border-t border-gray-800">
                        <span>Total</span>
                        <span>R {finalTotal.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Payment Form */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Payment Details</h3>

                {/* Security Badges */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Secure Checkout</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Lock className="w-4 h-4" />
                        <span>SSL Encrypted</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Payment Method
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("card")}
                                className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition ${paymentMethod === "card"
                                        ? "border-blue-500 bg-blue-500/10 text-white"
                                        : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                                    }`}
                            >
                                <CreditCard className="w-5 h-5" />
                                Card
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("eft")}
                                className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition ${paymentMethod === "eft"
                                        ? "border-blue-500 bg-blue-500/10 text-white"
                                        : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                                    }`}
                            >
                                <span className="font-medium">EFT</span>
                            </button>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Name on Card
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="John Doe"
                        />
                    </div>

                    {paymentMethod === "card" && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Card Number
                                </label>
                                <input
                                    type="text"
                                    name="cardNumber"
                                    required
                                    value={formData.cardNumber}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="4242 4242 4242 4242"
                                    maxLength={19}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Expiry Date
                                    </label>
                                    <input
                                        type="text"
                                        name="expiry"
                                        required
                                        value={formData.expiry}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="MM/YY"
                                        maxLength={5}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        CVV
                                    </label>
                                    <input
                                        type="text"
                                        name="cvv"
                                        required
                                        value={formData.cvv}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="123"
                                        maxLength={4}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {paymentMethod === "eft" && (
                        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                            <p className="text-blue-300 text-sm">
                                You will receive banking details via email after placing your order.
                                Payment must be made within 48 hours to secure your items.
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {loading ? "Processing..." : `Pay R ${finalTotal.toLocaleString()}`}
                    </button>
                </form>
            </div>
        </div>
    );
}
