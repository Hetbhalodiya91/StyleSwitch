import express from "express";
import { getNotifications, markNotificationRead, deleteNotification } from "../controller/Notification.controller.js";
import { protect } from "../middleware/Auth.middleware.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.post("/:id/read", protect, markNotificationRead);
router.delete("/:id", protect, deleteNotification);

export default router;
