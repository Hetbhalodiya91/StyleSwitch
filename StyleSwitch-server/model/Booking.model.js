import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    clothId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cloth",
      required: true,
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    pricePerDay: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    securityDeposit: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "CANCELLED",
        "REJECTED",
        "COMPLETED",
      ],
      default: "PENDING",
    },

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
        "DEPOSIT_REFUNDED",
      ],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for instant conflict detection and concurrent calendar queries
bookingSchema.index({ clothId: 1, status: 1, startDate: 1, endDate: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
