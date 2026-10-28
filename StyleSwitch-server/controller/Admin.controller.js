import User from "../model/User.model.js";
import Cloth from "../model/Cloth.model.js";
import Booking from "../model/Booking.model.js";
import Report from "../model/Report.model.js";

/**
 * High-level platform statistics & recent activities
 */
export const getAdminOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      totalLenders,
      totalRenters,
      totalClothes,
      availableClothes,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalReports,
      pendingReports,
      revenueResult,
      recentBookings,
      recentReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "lender" }),
      User.countDocuments({ role: { $in: ["tenant", "renter"] } }),
      Cloth.countDocuments(),
      Cloth.countDocuments({ isAvailable: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "PENDING" }),
      Booking.countDocuments({ status: "CONFIRMED" }),
      Booking.countDocuments({ status: "COMPLETED" }),
      Report.countDocuments(),
      Report.countDocuments({ status: "PENDING" }),
      Booking.aggregate([
        { $match: { status: { $in: ["CONFIRMED", "COMPLETED"] } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Booking.find()
        .populate("clothId", "brand category images rentalPricePerDay")
        .populate("tenantId", "name email")
        .populate("lenderId", "name email")
        .sort({ createdAt: -1 })
        .limit(5),
      Report.find()
        .populate("reporterId", "name email")
        .populate("reportedUserId", "name email")
        .populate("clothId", "brand category")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const platformCommission = Math.round(totalRevenue * 0.15); // 15% luxury platform fee

    return res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        totalLenders,
        totalRenters,
        totalClothes,
        availableClothes,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        totalReports,
        pendingReports,
        totalRevenue,
        platformCommission,
      },
      recentBookings,
      recentReports,
    });
  } catch (err) {
    console.error("Admin overview error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

/**
 * User Management
 */
export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    console.error("Get admin users error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const toggleUserBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Protect superadmin from accidentally blocking themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot block yourself" });
    }

    user.isBlock = !user.isBlock;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${user.isBlock ? "blocked" : "unblocked"} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBlock: user.isBlock,
      },
    });
  } catch (err) {
    console.error("Toggle block error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Role promotion to 'admin' is prohibited. StyleSwitch enforces a strict single-administrator model.",
      });
    }

    const validRoles = ["lender", "tenant"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid role. Allowed: ${validRoles.join(", ")}` });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "The primary platform administrator's role cannot be modified.",
      });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Role updated to ${role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Update user role error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Garment Moderation
 */
export const getAdminClothes = async (req, res) => {
  try {
    const clothes = await Cloth.find()
      .populate("lenderId", "name email number")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: clothes.length, clothes });
  } catch (err) {
    console.error("Get admin clothes error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const toggleClothAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const cloth = await Cloth.findById(id);

    if (!cloth) return res.status(404).json({ success: false, message: "Clothing not found" });

    cloth.isAvailable = !cloth.isAvailable;
    await cloth.save();

    return res.status(200).json({
      success: true,
      message: `Listing is now ${cloth.isAvailable ? "Active" : "Archived/Hidden"}`,
      cloth,
    });
  } catch (err) {
    console.error("Toggle cloth error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteAdminCloth = async (req, res) => {
  try {
    const { id } = req.params;
    const cloth = await Cloth.findByIdAndDelete(id);

    if (!cloth) return res.status(404).json({ success: false, message: "Clothing not found" });

    return res.status(200).json({ success: true, message: "Garment removed by administration" });
  } catch (err) {
    console.error("Delete admin cloth error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Global Bookings Console
 */
export const getAdminBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("clothId")
      .populate("tenantId", "name email number")
      .populate("lenderId", "name email number")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    console.error("Get admin bookings error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateAdminBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    booking.status = status;
    await booking.save();

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking,
    });
  } catch (err) {
    console.error("Update admin booking status error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Reports & Disputes Console
 */
export const getAdminReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporterId", "name email")
      .populate("reportedUserId", "name email")
      .populate("clothId", "brand category images")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: reports.length, reports });
  } catch (err) {
    console.error("Get admin reports error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateAdminReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    if (status) report.status = status;
    if (adminNote !== undefined) report.adminNote = adminNote;

    await report.save();

    return res.status(200).json({
      success: true,
      message: "Report updated",
      report,
    });
  } catch (err) {
    console.error("Update admin report error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
