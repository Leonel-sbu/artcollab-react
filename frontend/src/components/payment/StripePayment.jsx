import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

// Load Stripe - using a test key placeholder
// In production, use environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            color: '#ffffff',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4'
            }
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    }
};

function PaymentForm({ clientSecret, onSuccess, onCancel, amount }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);
        setError(null);

        const cardElement = elements.getElement(CardElement);

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
            }
        });

        if (stripeError) {
            setError(stripeError.message);
            setProcessing(false);
            toast.error(stripeError.message);
        } else if (paymentIntent.status === 'succeeded') {
            toast.success('Payment successful!');
            onSuccess(paymentIntent);
        }

        setProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>

            {error && (
                <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={!stripe || processing}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {processing ? 'Processing...' : `Pay R${amount}`}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default function StripePayment({ clientSecret, amount, onSuccess, onCancel }) {
    if (!clientSecret) {
        return (
            <div className="text-center py-4">
                <p className="text-gray-400">Loading payment form...</p>
            </div>
        );
    }

    return (
        <Elements stripe={stripePromise}>
            <PaymentForm
                clientSecret={clientSecret}
                amount={amount}
                onSuccess={onSuccess}
                onCancel={onCancel}
            />
        </Elements>
    );
}
