import { useEffect, useState, useMemo } from "react";
import ClothCard from "../components/ClothCard";
import BookingModal from "../components/BookingModal";
import { clothService, type ClothItem } from "../api/clothService";
import "./BrowsePage.css";

interface BrowsePageProps {
  onNavigate?: (page: string) => void;
  onViewDetail?: (clothId: string) => void;
}

const BrowsePage = ({ onNavigate, onViewDetail }: BrowsePageProps) => {
  const [clothes, setClothes] = useState<ClothItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking modal state
  const [selectedClothForBooking, setSelectedClothForBooking] = useState<ClothItem | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("All");
  const [category, setCategory] = useState("All");
  const [size, setSize] = useState("All");
  const [maxPrice, setMaxPrice] = useState(15000);
  const [sort, setSort] = useState("default");

  useEffect(() => {
    fetchClothes();
  }, []);

  const fetchClothes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await clothService.getAll();
      setClothes(response.clothes || []);
    } catch (err) {
      console.error("Error fetching clothes from backend:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load clothing items from the server."
      );
      setClothes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setGender("All");
    setCategory("All");
    setSize("All");
    setMaxPrice(15000);
    setSort("default");
  };

  const filteredClothes = useMemo(() => {
    return clothes
      .filter((item) => {
        const matchesSearch =
          search === "" ||
          item.brand?.toLowerCase().includes(search.toLowerCase()) ||
          item.category?.toLowerCase().includes(search.toLowerCase()) ||
          (item.description &&
            item.description.toLowerCase().includes(search.toLowerCase())) ||
          (item.color &&
            item.color.toLowerCase().includes(search.toLowerCase()));

        const matchesGender =
          gender === "All" ||
          item.gender?.toLowerCase() === gender.toLowerCase();

        const matchesCategory =
          category === "All" ||
          item.category?.toLowerCase() === category.toLowerCase();

        const matchesSize = size === "All" || item.size === size;

        const matchesPrice = item.rentalPricePerDay <= maxPrice;

        return (
          matchesSearch &&
          matchesGender &&
          matchesCategory &&
          matchesSize &&
          matchesPrice
        );
      })
      .sort((a, b) => {
        if (sort === "price-low") return a.rentalPricePerDay - b.rentalPricePerDay;
        if (sort === "price-high") return b.rentalPricePerDay - a.rentalPricePerDay;
        return 0;
      });
  }, [clothes, search, gender, category, size, maxPrice, sort]);

  return (
    <div className="browse-page">
      {/* HERO SECTION */}
      <div className="browse-hero">
        <div className="browse-hero-content">
          <span className="browse-badge">THE ROTATION COLLECTION</span>
          <h1>Explore The Wardrobe</h1>
          <p>
            Rent high-end luxury, occasion wear, and designer looks directly
            from mindful collectors.
          </p>

          <input
            className="search-input"
            type="text"
            placeholder="Search by designer, outfit style, occasion, or color..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="browse-content">
        {/* FILTER SIDEBAR */}
        <aside className="filter-sidebar">
          <div className="filter-heading">
            <h3>Filters</h3>
            <button onClick={clearFilters}>Clear All</button>
          </div>

          {/* GENDER */}
          <div className="filter-group">
            <h4>Gender</h4>
            {["All", "Men", "Women", "Unisex"].map((g) => (
              <label key={g}>
                <input
                  type="radio"
                  name="gender"
                  checked={gender === g}
                  onChange={() => setGender(g)}
                />
                {g}
              </label>
            ))}
          </div>

          {/* CATEGORY */}
          <div className="filter-group">
            <h4>Category</h4>
            {[
              "All",
              "Suit",
              "Tuxedo",
              "Sherwani",
              "Gown",
              "Bridal Lehenga",
              "Designer Lehenga",
              "Blazer",
              "Indowestern Men",
              "Indowestern Women",
            ].map((item) => (
              <label key={item}>
                <input
                  type="radio"
                  name="category"
                  checked={category === item}
                  onChange={() => setCategory(item)}
                />
                {item}
              </label>
            ))}
          </div>

          {/* SIZE */}
          <div className="filter-group">
            <h4>Size</h4>
            <div className="size-buttons">
              {["All", "XS", "S", "M", "L", "XL", "2XL"].map((item) => (
                <button
                  key={item}
                  className={size === item ? "active-size" : ""}
                  onClick={() => setSize(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* PRICE */}
          <div className="filter-group">
            <h4>Maximum Price</h4>
            <input
              className="price-range"
              type="range"
              min="500"
              max="15000"
              step="250"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
            <div className="price-values">
              <span>₹500</span>
              <span>₹{maxPrice.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </aside>

        {/* PRODUCTS SECTION */}
        <main className="products-section">
          <div className="products-topbar">
            <div>
              <p>
                <strong>{filteredClothes.length}</strong> outfits found
              </p>
            </div>

            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="default">Sort By</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {error && (
            <div
              style={{
                padding: "16px",
                marginBottom: "20px",
                borderRadius: "8px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fee2e2",
                color: "#991b1b",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>{error}</span>
              <button
                onClick={fetchClothes}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#991b1b",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
            </div>
          )}

          {isLoading ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <p style={{ color: "#666", fontSize: "16px" }}>
                Loading clothes from backend...
              </p>
            </div>
          ) : filteredClothes.length > 0 ? (
            <div className="browse-grid">
              {filteredClothes.map((cloth) => (
                <ClothCard
                  key={cloth._id}
                  image={cloth.images?.[0]}
                  name={cloth.description || `${cloth.brand} ${cloth.category}`}
                  brand={cloth.brand}
                  category={cloth.category}
                  size={cloth.size}
                  price={cloth.rentalPricePerDay}
                  rating={4.8}
                  onViewDetail={() => onViewDetail?.(cloth._id)}
                  onRent={() => onViewDetail?.(cloth._id)}
                />
              ))}
            </div>
          ) : clothes.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">✦</div>
              <h2>No clothes listed yet</h2>
              <p>
                The wardrobe database is currently empty. Be the first to list a
                piece from your collection!
              </p>
              {onNavigate && (
                <button
                  onClick={() => onNavigate("add")}
                  style={{ marginTop: "12px" }}
                >
                  List a Piece Now
                </button>
              )}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">♡</div>
              <h2>No matching outfits</h2>
              <p>Try adjusting your search query or filter options.</p>
              <button onClick={clearFilters}>Clear Filters</button>
            </div>
          )}
        </main>
      </div>

      {/* Booking & Date Picker Modal */}
      <BookingModal
        cloth={selectedClothForBooking}
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedClothForBooking(null);
        }}
        onNavigate={onNavigate}
      />
    </div>
  );
};

export default BrowsePage;
