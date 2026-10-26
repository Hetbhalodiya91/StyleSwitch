import React from "react";
import "./ClothCard.css";

interface ClothCardProps {
  image?: string;
  name?: string;
  brand: string;
  category: string;
  size: string;
  price: number;
  rating?: number;
  onRent?: () => void;
  onViewDetail?: () => void;
}

const ClothCard: React.FC<ClothCardProps> = ({
  image,
  name,
  brand,
  category,
  size,
  price,
  rating = 4.8,
  onRent,
  onViewDetail,
}) => {
  const fallbackImage =
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80";

  // Clicking Rent Now navigates to the detail page for booking as requested
  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetail) {
      onViewDetail();
    } else if (onRent) {
      onRent();
    }
  };

  return (
    <div className="cloth-card" onClick={onViewDetail || onRent}>
      {/* Image Section */}
      <div className="cloth-image-wrapper">
        <img
          src={image || fallbackImage}
          alt={name || brand}
          className="cloth-image"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />
        <span className="available-badge">Available</span>
        <button
          className="wishlist-btn"
          title="Add to wishlist"
          onClick={(e) => e.stopPropagation()}
        >
          ♡
        </button>
      </div>

      {/* Details Section — Flex Column with Aligned Baselines */}
      <div className="cloth-details">
        {/* Brand & Category */}
        <div className="brand-category">
          <span>{brand}</span>
          <span>{category}</span>
        </div>

        {/* Title Clamped to Exactly 2 Lines for Uniform Grid Alignment */}
        <h3 title={name || `${brand} ${category}`}>
          {name || `${brand} ${category}`}
        </h3>

        {/* Rating */}
        <div className="rating">
          ★★★★★<span> {rating}</span>
        </div>

        {/* Size Badge */}
        <div className="size-row">
          <span>Size</span>
          <div className="sizes">
            <span>{size}</span>
          </div>
        </div>

        {/* Price & Single RENT NOW Button — Pushed to Bottom of Card */}
        <div className="card-bottom-section">
          <div className="price-row">
            <div>
              <span className="price">₹{price?.toLocaleString("en-IN")}</span>
              <span className="per-day">/ day</span>
            </div>
          </div>

          <button className="rent-button" onClick={handleAction}>
            RENT NOW <span>↗</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClothCard;
