import express from "express";
import { createReport, getMyReports, getAllReports, updateReportStatus } from "../controller/Report.controller.js";
import { protect, authorize } from "../middleware/Auth.middleware.js";

const router = express.Router();

router.post("/", protect, createReport);
router.get("/my", protect, getMyReports);
router.get("/", protect, authorize("admin"), getAllReports);
router.put("/:id", protect, authorize("admin"), updateReportStatus);

export default router;
