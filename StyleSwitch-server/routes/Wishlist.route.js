import express from "express";
import { addToWishlist, removeFromWishlist, getWishlist } from "../controller/Wishlist.controller.js";
import { protect } from "../middleware/Auth.middleware.js";

const router = express.Router();

router.post("/", protect, addToWishlist);
router.get("/", protect, getWishlist);
router.delete("/:clothId", protect, removeFromWishlist);

export default router;
