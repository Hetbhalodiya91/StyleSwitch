import express from "express";
import {
  createBooking,
  getMyBookings,
  getLenderBookings,
  getBookingById,
  updateBookingStatus,
  getClothAvailability,
} from "../controller/Booking.controller.js";
import { refundDeposit } from "../controller/Payment.controller.js";
import { protect } from "../middleware/Auth.middleware.js";

const router = express.Router();

// PUBLIC — no auth needed to check calendar availability
router.get("/availability/:clothId", getClothAvailability);

router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/lender", protect, getLenderBookings);
router.get("/:id", protect, getBookingById);
router.put("/:id", protect, updateBookingStatus);
router.post("/:id/refund-deposit", protect, refundDeposit);

export default router;
