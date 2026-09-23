import jwt from "jsonwebtoken";
import User from "../model/User.model.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization header missing",
      });
    }

    const [scheme, token] = authHeader.trim().split(/\s+/);

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        message: "Token not found",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    next();
  } catch (err) {
    console.error("Auth error:", err);

    return res.status(401).json({
      message: "Invalid token",
      error: err.message,
    });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. You do not have permission to perform this action." });
    }

    next();
  } catch (err) {
    console.error("Authorize error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};