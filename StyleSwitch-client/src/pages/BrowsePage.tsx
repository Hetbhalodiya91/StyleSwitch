import React, { useMemo, useState } from "react";
import ClothCard from "../components/ClothCard";
import "./BrowsePage.css";

interface Cloth {
  id: number;
  image: string;
  name: string;
  brand: string;
  category: string;
  gender: string;
  size: string;
  price: number;
  rating: number;
}

const clothes: Cloth[] = [
  {
    id: 1,
    image: "/images/suit.jpg",
    name: "RAA Classics",
    brand: "RAA",
    category: "Suit",
    gender: "Men",
    size: "L",
    price: 2999,
    rating: 4.8,
  },
  {
    id: 2,
    image: "/images/tuxedo.jpg",
    name: "Royal Tuxedo",
    brand: "Royal Wear",
    category: "Tuxedo",
    gender: "Men",
    size: "M",
    price: 3499,
    rating: 4.7,
  },
  {
    id: 3,
    image: "/images/sherwani.jpg",
    name: "Elegant Sherwani",
    brand: "Ethnic House",
    category: "Sherwani",
    gender: "Men",
    size: "XL",
    price: 3999,
    rating: 4.9,
  },
  {
    id: 4,
    image: "/images/black-suit.jpg",
    name: "Classic Black",
    brand: "Urban Style",
    category: "Suit",
    gender: "Men",
    size: "M",
    price: 2799,
    rating: 4.6,
  },
  {
    id: 5,
    image: "/images/gown.jpg",
    name: "Royal Evening Gown",
    brand: "Aura",
    category: "Gown",
    gender: "Women",
    size: "L",
    price: 4499,
    rating: 4.9,
  },
  {
    id: 6,
    image: "/images/lehenga.jpg",
    name: "Bridal Lehenga",
    brand: "Ethnic House",
    category: "Lehenga",
    gender: "Women",
    size: "M",
    price: 4999,
    rating: 4.8,
  },
  {
    id: 7,
    image: "/images/dress.jpg",
    name: "Elegant Dress",
    brand: "Aura",
    category: "Dress",
    gender: "Women",
    size: "S",
    price: 2499,
    rating: 4.5,
  },
  {
    id: 8,
    image: "/images/blazer.jpg",
    name: "Premium Blazer",
    brand: "Urban Style",
    category: "Blazer",
    gender: "Men",
    size: "XL",
    price: 3199,
    rating: 4.7,
  },
];

function BrowsePage() {
  /* =========================
     FILTER STATES
  ========================= */

  const [search, setSearch] = useState("");

  const [gender, setGender] = useState("All");

  const [category, setCategory] = useState("All");

  const [size, setSize] = useState("All");

  const [maxPrice, setMaxPrice] = useState(5000);

  const [sort, setSort] = useState("default");


  /* =========================
     FILTER + SORT
  ========================= */

  const filteredClothes = useMemo(() => {
    let result = clothes.filter((cloth) => {

      const matchesSearch =
        cloth.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        cloth.brand
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesGender =
        gender === "All" ||
        cloth.gender === gender;

      const matchesCategory =
        category === "All" ||
        cloth.category === category;

      const matchesSize =
        size === "All" ||
        cloth.size === size;

      const matchesPrice =
        cloth.price <= maxPrice;

      return (
        matchesSearch &&
        matchesGender &&
        matchesCategory &&
        matchesSize &&
        matchesPrice
      );
    });


    /* Sorting */

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sort === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }


    return result;

  }, [
    search,
    gender,
    category,
    size,
    maxPrice,
    sort,
  ]);


  /* =========================
     CLEAR FILTERS
  ========================= */

  const clearFilters = () => {
    setSearch("");
    setGender("All");
    setCategory("All");
    setSize("All");
    setMaxPrice(5000);
    setSort("default");
  };


  return (
    <div className="browse-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="browse-header">

        <div>
          <p className="browse-label">
            STYLE SWITCH
          </p>

          <h1>
            Browse Collection
          </h1>

          <p className="browse-description">
            Discover outfits for every occasion.
          </p>
        </div>


        {/* SEARCH */}

        <div className="search-box">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search clothes..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

      </div>


      {/* =========================
          MAIN CONTENT
      ========================= */}

      <div className="browse-content">


        {/* =========================
            FILTER SIDEBAR
        ========================= */}

        <aside className="filter-sidebar">

          <div className="filter-heading">

            <h3>
              Filters
            </h3>

            <button onClick={clearFilters}>
              Clear All
            </button>

          </div>


          {/* GENDER */}

          <div className="filter-group">

            <h4>
              Gender
            </h4>

            <label>
              <input
                type="radio"
                name="gender"
                checked={gender === "All"}
                onChange={() => setGender("All")}
              />
              All
            </label>

            <label>
              <input
                type="radio"
                name="gender"
                checked={gender === "Men"}
                onChange={() => setGender("Men")}
              />
              Men
            </label>

            <label>
              <input
                type="radio"
                name="gender"
                checked={gender === "Women"}
                onChange={() => setGender("Women")}
              />
              Women
            </label>

          </div>


          {/* CATEGORY */}

          <div className="filter-group">

            <h4>
              Category
            </h4>

            {[
              "All",
              "Suit",
              "Tuxedo",
              "Sherwani",
              "Gown",
              "Lehenga",
              "Dress",
              "Blazer",
            ].map((item) => (

              <label key={item}>

                <input
                  type="radio"
                  name="category"
                  checked={category === item}
                  onChange={() =>
                    setCategory(item)
                  }
                />

                {item}

              </label>

            ))}

          </div>


          {/* SIZE */}

          <div className="filter-group">

            <h4>
              Size
            </h4>

            <div className="size-buttons">

              {["All", "S", "M", "L", "XL"].map(
                (item) => (

                  <button
                    key={item}
                    className={
                      size === item
                        ? "active-size"
                        : ""
                    }
                    onClick={() =>
                      setSize(item)
                    }
                  >
                    {item}
                  </button>

                )
              )}

            </div>

          </div>


          {/* PRICE */}

          <div className="filter-group">

            <h4>
              Maximum Price
            </h4>

            <input
              className="price-range"
              type="range"
              min="1000"
              max="5000"
              step="100"
              value={maxPrice}
              onChange={(e) =>
                setMaxPrice(
                  Number(e.target.value)
                )
              }
            />

            <div className="price-values">

              <span>
                ₹1,000
              </span>

              <span>
                ₹{maxPrice}
              </span>

            </div>

          </div>

        </aside>


        {/* =========================
            PRODUCTS
        ========================= */}

        <main className="products-section">


          {/* PRODUCT TOP BAR */}

          <div className="products-topbar">

            <p>
              <strong>
                {filteredClothes.length}
              </strong>{" "}
              outfits found
            </p>


            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value)
              }
            >

              <option value="default">
                Sort By
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>

              <option value="rating">
                Highest Rated
              </option>

            </select>

          </div>


          {/* CARDS */}

          {filteredClothes.length > 0 ? (

            <div className="browse-grid">

              {filteredClothes.map((cloth) => (

                <ClothCard
                  key={cloth.id}
                  image={cloth.image}
                  name={cloth.name}
                  brand={cloth.brand}
                  category={cloth.category}
                  size={cloth.size}
                  price={cloth.price}
                  rating={cloth.rating}
                />

              ))}

            </div>

          ) : (

            <div className="no-results">

              <div className="no-results-icon">
                ♡
              </div>

              <h2>
                No outfits found
              </h2>

              <p>
                Try changing your filters
                or search something else.
              </p>

              <button onClick={clearFilters}>
                Clear Filters
              </button>

            </div>

          )}

        </main>

      </div>

    </div>
  );
}

export default BrowsePage;