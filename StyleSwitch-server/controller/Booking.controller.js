import Booking from "../model/Booking.model.js";
import Cloth from "../model/Cloth.model.js";

export const createBooking = async (req, res) => {
  try {
    const { clothId, startDate, endDate } = req.body;

    if (!clothId || !startDate || !endDate) {
      return res.status(400).json({ message: "clothId, startDate and endDate are required" });
    }

    const cloth = await Cloth.findById(clothId);
    if (!cloth) return res.status(404).json({ message: "Cloth not found" });

    if (!cloth.isAvailable) return res.status(400).json({ message: "Cloth is not available for booking" });

    const sd = new Date(startDate);
    const ed = new Date(endDate);
    if (ed <= sd) return res.status(400).json({ message: "endDate must be after startDate" });

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

    return res.status(201).json({ message: "Booking created", booking });
  } catch (err) {
    console.error("Create booking error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ tenantId: req.user._id }).populate("clothId lenderId").sort({ createdAt: -1 });
    return res.status(200).json({ message: "Bookings fetched", count: bookings.length, bookings });
  } catch (err) {
    console.error("Get my bookings error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getLenderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ lenderId: req.user._id }).populate("clothId tenantId").sort({ createdAt: -1 });
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
    if (booking.tenantId._id.toString() !== req.user._id.toString() && booking.lenderId._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }
    return res.status(200).json({ message: "Booking fetched", booking });
  } catch (err) {
    console.error("Get booking error:", err);
    return res.status(500).json({ message: "Server error" });
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
