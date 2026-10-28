import express from "express";
import { createOrder, createPayment, confirmPayment, razorpayWebhook, refundDeposit } from "../controller/Payment.controller.js";
import { protect } from "../middleware/Auth.middleware.js";

const router = express.Router();

// Webhook MUST come before /:id routes — otherwise Express matches "webhook" as an id param
router.post("/webhook", express.raw({ type: "application/json" }), razorpayWebhook);

router.post("/create-order", protect, createOrder);
router.post("/", protect, createPayment);
router.post("/:id/confirm", protect, confirmPayment);
router.post("/:id/refund-deposit", protect, refundDeposit);

export default router;
