import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clothId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cloth",
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"],
      default: "OPEN",
    },
    adminNote: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model("Report", ReportSchema);

export default Report;
