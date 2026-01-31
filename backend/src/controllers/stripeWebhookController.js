const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

async function fulfillOrder(orderId, paymentIntentId) {
    const order = await Order.findById(orderId);
    if (!order) return;

    if (order.status !== "paid") {
        order.status = "paid";
        order.paymentProvider = "stripe";
        order.paymentRef = paymentIntentId;
        await order.save();
    }

    const courseItems = (order.items || []).filter((i) => i.kind === "course");
    for (const it of courseItems) {
        const course = await Course.findById(it.refId);
        if (!course) continue;

        await Enrollment.findOneAndUpdate(
            { user: order.user, course: it.refId },
            { $setOnInsert: { user: order.user, course: it.refId } },
            { upsert: true, new: true }
        );
    }

    await Cart.findOneAndUpdate(
        { user: order.user },
        { $set: { items: [], subtotal: 0 } },
        { new: true }
    );
}

exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const whSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, whSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        if (event.type === "payment_intent.succeeded") {
            const pi = event.data.object;

            // Best: use metadata.orderId you set when creating PI
            const orderId = pi.metadata?.orderId;

            if (orderId) {
                await fulfillOrder(orderId, pi.id);
            } else {
                // fallback: find order by paymentRef
                const order = await Order.findOne({ paymentRef: pi.id });
                if (order) await fulfillOrder(order._id, pi.id);
            }
        }

        // Add more events later if needed

        res.json({ received: true });
    } catch (e) {
        res.status(500).json({ received: true, error: e.message });
    }
};
