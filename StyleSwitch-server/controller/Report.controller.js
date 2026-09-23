import Report from "../model/Report.model.js";

export const createReport = async (req, res) => {
  try {
    const { reportedUserId, clothId, reason, details } = req.body;

    if (!reportedUserId || !reason) return res.status(400).json({ message: "reportedUserId and reason are required" });

    const report = await Report.create({ reporterId: req.user._id, reportedUserId, clothId, reason, details });

    return res.status(201).json({ message: "Report created", report });
  } catch (err) {
    console.error("Create report error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reporterId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ message: "Reports fetched", count: reports.length, reports });
  } catch (err) {
    console.error("Get my reports error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().populate("reporterId reportedUserId clothId").sort({ createdAt: -1 });
    return res.status(200).json({ message: "All reports fetched", count: reports.length, reports });
  } catch (err) {
    console.error("Get all reports error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (status) report.status = status;
    if (adminNote !== undefined) report.adminNote = adminNote;

    await report.save();

    return res.status(200).json({ message: "Report updated", report });
  } catch (err) {
    console.error("Update report error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
