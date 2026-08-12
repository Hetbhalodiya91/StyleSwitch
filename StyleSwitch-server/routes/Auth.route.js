import express from "express";

import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controller/Auth.controller.js";

import { protect } from "../middleware/Auth.middleware.js";

const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/me", protect, getMe);
authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/reset-password/:resetToken", resetPassword);

export default authRoutes;