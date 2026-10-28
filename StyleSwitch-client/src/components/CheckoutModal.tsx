import { useState, useEffect } from "react";
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

// Extend Window to include Razorpay
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

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

/** Dynamically load the Razorpay checkout script once */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutModal({ booking, onClose, onSuccess }: CheckoutModalProps) {
  const [step, setStep] = useState<"review" | "processing" | "confirmed">("review");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card");
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
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

  // Pre-load Razorpay script on mount
  useEffect(() => {
    loadRazorpayScript().then(setScriptReady);
  }, []);

  const handlePay = async () => {
    try {
      setStep("processing");
      setError(null);

      // 1. Create Razorpay order on our server
      const selectedPaymentMethod = ({
        card: "CARD",
        upi: "UPI",
        netbanking: "NETBANKING",
      } as const)[paymentMethod];

      const orderRes = await paymentService.createOrder(booking._id, selectedPaymentMethod);
      const { id: rzpOrderId, amount, key: rzpKey, paymentId, testMode } = orderRes.order;

      // Use real Razorpay popup only when server confirms real order was created
      const canUseRealCheckout = !testMode && rzpKey && scriptReady && window.Razorpay;
      if (canUseRealCheckout) {
        // ── REAL RAZORPAY CHECKOUT ──────────────────────────────────────────
        await openRazorpayPopup({
          key: rzpKey,
          orderId: rzpOrderId,
          amount,
          paymentId,
          paymentMethod,
        });
      } else {
        // ── FALLBACK: simulated checkout (dev / bad credentials) ────────────
        await new Promise((r) => setTimeout(r, 1200));
        await handlePaymentSuccess({
          razorpayPaymentId: `pay_${Date.now()}_simulated`,
          razorpayOrderId: rzpOrderId,
          razorpaySignature: "simulated_signature",
          paymentId,
          amount,
          orderId: rzpOrderId,
        });
      }
    } catch (err: unknown) {
      console.error("Payment failed:", err);
      setError(err instanceof Error ? err.message : "Payment processing failed. Please try again.");
      setStep("review");
    }
  };

  /** Open Razorpay popup and await user action */
  const openRazorpayPopup = ({
    key,
    orderId,
    amount,
    paymentId,
    paymentMethod: method,
  }: {
    key: string;
    orderId: string;
    amount: number;
    paymentId: string;
    paymentMethod: "card" | "upi" | "netbanking";
  }): Promise<void> => {
    return new Promise((resolve, reject) => {
      const rzpMethodMap: Record<string, string> = {
        card: "card",
        upi: "upi",
        netbanking: "netbanking",
      };

      const options = {
        key,
        amount: Math.round(amount * 100), // paise
        currency: "INR",
        name: "StyleSwitch",
        description: `${booking.clothId.brand} — ${booking.clothId.category}`,
        image: booking.clothId.images?.[0] || "",
        order_id: orderId,
        method: rzpMethodMap[method],
        prefill: {
          // Filled from localStorage if available
          name: (() => { try { return JSON.parse(localStorage.getItem("user") || "{}").name || ""; } catch { return ""; } })(),
          email: (() => { try { return JSON.parse(localStorage.getItem("user") || "{}").email || ""; } catch { return ""; } })(),
        },
        theme: { color: "#e11d48" },
        modal: {
          ondismiss: () => {
            setStep("review");
            reject(new Error("Payment cancelled by user"));
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await handlePaymentSuccess({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              paymentId,
              amount,
              orderId,
            });
            resolve();
          } catch (e) {
            reject(e);
          }
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (failureResponse: { error: { description: string } }) => {
        setStep("review");
        setError(`Payment failed: ${failureResponse.error?.description || "Unknown error"}`);
        reject(new Error(failureResponse.error?.description));
      });

      rzp.open();
    });
  };

  /** Confirm the payment on our backend and show receipt */
  const handlePaymentSuccess = async ({
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
    paymentId,
    orderId,
  }: {
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
    paymentId: string;
    /** Kept for callers; actual amount comes from confirmRes */
    amount?: number;
    orderId: string;
  }) => {
    const confirmRes = await paymentService.confirmPayment(paymentId, {
      razorpayPaymentId,
      razorpaySignature,
    });

    setReceiptData({
      paymentId: confirmRes.payment.razorpayPaymentId,
      orderId: razorpayOrderId || orderId,
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
                  <button
                    className={`method-chip ${paymentMethod === "netbanking" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("netbanking")}
                  >
                    <Lock size={15} /> Net Banking
                  </button>
                </div>
              </div>
            </div>

            <footer className="checkout-footer">
              <div className="checkout-guarantee">
                <Lock size={13} color="#22c55e" />
                <span>256-Bit Encrypted &middot; Razorpay Secured &middot; Test Mode Active</span>
              </div>
              <button
                className="checkout-pay-btn"
                onClick={handlePay}
                disabled={step === "processing"}
              >
                {step === "processing" ? (
                  "Opening Razorpay Checkout..."
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
                  <label>Order ID</label>
                  <span className="mono-text">{receiptData?.orderId}</span>
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
