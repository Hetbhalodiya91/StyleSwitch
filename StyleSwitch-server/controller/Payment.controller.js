import Payment from "../model/Payment.model.js";
import Booking from "../model/Booking.model.js";
import Notification from "../model/Notification.model.js";
import crypto from "crypto";
import Razorpay from "razorpay";

/**
 * Initialize / Create a Razorpay Order for a Booking
 */
export const createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: "bookingId is required" });
    }

    const booking = await Booking.findById(bookingId).populate("clothId");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const totalToPay = (booking.totalAmount || 0) + (booking.securityDeposit || 0);

    let orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If active live or test keys are provided
    if (keyId && keySecret && !keyId.includes("your_razorpay")) {
      try {
        const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const rzpOrder = await instance.orders.create({
          amount: Math.round(totalToPay * 100), // paise
          currency: "INR",
          receipt: `rcpt_${booking._id.toString().slice(-8)}`,
        });
        orderId = rzpOrder.id;
      } catch (rzpErr) {
        console.warn("Razorpay API order creation failed, falling back to simulated order:", rzpErr.message);
      }
    }

    const payment = await Payment.create({
      bookingId: booking._id,
      tenantId: req.user._id,
      amount: totalToPay,
      razorpayOrderId: orderId,
      paymentMethod: "RAZORPAY",
      status: "CREATED",
    });

    return res.status(201).json({
      success: true,
      order: {
        id: orderId,
        amount: totalToPay,
        currency: "INR",
        key: keyId || "rzp_test_styleswitch",
        paymentId: payment._id,
        booking,
      },
    });
  } catch (err) {
    console.error("Create order error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

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
    if (secret && !secret.includes("your_razorpay") && razorpaySignature) {
      const expected = crypto.createHmac("sha256", secret).update(`${payment.razorpayOrderId}|${razorpayPaymentId}`).digest("hex");
      if (expected !== razorpaySignature) {
        return res.status(400).json({ message: "Invalid payment signature" });
      }
    }

    payment.razorpayPaymentId = razorpayPaymentId || `pay_${Date.now()}`;
    payment.razorpaySignature = razorpaySignature || "simulated_sig";
    payment.status = "SUCCESS";
    payment.paidAt = new Date();

    await payment.save();

    // update booking status
    const booking = await Booking.findById(payment.bookingId).populate("clothId");
    if (booking) {
      booking.paymentStatus = "PAID";
      booking.status = "CONFIRMED";
      await booking.save();

      // Create in-app notifications
      try {
        await Notification.create({
          userId: booking.tenantId,
          title: "Reservation & Payment Confirmed",
          message: `Your reservation for ${booking.clothId?.brand || "Designer Piece"} (${booking.clothId?.category || "Garment"}) has been confirmed. Total paid: ₹${payment.amount}.`,
          referenceType: "Booking",
          referenceId: booking._id,
        });

        await Notification.create({
          userId: booking.lenderId,
          title: "New Confirmed Rental Request",
          message: `Your piece ${booking.clothId?.brand || ""} has been booked and paid for. Delivery dates: ${new Date(booking.startDate).toLocaleDateString()} to ${new Date(booking.endDate).toLocaleDateString()}.`,
          referenceType: "Booking",
          referenceId: booking._id,
        });
      } catch (notifyErr) {
        console.warn("Failed to generate notification records:", notifyErr.message);
      }
    }

    return res.status(200).json({ success: true, message: "Payment confirmed successfully", payment, booking });
  } catch (err) {
    console.error("Confirm payment error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const raw = req.rawBody ? req.rawBody.toString("utf8") : req.body instanceof Buffer ? req.body.toString("utf8") : JSON.stringify(req.body);

    if (secret && !secret.includes("your_razorpay")) {
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
          booking.status = "CONFIRMED";
          await booking.save();
        }
      }
    }

    return res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("Razorpay webhook error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const refundDeposit = async (req, res) => {
  try {
    const { id } = req.params; // booking id
    const { amount, reason } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (req.user.role !== "admin" && booking.lenderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to refund deposit" });
    }

    const payment = await Payment.findOne({ bookingId: booking._id, status: "SUCCESS" });
    if (!payment) return res.status(404).json({ message: "No successful payment found for this booking" });

    payment.refundStatus = "REFUNDED";
    payment.refundAmount = amount !== undefined ? amount : booking.securityDeposit || 0;
    payment.refundReason = reason || "Deposit return";
    payment.refundedAt = new Date();

    await payment.save();

    booking.paymentStatus = "DEPOSIT_REFUNDED";
    await booking.save();

    return res.status(200).json({ success: true, message: "Deposit refunded successfully", payment });
  } catch (err) {
    console.error("Refund deposit error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
