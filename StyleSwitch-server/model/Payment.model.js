import mongoose from "mongoose";

export const PAYMENT_METHODS = [
    "CARD",
    "UPI",
    "NETBANKING",
    "WALLET",
    "OTHER",
];

const PaymentSchema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
        },

        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        razorpayOrderId: {
            type: String,
            required: true,
            unique: true,
        },

        razorpayPaymentId: {
            type: String,
            default: null,
        },

        razorpaySignature: {
            type: String,
            default: null,
        },

        status: {
            type: String,
            enum: ["CREATED", "PENDING", "SUCCESS", "FAILED", "REFUNDED"],
            default: "CREATED",
        },

        paymentMethod: {
            type: String,
            enum: PAYMENT_METHODS,
            default: "OTHER",
        },

        paidAt: {
            type: Date,
            default: null,
        },

        // Refund fields
        refundId: {
            type: String,
            default: null,
        },
        refundStatus: {
            type: String,
            enum: ["NONE", "PENDING", "REFUNDED", "FAILED"],
            default: "NONE",
        },
        refundReason: {
            type: String,
            default: null,
        },
        refundAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        refundedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Payment = mongoose.model("Payment", PaymentSchema);

export default Payment;
