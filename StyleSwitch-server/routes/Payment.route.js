import express from "express";
import { createPayment, confirmPayment, razorpayWebhook } from "../controller/Payment.controller.js";
import { protect } from "../middleware/Auth.middleware.js";

const router = express.Router();

router.post("/", protect, createPayment);
router.post("/:id/confirm", protect, confirmPayment);

// Razorpay webhook needs raw body for signature verification
router.post("/webhook", express.raw({ type: "application/json" }), razorpayWebhook);

export default router;
