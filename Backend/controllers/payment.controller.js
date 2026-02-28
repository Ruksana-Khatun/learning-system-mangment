import ErrorApp from "../utils/error.utils.js";
import User from "../models/user.model.js";
import { razorpay } from "../server.js";
import crypto from 'crypto';
import payment from '../models/payment.model.js';


const ensureRazorpayConfigured = (next) => {
    if (!razorpay) {
        next(new ErrorApp('Payment service is not configured on server', 503));
        return false;
    }
    return true;
};


export const getRazorpayKey = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: "Razorpay api key",
            key: process.env.RAZORPAY_API_KEY,
        });
    } catch (error) {
        return next(new ErrorApp('Failed to fetch razorpay key', 500));
    }
}

export const buySubscription = async (req, res, next) => {
    try {
        if (!ensureRazorpayConfigured(next)) return;

        const { id } = req.user;
        const user = await User.findById(id);

        if (!user) {
            return next(new ErrorApp('Unauthorized', 404));
        }

        if (user.role === 'admin') {
            return next(new ErrorApp('Admin cannot buy subscription', 403));
        }

        const subscription = await razorpay.subscriptions.create({
            plan_id: process.env.RAZORPAY_PLAN_ID,
            customer_notify: 1,
             total_count: 12 
        });
                   
              



        if (!user.subscription) {
          user.subscription = {};
        }

          user.subscription.id = subscription.id;
        user.subscription.status = subscription.status;
         await user.save();
        // user.subscription.id = subscription.id;
        // user.subscription.status = subscription.status;
        // await user.save();

        res.status(200).json({
            success: true,
            message: "Subscription created successfully",
            subscription_id: subscription.id,
        });
    } catch (error) {
        console.error("Subscription Error:", error); 
        return next(new ErrorApp('Failed to create subscription', 500));
    }
}

export const verifySubscription = async (req, res, next) => {
    try {
        if (!ensureRazorpayConfigured(next)) return;

        const { id } = req.user;
        console.log('Request body:', req.body);

        const { razorpay_payment_id, razorpay_signature, razorpay_subscription } = req.body;
        const user = await User.findById(id);

        if (!user) {
            return next(new ErrorApp('Unauthorized please login', 404));
        }

        const subscription_id = user.subscription.id;

        if (!subscription_id) {
            return next(new ErrorApp('No subscription found', 404));
        }

        const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_API_SECRET)
            .update(`${razorpay_subscription}|${razorpay_payment_id}`)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return next(new ErrorApp('payment not verified please try again', 500));
        }

        await payment.create({
            razorpay_payment_id,
            razorpay_signature,
            razorpay_subscription,
        });

        user.subscription.status = 'active';
        await user.save();

        res.status(200).json({
            success: true,
            message: "Subscription verified successfully",
        });
    } catch (error) {
        return next(new ErrorApp('Failed to verify subscription', 500));
    }
}

export const cancelSubscribe = async (req, res, next) => {
    try {
        if (!ensureRazorpayConfigured(next)) return;

        console.log("Step 1: Checking if req.user exists");
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return next(new ErrorApp('Unauthorized', 401));
        }

        console.log("Step 2: Found user by ID:", userId);

        const subscriptionId = user.subscription?.id;

        if (!subscriptionId) {
            return next(new ErrorApp('No active subscription found', 404));
        }

        console.log("Step 3: Found subscription ID:", subscriptionId);

        await razorpay.subscriptions.cancel(subscriptionId);
        user.subscription.status = 'cancelled';
        await user.save();

        res.status(200).json({
            success: true,
            message: "Subscription cancelled successfully",
        });
    } catch (error) {
        console.error("❌ Subscription Cancel Error:", error);
        return next(new ErrorApp('Failed to cancel subscription', 500));
    }
};




// One-time payment for a single course
const COURSE_AMOUNT_PAISE = 4000 * 100; // ₹4000 in paise

export const createCourseOrder = async (req, res, next) => {
    try {
        if (!ensureRazorpayConfigured(next)) return;

        const { courseId } = req.body;
        if (!courseId) {
            return next(new ErrorApp('Course ID is required', 400));
        }

        const order = await razorpay.orders.create({
            amount: COURSE_AMOUNT_PAISE,
            currency: 'INR',
        });

        res.status(200).json({
            success: true,
            order_id: order.id,
            courseId,
        });
    } catch (error) {
        console.error('Create order error:', error);
        return next(new ErrorApp('Failed to create order', 500));
    }
};

export const verifyCoursePayment = async (req, res, next) => {
    try {
        if (!ensureRazorpayConfigured(next)) return;

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId) {
            return next(new ErrorApp('Missing payment or course details', 400));
        }

        const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_API_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return next(new ErrorApp('Payment verification failed', 400));
        }

        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return next(new ErrorApp('User not found', 404));
        }

        if (!user.enrolledCourses) {
            user.enrolledCourses = [];
        }
        const alreadyEnrolled = user.enrolledCourses.some(
            (id) => id.toString() === courseId.toString()
        );
        if (!alreadyEnrolled) {
            user.enrolledCourses.push(courseId);
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: 'Course purchased successfully',
        });
    } catch (error) {
        console.error('Verify course payment error:', error);
        return next(new ErrorApp('Failed to verify payment', 500));
    }
};

export const allPayment = async (req, res, next) => {
    try {
        const payments = await payment.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            payments,
            allPayments: payments,
            finalMonths: {},
            monthlySalesRecord: Array(12).fill(0),
        });
    } catch (error) {
        return next(new ErrorApp('Failed to fetch payments', 500));
    }
}