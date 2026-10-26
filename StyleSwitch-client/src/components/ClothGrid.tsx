import React from "react";
import ClothCard from "./ClothCard";
import type { ClothItem } from "../api/clothService";
import "./ClothGrid.css";

interface ClothGridProps {
  clothes?: ClothItem[];
  title?: string;
  onViewAll?: () => void;
  onSelect?: (cloth: ClothItem) => void;
}

const ClothGrid: React.FC<ClothGridProps> = ({
  clothes = [],
  title = "Find Your Style",
  onViewAll,
  onSelect,
}) => {
  return (
    <section className="clothes-section">
      <div className="section-header">
        <div>
          <p className="section-label">OUR COLLECTION</p>
          <h2>{title}</h2>
        </div>

        {onViewAll && (
          <button className="view-all" onClick={onViewAll}>
            VIEW ALL →
          </button>
        )}
      </div>

      {clothes.length > 0 ? (
        <div className="cloth-grid">
          {clothes.map((cloth) => (
            <ClothCard
              key={cloth._id}
              image={cloth.images?.[0]}
              name={cloth.description || `${cloth.brand} ${cloth.category}`}
              brand={cloth.brand}
              category={cloth.category}
              size={cloth.size}
              price={cloth.rentalPricePerDay}
              onRent={() => onSelect?.(cloth)}
            />
          ))}
        </div>
      ) : (
        <p style={{ textAlign: "center", color: "#888", padding: "40px 0" }}>
          No clothing items to display.
        </p>
      )}
    </section>
  );
};

export default ClothGrid;
