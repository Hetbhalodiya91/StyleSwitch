import ClothCard from "./ClothCard";
import "./ClothGrid.css";

const clothes = [
  {
    image: "/images/suit.jpg",
    name: "RAA Classics",
    brand: "RAA",
    category: "Sherwani",
    size: "L",
    price: 2999,
    rating: 4.8,
  },
  {
    image: "/images/tuxedo.jpg",
    name: "Royal Tuxedo",
    brand: "Royal Wear",
    category: "Tuxedo",
    size: "M",
    price: 3499,
    rating: 4.7,
  },
  {
    image: "/images/sherwani.jpg",
    name: "Elegant Sherwani",
    brand: "Ethnic House",
    category: "Sherwani",
    size: "XL",
    price: 3999,
    rating: 4.9,
  },
  {
    image: "/images/black-suit.jpg",
    name: "Classic Black",
    brand: "Urban Style",
    category: "Suit",
    size: "M",
    price: 2799,
    rating: 4.6,
  },
];

function ClothGrid() {
  return (
    <section className="clothes-section">

      <div className="section-header">
        <div>
          <p className="section-label">
            OUR COLLECTION
          </p>

          <h2>
            Find Your Style
          </h2>
        </div>

        <button className="view-all">
          VIEW ALL →
        </button>
      </div>


      <div className="cloth-grid">

        {clothes.map((cloth, index) => (
          <ClothCard
            key={index}
            {...cloth}
          />
        ))}

      </div>

    </section>
  );
}

export default ClothGrid;