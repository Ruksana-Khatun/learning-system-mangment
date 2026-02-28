import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    type: {
        type: String,
        enum: ["one-time", "subscription"],
        required: true,
    },

    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: function () {
            return this.type === "one-time";
        },
    },

    planId: {
        type: String,
        required: function () {
            return this.type === "subscription";
        },
    },

    amount: {
        type: Number,
        required: true,
    },

    razorpay_payment_id: {
        type: String,
        required: function () {
            return this.type === "one-time";
        },
    },

    razorpay_subscription_id: {
        type: String,
        default: null,
    },

    razorpay_signature: {
        type: String,
        required: true,
    },

    status: {
        type: String,
        enum: ["created", "paid", "failed", "active", "cancelled"],
        default: "created",
    }

}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;