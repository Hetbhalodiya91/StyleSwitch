import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clothId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cloth",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate wishlist entries
WishlistSchema.index({ userId: 1, clothId: 1 }, { unique: true });

const Wishlist = mongoose.model("Wishlist", WishlistSchema);

export default Wishlist;
