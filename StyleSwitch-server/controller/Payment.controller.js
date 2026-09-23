import Payment from "../model/Payment.model.js";
import Booking from "../model/Booking.model.js";
import crypto from "crypto";
import Razorpay from "razorpay";

export const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod, razorpayOrderId } = req.body;

    if (!bookingId || amount === undefined || !razorpayOrderId)
      return res.status(400).json({ message: "bookingId, amount and razorpayOrderId are required" });

    const payment = await Payment.create({ bookingId, tenantId: req.user._id, amount, razorpayOrderId, paymentMethod, status: "CREATED" });

    return res.status(201).json({ message: "Payment record created", payment });
  } catch (err) {
    console.error("Create payment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params; // payment id
    const { razorpayPaymentId, razorpaySignature } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (!payment.razorpayOrderId) return res.status(400).json({ message: "Order id not found on payment record" });

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.warn("Razorpay key secret not set; skipping signature verification");
    } else {
      const expected = crypto.createHmac("sha256", secret).update(`${payment.razorpayOrderId}|${razorpayPaymentId}`).digest("hex");

      if (expected !== razorpaySignature) {
        return res.status(400).json({ message: "Invalid signature" });
      }
    }

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = "SUCCESS";
    payment.paidAt = new Date();

    await payment.save();

    // update booking
    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      booking.paymentStatus = "PAID";
      await booking.save();
    }

    return res.status(200).json({ message: "Payment confirmed", payment });
  } catch (err) {
    console.error("Confirm payment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const raw = req.rawBody ? req.rawBody.toString("utf8") : req.body instanceof Buffer ? req.body.toString("utf8") : JSON.stringify(req.body);

    if (secret) {
      const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
      if (expected !== signature) {
        console.warn("Webhook signature mismatch");
        return res.status(400).json({ message: "Invalid webhook signature" });
      }
    }

    const event = JSON.parse(raw);

    const type = event.event;

    if (type === "payment.captured" || type === "payment.authorized") {
      const payEntity = event.payload.payment.entity;
      const orderId = payEntity.order_id;
      const paymentId = payEntity.id;

      let payment = await Payment.findOne({ razorpayPaymentId: paymentId });
      if (!payment && orderId) payment = await Payment.findOne({ razorpayOrderId: orderId });

      if (payment) {
        payment.razorpayPaymentId = paymentId;
        payment.status = "SUCCESS";
        payment.paidAt = new Date(payEntity.captured_at ? payEntity.captured_at * 1000 : Date.now());
        await payment.save();

        const booking = await Booking.findById(payment.bookingId);
        if (booking) {
          booking.paymentStatus = "PAID";
          await booking.save();
        }
      }
    } else if (type === "payment.failed") {
      const payEntity = event.payload.payment.entity;
      const paymentId = payEntity.id;
      const payment = await Payment.findOne({ razorpayPaymentId: paymentId });
      if (payment) {
        payment.status = "FAILED";
        await payment.save();
      }
    } else if (type && type.startsWith("refund.")) {
      // handle refund.* events
      const refundEntity = event.payload.refund ? event.payload.refund.entity : null;
      if (refundEntity) {
        const paymentId = refundEntity.payment_id;
        const payment = await Payment.findOne({ razorpayPaymentId: paymentId });
        if (payment) {
          payment.status = "REFUNDED";
          payment.refundId = refundEntity.id;
          payment.refundAmount = (refundEntity.amount || 0) / 100;
          payment.refundedAt = new Date();
          await payment.save();

          const booking = await Booking.findById(payment.bookingId);
          if (booking) {
            booking.paymentStatus = "REFUNDED";
            await booking.save();
          }
        }
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Webhook handling error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const refundDeposit = async (req, res) => {
  try {
    const { id } = req.params; // booking id

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Only lender or admin can issue refund
    if (req.user.role !== "admin" && booking.lenderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const payment = await Payment.findOne({ bookingId: booking._id, status: "SUCCESS" });
    if (!payment) return res.status(400).json({ message: "No successful payment found for booking" });
    const deposit = booking.securityDeposit || 0;
    if (!deposit || deposit <= 0) return res.status(400).json({ message: "No deposit to refund" });

    // Idempotency: avoid double refunds
    if (payment.status === "REFUNDED" || payment.refundId) {
      return res.status(409).json({ message: "Deposit already refunded" });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return res.status(500).json({ message: "Razorpay keys not configured" });

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const amountPaise = Math.round(deposit * 100);

    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, { amount: amountPaise });

    payment.status = "REFUNDED";
    payment.refundId = refund.id;
    payment.refundAmount = deposit;
    payment.refundedAt = new Date();
    await payment.save();

    booking.paymentStatus = "REFUNDED";
    await booking.save();

    return res.status(200).json({ message: "Deposit refunded", refund });
  } catch (err) {
    console.error("Refund deposit error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
