import express from "express";
import {
  getAdminOverview,
  getAdminUsers,
  toggleUserBlock,
  updateUserRole,
  getAdminClothes,
  toggleClothAvailability,
  deleteAdminCloth,
  getAdminBookings,
  updateAdminBookingStatus,
  getAdminReports,
  updateAdminReport,
} from "../controller/Admin.controller.js";
import { protect, authorize } from "../middleware/Auth.middleware.js";

const router = express.Router();

// All admin routes require authentication and "admin" role
router.use(protect);
router.use(authorize("admin"));

// Overview & Analytics
router.get("/overview", getAdminOverview);

// User Management
router.get("/users", getAdminUsers);
router.post("/users/:id/toggle-block", toggleUserBlock);
router.put("/users/:id/role", updateUserRole);

// Garment Moderation
router.get("/clothes", getAdminClothes);
router.post("/clothes/:id/toggle-availability", toggleClothAvailability);
router.delete("/clothes/:id", deleteAdminCloth);

// Global Bookings
router.get("/bookings", getAdminBookings);
router.put("/bookings/:id/status", updateAdminBookingStatus);

// Reports & Disputes
router.get("/reports", getAdminReports);
router.put("/reports/:id", updateAdminReport);

export default router;
