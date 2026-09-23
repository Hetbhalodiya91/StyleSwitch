import React from "react";
import "./ClothCard.css";

interface ClothCardProps {
  image: string;
  name: string;
  brand: string;
  category: string;
  size: string;
  price: number;
  rating: number;
}

const ClothCard: React.FC<ClothCardProps> = ({
  image,
  name,
  brand,
  category,
  size,
  price,
  rating,
}) => {
  return (
    <div className="cloth-card">

      {/* Image Section */}
      <div className="cloth-image-wrapper">
        <img
          src={image}
          alt={name}
          className="cloth-image"
        />

        <span className="available-badge">
          Available
        </span>

        <button className="wishlist-btn">
          ♡
        </button>
      </div>

      {/* Details Section */}
      <div className="cloth-details">

        <div className="brand-category">
          <span>{brand}</span>
          <span>{category}</span>
        </div>

        <h3>{name}</h3>

        <div className="rating">
          ★★★★★
          <span> {rating}</span>
        </div>

        <div className="size-row">
          <span>Size</span>

          <div className="sizes">
            <span>{size}</span>
          </div>
        </div>

        <div className="price-row">
          <div>
            <span className="price">
              ₹{price.toLocaleString("en-IN")}
            </span>

            <span className="per-day">
              / day
            </span>
          </div>
        </div>

        <button className="rent-button">
          RENT NOW
          <span>→</span>
        </button>

      </div>
    </div>
  );
};

export default ClothCard;