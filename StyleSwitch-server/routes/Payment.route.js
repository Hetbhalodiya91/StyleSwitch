import express from "express";
import { createOrder, createPayment, confirmPayment, razorpayWebhook, refundDeposit } from "../controller/Payment.controller.js";
import { protect } from "../middleware/Auth.middleware.js";

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/", protect, createPayment);
router.post("/:id/confirm", protect, confirmPayment);
router.post("/:id/refund-deposit", protect, refundDeposit);

// Razorpay webhook needs raw body for signature verification
router.post("/webhook", express.raw({ type: "application/json" }), razorpayWebhook);

export default router;
