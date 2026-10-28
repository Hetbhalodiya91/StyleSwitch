import Booking from "../model/Booking.model.js";
import Cloth from "../model/Cloth.model.js";

// In-memory mutex map to serialize concurrent booking attempts for the same garment
const clothBookingLocks = new Map();

/**
 * Executes an async action exclusively for a given clothId.
 * Concurrent requests for the same clothId queue in memory and execute sequentially.
 * Requests for different clothes execute in parallel.
 */
export const withClothLock = async (clothId, fn) => {
  const key = clothId.toString();
  while (clothBookingLocks.has(key)) {
    await clothBookingLocks.get(key);
  }

  let unlock;
  const lockPromise = new Promise((resolve) => {
    unlock = resolve;
  });
  clothBookingLocks.set(key, lockPromise);

  try {
    return await fn();
  } finally {
    clothBookingLocks.delete(key);
    unlock();
  }
};

export const createBooking = async (req, res) => {
  try {
    const { clothId, startDate, endDate } = req.body;

    if (!clothId || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: "clothId, startDate and endDate are required" });
    }

    const sd = new Date(startDate);
    const ed = new Date(endDate);
    if (isNaN(sd.getTime()) || isNaN(ed.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date format" });
    }

    if (ed <= sd) {
      return res.status(400).json({ success: false, message: "endDate must be strictly after startDate" });
    }

    // Critical section locked per clothId to eliminate double-booking race conditions under high concurrency
    return await withClothLock(clothId, async () => {
      const cloth = await Cloth.findById(clothId);
      if (!cloth) return res.status(404).json({ success: false, message: "Cloth not found" });

      if (!cloth.isAvailable) {
        return res.status(400).json({ success: false, message: "Cloth is not available for booking" });
      }

      // Check if any active reservation overlaps with requested dates
      // Overlap math: existing.startDate < new.endDate && existing.endDate > new.startDate
      const conflictingBooking = await Booking.findOne({
        clothId,
        status: { $in: ["PENDING", "CONFIRMED"] },
        startDate: { $lt: ed },
        endDate: { $gt: sd },
      });

      if (conflictingBooking) {
        return res.status(409).json({
          success: false,
          conflict: true,
          message: "This garment has already been reserved by another member for the requested dates.",
          bookedRange: {
            startDate: conflictingBooking.startDate,
            endDate: conflictingBooking.endDate,
            status: conflictingBooking.status,
          },
        });
      }

      const dayCount = Math.ceil((ed - sd) / (1000 * 60 * 60 * 24));
      const totalAmount = Number(cloth.rentalPricePerDay) * dayCount;

      const booking = await Booking.create({
        clothId,
        tenantId: req.user._id,
        lenderId: cloth.lenderId,
        startDate: sd,
        endDate: ed,
        pricePerDay: cloth.rentalPricePerDay,
        totalAmount,
        securityDeposit: cloth.securityDeposit || 0,
        status: "PENDING",
        paymentStatus: "PENDING",
      });

      return res.status(201).json({
        success: true,
        message: "Booking created successfully",
        booking,
      });
    });
  } catch (err) {
    console.error("Create booking error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ tenantId: req.user._id })
      .populate("clothId lenderId")
      .sort({ createdAt: -1 });

    return res.status(200).json({ message: "Bookings fetched", count: bookings.length, bookings });
  } catch (err) {
    console.error("Get my bookings error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getLenderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ lenderId: req.user._id })
      .populate("clothId tenantId")
      .sort({ createdAt: -1 });

    return res.status(200).json({ message: "Lender bookings fetched", count: bookings.length, bookings });
  } catch (err) {
    console.error("Get lender bookings error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate("clothId tenantId lenderId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // allow tenant, lender or admin
    if (
      booking.tenantId._id.toString() !== req.user._id.toString() &&
      booking.lenderId._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    return res.status(200).json({ message: "Booking fetched", booking });
  } catch (err) {
    console.error("Get booking error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUBLIC — returns all booked date ranges for a cloth so the calendar can disable them
export const getClothAvailability = async (req, res) => {
  try {
    const { clothId } = req.params;
    const bookings = await Booking.find({
      clothId,
      status: { $in: ["PENDING", "CONFIRMED"] },
    }).select("startDate endDate status -_id");

    const bookedRanges = bookings.map((b) => ({
      startDate: b.startDate,
      endDate: b.endDate,
      status: b.status,
    }));

    return res.status(200).json({ success: true, bookedRanges });
  } catch (err) {
    console.error("Get cloth availability error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Only lender or admin can change
    if (booking.lenderId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }

    booking.status = status;
    await booking.save();

    return res.status(200).json({ message: "Booking updated", booking });
  } catch (err) {
    console.error("Update booking status error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
