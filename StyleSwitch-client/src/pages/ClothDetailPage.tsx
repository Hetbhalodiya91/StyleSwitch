import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  Ruler,
  ShieldCheck,
  PackageCheck,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { clothService, type ClothItem } from "../api/clothService";
import { bookingService, type BookedRange } from "../api/bookingService";
import { useAuth } from "../context/AuthContext";
import ClothCalendar from "../components/ClothCalendar";
import "./ClothDetailPage.css";

interface ClothDetailPageProps {
  clothId: string;
  onNavigate: (page: string) => void;
}

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80";

const ClothDetailPage: React.FC<ClothDetailPageProps> = ({
  clothId,
  onNavigate,
}) => {
  const { isAuthenticated } = useAuth();

  const [cloth, setCloth] = useState<ClothItem | null>(null);
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [showSizeModal, setShowSizeModal] = useState(false);

  // Calendar dates
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    loadClothData();
  }, [clothId]);

  const loadClothData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [clothRes, availRes] = await Promise.allSettled([
        clothService.getById(clothId),
        bookingService.getAvailability(clothId),
      ]);

      if (clothRes.status === "fulfilled") {
        setCloth(clothRes.value.cloth);
        if (clothRes.value.cloth?.size) {
          setSelectedSize(clothRes.value.cloth.size);
        }
      } else {
        throw new Error("Failed to load outfit details");
      }

      if (availRes.status === "fulfilled") {
        setBookedRanges(availRes.value.bookedRanges || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load details");
    } finally {
      setIsLoading(false);
    }
  };

  // Price calculations
  const priceBreakdown = useMemo(() => {
    if (!cloth || !startDate || !endDate) return null;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffTime = e.getTime() - s.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (days <= 0) return null;

    const rental = days * cloth.rentalPricePerDay;
    const deposit = cloth.securityDeposit || 0;
    return { days, rental, deposit, total: rental + deposit };
  }, [cloth, startDate, endDate]);

  const handleBook = async () => {
    if (!isAuthenticated) {
      onNavigate("login");
      return;
    }
    if (!startDate || !endDate || !priceBreakdown) {
      setBookingError("Please select your rental start and return dates on the calendar.");
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);
    try {
      await bookingService.create({ clothId, startDate, endDate });
      setBookingSuccess(true);
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const images = cloth?.images?.length ? cloth.images : [FALLBACK_IMG];

  // Specific measurements based on category
  const measurements = useMemo(() => {
    const cat = (cloth?.category || "").toLowerCase();
    if (cat.includes("lehenga")) {
      return [
        { label: "Blouse Bust", value: "36 – 38 in" },
        { label: "Blouse Waist", value: "30 – 32 in" },
        { label: "Lehenga Waist", value: "32 – 36 in (Adjustable Dori)" },
        { label: "Blouse Length", value: "15 in" },
        { label: "Sleeve Length", value: "18 in" },
        { label: "Lehenga Length", value: "43 in" },
      ];
    }
    if (cat.includes("sherwani") || cat.includes("kurta")) {
      return [
        { label: "Chest", value: "40 – 42 in" },
        { label: "Shoulder Width", value: "18.5 in" },
        { label: "Sherwani Length", value: "42 in" },
        { label: "Sleeve Length", value: "25 in" },
        { label: "Churidar Waist", value: "32 – 36 in (Drawstring)" },
        { label: "Churidar Length", value: "44 in" },
      ];
    }
    if (cat.includes("tuxedo") || cat.includes("suit") || cat.includes("blazer")) {
      return [
        { label: "Chest / Jacket", value: "40 – 42 in" },
        { label: "Shoulder", value: "18 in" },
        { label: "Jacket Length", value: "30 in" },
        { label: "Sleeve Length", value: "25.5 in" },
        { label: "Trouser Waist", value: "32 – 34 in" },
        { label: "Trouser Inseam", value: "32 in" },
      ];
    }
    return [
      { label: "Bust / Chest", value: "36 – 38 in" },
      { label: "Waist", value: "30 – 32 in" },
      { label: "Hip", value: "38 – 40 in" },
      { label: "Length", value: "56 in" },
      { label: "Shoulder", value: "15 in" },
      { label: "Flare / Sweep", value: "Full Flare" },
    ];
  }, [cloth?.category]);

  if (isLoading) {
    return (
      <div className="product-detail-wrapper">
        <div className="detail-loading-box">
          <div className="detail-spinner" />
          <p>Loading outfit details...</p>
        </div>
      </div>
    );
  }

  if (error || !cloth) {
    return (
      <div className="product-detail-wrapper">
        <div className="detail-error-box">
          <AlertCircle size={44} color="#e11d48" />
          <h2>Outfit Not Found</h2>
          <p>{error || "This piece may have been unlisted."}</p>
          <button onClick={() => onNavigate("browse")}>&larr; Back to Browse</button>
        </div>
      </div>
    );
  }

  // Reservation Success Screen
  if (bookingSuccess) {
    return (
      <div className="product-detail-wrapper">
        <div className="detail-success-card">
          <div className="success-icon-badge">
            <CheckCircle2 size={48} />
          </div>
          <h2>Reservation Placed!</h2>
          <p className="success-msg">
            Your rental booking for <strong>{cloth.brand} {cloth.category}</strong> has been created with status{" "}
            <span className="status-highlight">PENDING APPROVAL</span>.
          </p>

          <div className="success-details-table">
            <div className="s-row">
              <span>Rental Window:</span>
              <strong>{startDate} &rarr; {endDate} ({priceBreakdown?.days} days)</strong>
            </div>
            <div className="s-row">
              <span>Rental Amount:</span>
              <strong>&#8377;{priceBreakdown?.rental.toLocaleString("en-IN")}</strong>
            </div>
            <div className="s-row">
              <span>Security Deposit:</span>
              <strong>&#8377;{priceBreakdown?.deposit.toLocaleString("en-IN")} (Refundable)</strong>
            </div>
            <div className="s-row total">
              <span>Total Payable:</span>
              <strong className="text-red">&#8377;{priceBreakdown?.total.toLocaleString("en-IN")}</strong>
            </div>
            <div className="s-row">
              <span>Pickup / Dispatch Address:</span>
              <strong>{cloth.pickupAddress}, {cloth.city}</strong>
            </div>
          </div>

          <div className="success-actions">
            <button className="btn-go-dashboard" onClick={() => onNavigate("dashboard")}>
              View in My Dashboard
            </button>
            <button className="btn-browse-more" onClick={() => onNavigate("browse")}>
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-wrapper">
      {/* Top Breadcrumb */}
      <div className="detail-top-nav">
        <button onClick={() => onNavigate("browse")} className="back-link-btn">
          <ArrowLeft size={16} /> Back to Catalog
        </button>
      </div>

      <div className="product-detail-card">
        {/* =========================================================
            LEFT COLUMN: FULL-HEIGHT PRODUCT IMAGE
        ========================================================= */}
        <div className="product-image-column">
          <div className="main-image-container">
            <img
              src={images[activeImg] || FALLBACK_IMG}
              alt={`${cloth.brand} ${cloth.category}`}
              className="main-product-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_IMG;
              }}
            />

            {images.length > 1 && (
              <>
                <button
                  className="img-nav-btn prev"
                  onClick={() => setActiveImg((i) => Math.max(0, i - 1))}
                  disabled={activeImg === 0}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className="img-nav-btn next"
                  onClick={() => setActiveImg((i) => Math.min(images.length - 1, i + 1))}
                  disabled={activeImg === images.length - 1}
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            <div className="image-edition-tag">
              AUTHENTIC &middot; {cloth.gender}
            </div>
          </div>

          {/* Multiple thumbnails if present */}
          {images.length > 1 && (
            <div className="image-thumbnails-strip">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`thumb-box ${activeImg === idx ? "active" : ""}`}
                  onClick={() => setActiveImg(idx)}
                >
                  <img src={img} alt={`view ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* =========================================================
            RIGHT COLUMN: SPECIFICATIONS, TABLE, CALENDAR & BOOKING
        ========================================================= */}
        <div className="product-info-column">
          {/* Top Title & Price Block (Matching Attachment) */}
          <div className="product-header-block">
            <div className="header-titles">
              <h1 className="brand-heading">{cloth.brand}</h1>
              <p className="product-subtitle">
                {cloth.description || `${cloth.color} ${cloth.category}`}
              </p>
            </div>
            <div className="header-price-box">
              <div className="rent-price-display">
                &#8377;{cloth.rentalPricePerDay?.toLocaleString("en-IN")}.00{" "}
                <span className="rent-tag">Rent</span>
              </div>
              <span className="tax-inclusive-label">Inclusive of all taxes</span>
            </div>
          </div>

          {/* 3 Dark Feature Badges (Matching Attachment) */}
          <div className="feature-badges-row">
            <div className="feature-badge-item">
              <Ruler size={16} />
              <span>Custom Fitting</span>
            </div>
            <div className="feature-badge-item">
              <ShieldCheck size={16} />
              <span>Refundable Deposit</span>
            </div>
            <div className="feature-badge-item">
              <PackageCheck size={16} />
              <span>Free pick up/Delivery</span>
            </div>
          </div>

          {/* Meta Specifications Grid */}
          <div className="meta-spec-grid">
            <div className="meta-spec-col">
              <span className="meta-spec-label">PRODUCT CODE</span>
              <span className="meta-spec-val">
                SS-{cloth._id ? cloth._id.slice(-6).toUpperCase() : "2208"}
              </span>
            </div>
            <div className="meta-spec-col">
              <span className="meta-spec-label">COLOR</span>
              <span className="meta-spec-val">{cloth.color || "Golden"}</span>
            </div>
            <div className="meta-spec-col">
              <span className="meta-spec-label">CITY</span>
              <span className="meta-spec-val">{cloth.city || "Mumbai"}</span>
            </div>
          </div>

          {/* Size Selector Row (Matching Attachment) */}
          <div className="size-selector-row">
            <div className="size-range-group">
              <span className="size-range-label">Size Range</span>
              <div className="size-circles-wrap">
                {["XS", "S", "M", "L", "XL"].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    className={`size-circle-btn ${
                      selectedSize === sz || (!cloth.size && sz === "M") || cloth.size === sz
                        ? "active"
                        : ""
                    }`}
                    onClick={() => setSelectedSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="size-chart-link-btn"
              onClick={() => setShowSizeModal(!showSizeModal)}
            >
              <Ruler size={14} /> Size Chart
            </button>
          </div>

          {/* Measurements Table (Matching Attachment) */}
          <div className="measurements-table-card">
            <div className="table-header-row">
              <span className="th-cell">Measurement</span>
              <span className="th-cell text-right">Value</span>
            </div>
            <div className="table-body">
              {measurements.map((m, idx) => (
                <div key={idx} className="table-row">
                  <span className="td-label">{m.label}</span>
                  <span className="td-val text-right">{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* =========================================================
              "IN BETWEEN WE SHOW OUR CALENDAR"
          ========================================================= */}
          <div className="embedded-calendar-section">
            <div className="cal-section-header">
              <h3 className="cal-section-title">
                SELECT RENTAL PERIOD
              </h3>
              <span className="cal-section-badge">
                Real-Time Availability
              </span>
            </div>
            <p className="cal-section-desc">
              Select your <strong>Rental Start Date</strong> and <strong>Return Date</strong> below. 
              Strikethrough dates are already booked by other guests.
            </p>

            {/* Custom Interactive Availability Calendar Component */}
            <ClothCalendar
              bookedRanges={bookedRanges}
              selectedStart={startDate}
              selectedEnd={endDate}
              onChange={(s, e) => {
                setStartDate(s);
                setEndDate(e);
                setBookingError(null);
              }}
            />

            {/* Dynamic Price Breakdown Box */}
            {priceBreakdown && (
              <div className="rental-price-summary-box">
                <div className="summary-row">
                  <span>
                    Rental ({priceBreakdown.days} {priceBreakdown.days === 1 ? "day" : "days"} &times; &#8377;
                    {cloth.rentalPricePerDay?.toLocaleString("en-IN")}/day)
                  </span>
                  <strong>&#8377;{priceBreakdown.rental.toLocaleString("en-IN")}</strong>
                </div>
                <div className="summary-row">
                  <span>
                    Refundable Security Deposit
                    <span className="deposit-green-pill">100% Refundable</span>
                  </span>
                  <strong>&#8377;{priceBreakdown.deposit.toLocaleString("en-IN")}</strong>
                </div>
                <div className="summary-row grand-total">
                  <span>Total Amount Payable:</span>
                  <strong className="grand-total-amount">
                    &#8377;{priceBreakdown.total.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* Rental Terms & Refundable Deposit Disclaimer (Matching Attachment) */}
          <div className="rental-terms-box">
            <p className="term-line">
              * In case of outfit booking: rent is for outfit only, accessories are not included.
            </p>
            <p className="term-line">
              * In case of accessories: rent is for accessories only, outfit are not included.
            </p>

            <div className="deposit-disclaimer-block">
              <strong>Refundable Security Deposit:</strong>
              <p>
                Security deposit of &#8377;{cloth.securityDeposit?.toLocaleString("en-IN") || "3,000"} is 
                held during the rental period. Fully refundable within 30 working days after quality check (QC).
              </p>
            </div>
          </div>

          {/* Error Message */}
          {bookingError && (
            <div className="booking-error-banner">
              <AlertCircle size={16} />
              <span>{bookingError}</span>
            </div>
          )}

          {/* Single Primary RENT NOW Action Button (For direct booking on detail page) */}
          <div className="booking-cta-wrap">
            <button
              type="button"
              className="btn-primary-reserve"
              onClick={handleBook}
              disabled={isSubmitting || !startDate || !endDate || !priceBreakdown}
            >
              {isSubmitting
                ? "Reserving Outfit..."
                : !isAuthenticated
                ? "Log in to Complete Reservation"
                : !startDate || !endDate || !priceBreakdown
                ? "Please Select Dates on Calendar"
                : `CONFIRM & RENT NOW — ₹${priceBreakdown.total.toLocaleString("en-IN")}`}
            </button>
            <p className="cta-assurance">
              Zero cancellation fee before lender dispatch &middot; Safe &amp; verified payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClothDetailPage;
