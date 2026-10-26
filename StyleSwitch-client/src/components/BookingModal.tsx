import React, { useState, useMemo, useEffect } from "react";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";
import type { ClothItem } from "../api/clothService";
import { bookingService, type BookedRange } from "../api/bookingService";
import { useAuth } from "../context/AuthContext";
import ClothCalendar from "./ClothCalendar";
import "./BookingModal.css";

interface BookingModalProps {
  cloth: ClothItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: string) => void;
}

const getTomorrowString = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

const getDefaultEndDateString = () => {
  const d = new Date();
  d.setDate(d.getDate() + 4); // 3-day rental by default
  return d.toISOString().split("T")[0];
};

const BookingModal: React.FC<BookingModalProps> = ({
  cloth,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { isAuthenticated } = useAuth();
  const [startDate, setStartDate] = useState<string | null>(getTomorrowString());
  const [endDate, setEndDate] = useState<string | null>(getDefaultEndDateString());
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && cloth?._id) {
      bookingService
        .getAvailability(cloth._id)
        .then((res) => setBookedRanges(res.bookedRanges || []))
        .catch(() => setBookedRanges([]));
    }
  }, [isOpen, cloth?._id]);

  // Dynamic calculations
  const { days, rentalTotal, securityDeposit, grandTotal, isValidDates } =
    useMemo(() => {
      if (!cloth || !startDate || !endDate) {
        return {
          days: 0,
          rentalTotal: 0,
          securityDeposit: 0,
          grandTotal: 0,
          isValidDates: false,
        };
      }

      const s = new Date(startDate);
      const e = new Date(endDate);
      const diffTime = e.getTime() - s.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const valid = diffDays > 0;
      const calculatedDays = valid ? diffDays : 0;
      const rent = calculatedDays * (cloth.rentalPricePerDay || 0);
      const deposit = cloth.securityDeposit || 0;
      const total = rent + deposit;

      return {
        days: calculatedDays,
        rentalTotal: rent,
        securityDeposit: deposit,
        grandTotal: total,
        isValidDates: valid,
      };
    }, [cloth, startDate, endDate]);

  if (!isOpen || !cloth) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isAuthenticated) {
      setErrorMessage("Please log in to complete your reservation.");
      if (onNavigate) {
        setTimeout(() => {
          onClose();
          onNavigate("login");
        }, 1200);
      }
      return;
    }

    if (!isValidDates || !startDate || !endDate) {
      setErrorMessage("Please select valid rental start and end dates.");
      return;
    }

    setIsSubmitting(true);
    try {
      await bookingService.create({
        clothId: cloth._id,
        startDate,
        endDate,
      });
      setBookingSuccess(true);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Failed to create booking. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setBookingSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="booking-modal-overlay" onClick={handleResetAndClose}>
      <div
        className="booking-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "560px" }}
      >
        <div className="booking-modal-header">
          <h2>Reserve Designer Outfit</h2>
          <button
            className="modal-close-btn"
            onClick={handleResetAndClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="booking-modal-body">
          {bookingSuccess ? (
            <div className="booking-success-wrap">
              <div className="success-icon-badge">
                <CheckCircle2 size={36} />
              </div>
              <h3>Reservation Placed!</h3>
              <p>
                Your rental request for{" "}
                <strong>
                  {cloth.brand} {cloth.category}
                </strong>{" "}
                has been submitted to the lender with status{" "}
                <span style={{ color: "#e11d48", fontWeight: 700 }}>
                  PENDING
                </span>
                .
              </p>
              <div className="price-breakdown-card" style={{ textAlign: "left" }}>
                <div className="breakdown-row">
                  <span>Duration:</span>
                  <strong>
                    {startDate} to {endDate} ({days} {days === 1 ? "day" : "days"})
                  </strong>
                </div>
                <div className="breakdown-row">
                  <span>Pickup Location:</span>
                  <strong>
                    {cloth.pickupAddress}, {cloth.city}
                  </strong>
                </div>
                <div className="breakdown-row total">
                  <span>Total Amount:</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div className="booking-modal-actions">
                <button
                  type="button"
                  className="btn-confirm-booking"
                  onClick={() => {
                    handleResetAndClose();
                    onNavigate?.("dashboard");
                  }}
                >
                  View in My Dashboard
                </button>
                <button
                  type="button"
                  className="btn-cancel-booking"
                  onClick={handleResetAndClose}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Cloth Preview */}
              <div className="cloth-preview-row">
                <img
                  src={
                    cloth.images?.[0] ||
                    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80"
                  }
                  alt={cloth.brand}
                />
                <div className="cloth-preview-info">
                  <h3>
                    {cloth.brand} {cloth.category}
                  </h3>
                  <div className="cloth-preview-meta">
                    <span>Size: {cloth.size}</span>
                    <span>•</span>
                    <span>City: {cloth.city}</span>
                    <span>•</span>
                    <span>{cloth.condition}</span>
                  </div>
                  <div className="cloth-preview-rate">
                    ₹{cloth.rentalPricePerDay?.toLocaleString("en-IN")} / day
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: "#fef2f2",
                    border: "1px solid #fee2e2",
                    color: "#991b1b",
                    fontSize: "13px",
                    marginBottom: "18px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Custom Interactive Availability Calendar */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "8px", color: "#111215", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Select Rental Window (Remaining Available Dates)
                </label>
                <ClothCalendar
                  bookedRanges={bookedRanges}
                  selectedStart={startDate}
                  selectedEnd={endDate}
                  onChange={(s, e) => {
                    setStartDate(s);
                    setEndDate(e);
                    setErrorMessage(null);
                  }}
                />
              </div>

              {/* Dynamic Price Breakdown */}
              <div className="price-breakdown-card">
                <div className="breakdown-row">
                  <span>
                    Rental ({days} {days === 1 ? "day" : "days"} @ ₹
                    {cloth.rentalPricePerDay?.toLocaleString("en-IN")}/day)
                  </span>
                  <strong>₹{rentalTotal.toLocaleString("en-IN")}</strong>
                </div>

                <div className="breakdown-row">
                  <span>
                    Refundable Security Deposit
                    <span className="deposit-badge">100% Refundable</span>
                  </span>
                  <strong>₹{securityDeposit.toLocaleString("en-IN")}</strong>
                </div>

                <div className="breakdown-row total">
                  <span>Total Payable:</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="booking-modal-actions">
                <button
                  type="button"
                  className="btn-cancel-booking"
                  onClick={handleResetAndClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-confirm-booking"
                  disabled={isSubmitting || !isValidDates}
                >
                  {isSubmitting ? "Reserving..." : "Confirm & Reserve Now"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
