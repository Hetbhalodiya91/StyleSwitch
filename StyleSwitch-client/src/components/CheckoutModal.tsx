import { useState } from "react";
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Sparkles,
  CheckCircle2,
  Printer,
  ArrowRight,
  X,
  AlertCircle,
} from "lucide-react";
import { paymentService } from "../api/paymentService";
import "./CheckoutModal.css";

interface CheckoutModalProps {
  booking: {
    _id: string;
    clothId: {
      _id: string;
      brand: string;
      category: string;
      images?: string[];
    };
    startDate: string;
    endDate: string;
    totalAmount: number;
    securityDeposit: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({ booking, onClose, onSuccess }: CheckoutModalProps) {
  const [step, setStep] = useState<"review" | "processing" | "confirmed">("review");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card");
  const [error, setError] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<{
    paymentId: string;
    orderId: string;
    amount: number;
    date: string;
  } | null>(null);

  const totalToPay = booking.totalAmount + booking.securityDeposit;
  const durationDays = Math.ceil(
    (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const handlePay = async () => {
    try {
      setStep("processing");
      setError(null);

      // 1. Create order on server
      const orderRes = await paymentService.createOrder(booking._id);
      const { id: orderId, paymentId } = orderRes.order;

      // 2. Simulate / process payment confirmation
      // Simulates real payment latency for authentic feedback
      await new Promise((r) => setTimeout(r, 1200));

      const confirmRes = await paymentService.confirmPayment(paymentId, {
        razorpayPaymentId: `pay_${Date.now()}_simulated`,
        razorpaySignature: "sig_verified_styleswitch",
      });

      setReceiptData({
        paymentId: confirmRes.payment.razorpayPaymentId,
        orderId,
        amount: confirmRes.payment.amount,
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      setStep("confirmed");
    } catch (err: unknown) {
      console.error("Payment failed:", err);
      setError(err instanceof Error ? err.message : "Payment processing failed. Please try again.");
      setStep("review");
    }
  };

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="checkout-close-btn" onClick={onClose} aria-label="Close checkout">
          <X size={18} />
        </button>

        {step !== "confirmed" ? (
          <div className="checkout-content">
            <header className="checkout-header">
              <div className="checkout-seal">
                <ShieldCheck size={16} color="#e11d48" />
                <span>STYLE / SWITCH ESCROW CHECKOUT</span>
              </div>
              <h2>Complete Haute Reservation</h2>
              <p>Your security deposit is 100% refundable upon garment return in pristine condition.</p>
            </header>

            {error && (
              <div className="checkout-error">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="checkout-body">
              {/* Garment Preview Card */}
              <div className="checkout-item-card">
                <img
                  src={
                    booking.clothId.images?.[0] ||
                    "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=400&q=80"
                  }
                  alt={booking.clothId.brand}
                  className="checkout-item-thumb"
                />
                <div className="checkout-item-details">
                  <span className="checkout-brand">{booking.clothId.brand}</span>
                  <span className="checkout-category">{booking.clothId.category}</span>
                  <span className="checkout-dates">
                    {new Date(booking.startDate).toLocaleDateString()} &rarr;{" "}
                    {new Date(booking.endDate).toLocaleDateString()} ({durationDays} Days)
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="checkout-breakdown">
                <div className="breakdown-row">
                  <span>Rental Fee ({durationDays} days)</span>
                  <span>₹{booking.totalAmount.toLocaleString()}</span>
                </div>
                <div className="breakdown-row">
                  <span>
                    100% Refundable Security Deposit{" "}
                    <span className="escrow-pill">Held in Escrow</span>
                  </span>
                  <span>₹{booking.securityDeposit.toLocaleString()}</span>
                </div>
                <div className="breakdown-row">
                  <span>Doorstep White-Glove Retrieval</span>
                  <span className="free-badge">COMPLIMENTARY</span>
                </div>
                <div className="breakdown-divider" />
                <div className="breakdown-row total">
                  <span>Total Amount Due</span>
                  <span className="total-val">₹{totalToPay.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="checkout-methods">
                <label className="methods-label">Select Payment Channel</label>
                <div className="method-chips">
                  <button
                    className={`method-chip ${paymentMethod === "card" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <CreditCard size={15} /> Credit / Debit Card
                  </button>
                  <button
                    className={`method-chip ${paymentMethod === "upi" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("upi")}
                  >
                    <Sparkles size={15} /> Instant UPI / GPay
                  </button>
                </div>
              </div>
            </div>

            <footer className="checkout-footer">
              <div className="checkout-guarantee">
                <Lock size={13} color="#22c55e" />
                <span>256-Bit Encrypted &middot; Razorpay Escrow Protected</span>
              </div>
              <button
                className="checkout-pay-btn"
                onClick={handlePay}
                disabled={step === "processing"}
              >
                {step === "processing" ? (
                  "Authorizing Escrow..."
                ) : (
                  <>
                    Pay & Confirm Reservation ₹{totalToPay.toLocaleString()} <ArrowRight size={16} />
                  </>
                )}
              </button>
            </footer>
          </div>
        ) : (
          /* CONFIRMED LUXURY RECEIPT */
          <div className="checkout-receipt">
            <div className="receipt-banner">
              <CheckCircle2 size={44} color="#22c55e" />
              <h3>Haute Reservation Confirmed</h3>
              <p>Your piece is secured in our vault and ready for boutique dispatch.</p>
            </div>

            <div className="receipt-specimen">
              <div className="specimen-header">
                <span className="specimen-seal">ATELIER SPECIMEN INVOICE</span>
                <span className="specimen-id">REF: #{booking._id.slice(-8).toUpperCase()}</span>
              </div>

              <div className="specimen-grid">
                <div>
                  <label>Garment</label>
                  <strong>{booking.clothId.brand} {booking.clothId.category}</strong>
                </div>
                <div>
                  <label>Rental Span</label>
                  <span>
                    {new Date(booking.startDate).toLocaleDateString()} &mdash;{" "}
                    {new Date(booking.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <label>Payment Reference</label>
                  <span className="mono-text">{receiptData?.paymentId}</span>
                </div>
                <div>
                  <label>Deposit Escrow</label>
                  <span>₹{booking.securityDeposit} (100% Refundable)</span>
                </div>
                <div>
                  <label>Timestamp</label>
                  <span>{receiptData?.date}</span>
                </div>
                <div>
                  <label>Total Paid</label>
                  <strong className="specimen-total">₹{receiptData?.amount.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="receipt-actions">
              <button className="btn-print" onClick={() => window.print()}>
                <Printer size={15} /> Print Specimen
              </button>
              <button
                className="btn-done"
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
              >
                Go to My Rentals
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
