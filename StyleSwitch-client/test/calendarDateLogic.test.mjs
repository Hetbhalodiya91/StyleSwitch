import { describe, it } from "node:test";
import assert from "node:assert";

// Core calendar date calculation logic extracted from ClothCalendar.tsx
function calculateRentalMetrics(startDateStr, endDateStr, pricePerDay, securityDeposit) {
  const sd = new Date(startDateStr);
  const ed = new Date(endDateStr);
  
  if (ed <= sd) {
    throw new Error("End date must be strictly after start date");
  }
  
  const diffMs = ed.getTime() - sd.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const rentalTotal = days * pricePerDay;
  const deposit = securityDeposit || 0;
  const grandTotal = rentalTotal + deposit;
  
  return { days, rentalTotal, deposit, grandTotal };
}

function isDateWithinRange(dateStr, rangeStartStr, rangeEndStr) {
  const d = new Date(dateStr);
  const start = new Date(rangeStartStr);
  const end = new Date(rangeEndStr);
  return d >= start && d <= end;
}

function hasOverlap(newStartStr, newEndStr, existingRanges) {
  const ns = new Date(newStartStr);
  const ne = new Date(newEndStr);
  
  return existingRanges.some((range) => {
    const es = new Date(range.startDate);
    const ee = new Date(range.endDate);
    return ns <= ee && ne >= es;
  });
}

describe("Haute Circularity & Calendar Integrity Tests", () => {
  it("should accurately calculate rental duration and price breakdown", () => {
    const metrics = calculateRentalMetrics("2026-11-01", "2026-11-05", 2500, 5000);
    assert.strictEqual(metrics.days, 4);
    assert.strictEqual(metrics.rentalTotal, 10000);
    assert.strictEqual(metrics.deposit, 5000);
    assert.strictEqual(metrics.grandTotal, 15000);
  });

  it("should reject invalid date range where end date <= start date", () => {
    assert.throws(() => {
      calculateRentalMetrics("2026-11-05", "2026-11-02", 2500, 5000);
    }, /End date must be strictly after start date/);
  });

  it("should detect if a single date falls within an occupied reservation span", () => {
    const isBooked = isDateWithinRange("2026-11-03", "2026-11-01", "2026-11-05");
    const isFree = isDateWithinRange("2026-11-07", "2026-11-01", "2026-11-05");
    assert.strictEqual(isBooked, true);
    assert.strictEqual(isFree, false);
  });

  it("should prevent double-booking collisions by detecting overlapping date spans", () => {
    const bookedReservations = [
      { startDate: "2026-11-10", endDate: "2026-11-15", status: "CONFIRMED" },
      { startDate: "2026-11-20", endDate: "2026-11-25", status: "PENDING" },
    ];

    // Overlaps end of first reservation
    assert.strictEqual(hasOverlap("2026-11-14", "2026-11-18", bookedReservations), true);

    // Completely within second reservation
    assert.strictEqual(hasOverlap("2026-11-21", "2026-11-24", bookedReservations), true);

    // Completely clear date span
    assert.strictEqual(hasOverlap("2026-11-16", "2026-11-19", bookedReservations), false);
  });
});
