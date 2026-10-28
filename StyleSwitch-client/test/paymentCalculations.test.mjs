import { describe, it } from "node:test";
import assert from "node:assert";
import crypto from "crypto";

function computeDepositEscrow(pricePerDay, days, securityDeposit) {
  const rentalAmount = pricePerDay * days;
  const deposit = securityDeposit || 0;
  const totalAmount = rentalAmount + deposit;
  const platformCommission = Math.round(rentalAmount * 0.15); // 15% platform fee on rental fee
  const lenderDisbursement = rentalAmount - platformCommission;

  return { rentalAmount, deposit, totalAmount, platformCommission, lenderDisbursement };
}

function verifyRazorpaySignature(orderId, paymentId, signature, secret) {
  const payload = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return expected === signature;
}

describe("Payment Escrow & Cryptographic Verification Tests", () => {
  it("should accurately partition gross volume into platform commission, lender earnings, and escrow deposit", () => {
    // 5 days @ ₹3,000/day with ₹6,000 refundable deposit
    const result = computeDepositEscrow(3000, 5, 6000);

    assert.strictEqual(result.rentalAmount, 15000);
    assert.strictEqual(result.deposit, 6000);
    assert.strictEqual(result.totalAmount, 21000);
    assert.strictEqual(result.platformCommission, 2250); // 15% of 15,000
    assert.strictEqual(result.lenderDisbursement, 12750); // 85% of 15,000
  });

  it("should verify valid Razorpay HMAC-SHA256 signatures", () => {
    const orderId = "order_99887766";
    const paymentId = "pay_11223344";
    const secret = "secret_razorpay_key_2026";

    // Generate real signature
    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    assert.strictEqual(
      verifyRazorpaySignature(orderId, paymentId, validSignature, secret),
      true
    );

    // Tampered signature or mismatch
    assert.strictEqual(
      verifyRazorpaySignature(orderId, paymentId, "tampered_signature_hex", secret),
      false
    );
  });
});
