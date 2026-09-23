import Wishlist from "../model/Wishlist.model.js";
import Cloth from "../model/Cloth.model.js";

export const addToWishlist = async (req, res) => {
  try {
    const { clothId } = req.body;

    if (!clothId) return res.status(400).json({ message: "clothId is required" });

    const exists = await Cloth.findById(clothId);
    if (!exists) return res.status(404).json({ message: "Cloth not found" });

    try {
      const wish = await Wishlist.create({ userId: req.user._id, clothId });
      return res.status(201).json({ message: "Added to wishlist", wish });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ message: "Already in wishlist" });
      }
      throw err;
    }
  } catch (err) {
    console.error("Add wishlist error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { clothId } = req.params;

    const existing = await Wishlist.findOne({ userId: req.user._id, clothId });
    if (!existing) return res.status(404).json({ message: "Wishlist entry not found" });

    await existing.remove();

    return res.status(200).json({ message: "Removed from wishlist" });
  } catch (err) {
    console.error("Remove wishlist error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const list = await Wishlist.find({ userId: req.user._id }).populate({ path: "clothId", populate: { path: "lenderId", select: "name email" } });

    return res.status(200).json({ message: "Wishlist fetched", count: list.length, list });
  } catch (err) {
    console.error("Get wishlist error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
