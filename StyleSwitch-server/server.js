import "./config/loadEnv.js";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/Auth.route.js";
import userRoutes from "./routes/User.route.js";
import clothRoute from "./routes/Cloth.route.js";
import notificationRoutes from "./routes/Notification.route.js";
import wishlistRoutes from "./routes/Wishlist.route.js";
import reportRoutes from "./routes/Report.route.js";
import bookingRoutes from "./routes/Booking.route.js";
import paymentRoutes from "./routes/Payment.route.js";
import adminRoutes from "./routes/Admin.route.js";

const app = express();

// 1. CORS MUST be registered before any body parser or route handler
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

// 2. Body parsers with 50MB limit to support high-res garment photography
app.use(express.json({
  limit: "50mb",
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/cloth", clothRoute);
app.use("/api/notifications", notificationRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

// Global error handler (handles 413 Payload Too Large cleanly with CORS preserved)
app.use((err, req, res, next) => {
  if (err.type === "entity.too.large" || err.status === 413) {
    return res.status(413).json({
      success: false,
      message: "Uploaded payload is too large. Max allowed size is 50MB.",
    });
  }
  console.error("Unhandled error:", err);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

export default app;
