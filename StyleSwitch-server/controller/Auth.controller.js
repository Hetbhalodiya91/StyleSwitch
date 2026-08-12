
import User from "../model/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
 import sendEmail  from "../util/sendEmail.js"; // Add your actual email utility

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      isApproved: role === "seller" ? false : true,
      verificationToken,
    });

    await user.save();

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Register error:", err);

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User is not registered",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (err) {
    console.error("Get me error:", err);

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    console.log("Forgot password for:", email);

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        message: "No user found with that email address",
      });
    }

    // Generate raw token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Token expires in 15 minutes
    const resetPasswordExpire = new Date(
      Date.now() + 15 * 60 * 1000
    );

    // Store hashed token in DB
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = resetPasswordExpire;

    await user.save();

    // Send raw token to the user
    const clientUrl = "http://localhost:5173";

    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const message = `
      <h2>Password Reset Request</h2>

      <p>
        You requested a password reset.
        Please click the link below to reset your password:
      </p>

      <a href="${resetUrl}">
        Reset Password
      </a>

      <p>This link will expire in 15 minutes.</p>

      <p>If you did not request this, you can ignore this email.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset - StyleSwitch",
        html: message,
        text: `Reset your password using this link: ${resetUrl}`,
      });

      return res.status(200).json({
        message: "Password reset email sent",
        success: true,
      });
    } catch (error) {
      console.error("Error sending reset email:", error);

      // Remove token if email couldn't be sent
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return res.status(500).json({
        message: "Could not send email",
        success: false,
      });
    }
  } catch (err) {
    console.error("Forgot password error:", err);

    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    // ==========================================
    // Validate input
    // ==========================================
    if (!resetToken) {
      return res.status(400).json({
        message: "Reset token is required",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        message: "New password is required",
      });
    }

    // ==========================================
    // Password validation
    // ==========================================
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: {
        $gt: new Date(),
      },
    });

    if (!user) {
      console.log("Reset token invalid or expired");

      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    console.log("Password successfully reset for:", user.email);

    return res.status(200).json({
      message: "Password reset successful",
      success: true,
    });
  } catch (err) {
    console.error("Reset password error:", err);

    return res.status(500).json({
      message: "Server error",
      error: err.message,
      success: false,
    });
  }
};