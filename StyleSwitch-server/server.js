import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import authRoutes from "./routes/Auth.route.js";
import userRoutes from "./routes/User.route.js";
import clothRoute from "./routes/Cloth.route.js";
import notificationRoutes from "./routes/Notification.route.js";
import wishlistRoutes from "./routes/Wishlist.route.js";
import reportRoutes from "./routes/Report.route.js";
import bookingRoutes from "./routes/Booking.route.js";
import paymentRoutes from "./routes/Payment.route.js";

const app = express();

// Preserve raw body for webhook verification while still parsing JSON elsewhere
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/cloth",clothRoute);
app.use("/api/notifications", notificationRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);

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