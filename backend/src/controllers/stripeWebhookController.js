/**
 * Stripe Webhook Controller
 * Handles Stripe webhook events for payment processing
 */

const Stripe = require('stripe');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Enrollment = require('../models/Enrollment');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.webhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // Verify webhook signature using raw body
        event = stripe.webhooks.constructEvent(req.body, sig, secret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            await handlePaymentSucceeded(event.data.object);
            break;

        case 'payment_intent.payment_failed':
            await handlePaymentFailed(event.data.object);
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
};

async function handlePaymentSucceeded(paymentIntent) {
    const orderId = paymentIntent.metadata?.orderId;

    if (!orderId) {
        console.error('No orderId in payment intent metadata');
        return;
    }

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            console.error(`Order not found: ${orderId}`);
            return;
        }

        if (order.status === 'paid') {
            console.log(`Order ${orderId} already marked as paid`);
            return;
        }

        // Update order status
        order.status = 'paid';
        order.paymentProvider = 'stripe';
        order.paymentRef = paymentIntent.id;
        await order.save();

        // Create enrollments for course purchases
        const courseItems = (order.items || []).filter(i => i.kind === 'course');

        for (const it of courseItems) {
            await Enrollment.findOneAndUpdate(
                { user: order.user, course: it.refId },
                { $setOnInsert: { user: order.user, course: it.refId } },
                { upsert: true, new: true }
            );
        }

        // Clear the cart
        await Cart.findOneAndUpdate(
            { user: order.user },
            { $set: { items: [], subtotal: 0 } },
            { new: true }
        );

        console.log(`Order ${orderId} marked as paid via webhook`);
    } catch (error) {
        console.error('Error handling payment succeeded:', error);
    }
}

async function handlePaymentFailed(paymentIntent) {
    const orderId = paymentIntent.metadata?.orderId;

    if (orderId) {
        console.log(`Payment failed for order ${orderId}: ${paymentIntent.last_payment_error?.message}`);
        // Could update order status to 'payment_failed' here
    }
}
