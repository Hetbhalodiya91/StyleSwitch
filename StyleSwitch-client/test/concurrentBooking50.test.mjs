import { describe, it } from "node:test";
import assert from "node:assert";

// Simulated concurrent store implementing the exact lock & conflict detection logic from Booking.controller.js
class ConcurrentBookingEngine {
  constructor() {
    this.bookings = [];
    this.locks = new Map();
  }

  async withClothLock(clothId, fn) {
    const key = clothId.toString();
    while (this.locks.has(key)) {
      await this.locks.get(key);
    }

    let unlock;
    const lockPromise = new Promise((resolve) => {
      unlock = resolve;
    });
    this.locks.set(key, lockPromise);

    try {
      return await fn();
    } finally {
      this.locks.delete(key);
      unlock();
    }
  }

  async createBooking({ clothId, userId, startDate, endDate, pricePerDay }) {
    const sd = new Date(startDate);
    const ed = new Date(endDate);

    if (ed <= sd) {
      return { status: 400, error: "Invalid date range" };
    }

    // Critical section locked per clothId
    return await this.withClothLock(clothId, async () => {
      // Simulate minimal async I/O latency (1-3ms)
      await new Promise((r) => setTimeout(r, Math.random() * 2 + 1));

      // Check collision
      const conflict = this.bookings.find(
        (b) =>
          b.clothId === clothId &&
          ["PENDING", "CONFIRMED"].includes(b.status) &&
          new Date(b.startDate) < ed &&
          new Date(b.endDate) > sd
      );

      if (conflict) {
        return {
          status: 409,
          conflict: true,
          message: "This garment has already been reserved for the requested dates.",
          bookedDates: { startDate: conflict.startDate, endDate: conflict.endDate },
        };
      }

      // No conflict -> create booking
      const newBooking = {
        _id: `b_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        clothId,
        tenantId: userId,
        startDate: sd.toISOString(),
        endDate: ed.toISOString(),
        status: "PENDING",
      };

      this.bookings.push(newBooking);

      return {
        status: 201,
        success: true,
        booking: newBooking,
      };
    });
  }
}

describe("High-Concurrency Stress Test — 50 Concurrent Users Booking the Same Garment", () => {
  it("should successfully allow exactly 1 booking and reject all other 49 with 409 Conflict (Zero Double-Bookings)", async () => {
    const engine = new ConcurrentBookingEngine();
    const TARGET_CLOTH_ID = "cloth_manyavar_sherwani_001";
    const START_DATE = "2026-12-01";
    const END_DATE = "2026-12-05";
    const TOTAL_USERS = 50;

    console.log(`\n    ⚡ Firing ${TOTAL_USERS} concurrent booking requests simultaneously for cloth: ${TARGET_CLOTH_ID}...`);
    const startTime = Date.now();

    // Fire 50 simultaneous asynchronous booking requests
    const userRequests = Array.from({ length: TOTAL_USERS }, (_, index) => {
      return engine.createBooking({
        clothId: TARGET_CLOTH_ID,
        userId: `user_${index + 1}`,
        startDate: START_DATE,
        endDate: END_DATE,
        pricePerDay: 3200,
      });
    });

    const results = await Promise.all(userRequests);
    const duration = Date.now() - startTime;

    const successfulBookings = results.filter((r) => r.status === 201);
    const rejectedConflicts = results.filter((r) => r.status === 409);
    const otherErrors = results.filter((r) => r.status !== 201 && r.status !== 409);

    console.log(`    ✓ 50-User Concurrency Completed in ${duration}ms`);
    console.log(`    ✓ Successful Bookings (201 Created) : ${successfulBookings.length} (Expected: 1)`);
    console.log(`    ✓ Blocked Collisions  (409 Conflict): ${rejectedConflicts.length} (Expected: 49)`);
    console.log(`    ✓ System Errors       (500/Other)   : ${otherErrors.length} (Expected: 0)`);

    // Strict assertions
    assert.strictEqual(
      successfulBookings.length,
      1,
      "CRITICAL FAILURE: Exactly ONE user must be granted the booking reservation!"
    );

    assert.strictEqual(
      rejectedConflicts.length,
      49,
      "CRITICAL FAILURE: Exactly 49 users must receive 409 Conflict preventing double-booking!"
    );

    assert.strictEqual(
      otherErrors.length,
      0,
      "CRITICAL FAILURE: No 500 or unhandled errors permitted!"
    );

    assert.strictEqual(
      engine.bookings.length,
      1,
      "CRITICAL FAILURE: Database must contain exactly 1 booking!"
    );
  });

  it("should permit non-overlapping dates to be booked in parallel without interference", async () => {
    const engine = new ConcurrentBookingEngine();
    const TARGET_CLOTH_ID = "cloth_sabyasachi_lehenga_002";

    // 25 users try to book Slot A (Dec 1 - Dec 5)
    // 25 users try to book Slot B (Dec 10 - Dec 15)
    const slotARequests = Array.from({ length: 25 }, (_, i) =>
      engine.createBooking({
        clothId: TARGET_CLOTH_ID,
        userId: `user_slotA_${i}`,
        startDate: "2026-12-01",
        endDate: "2026-12-05",
        pricePerDay: 7500,
      })
    );

    const slotBRequests = Array.from({ length: 25 }, (_, i) =>
      engine.createBooking({
        clothId: TARGET_CLOTH_ID,
        userId: `user_slotB_${i}`,
        startDate: "2026-12-10",
        endDate: "2026-12-15",
        pricePerDay: 7500,
      })
    );

    // Fire all 50 in parallel
    const allResults = await Promise.all([...slotARequests, ...slotBRequests]);

    const successes = allResults.filter((r) => r.status === 201);
    const conflicts = allResults.filter((r) => r.status === 409);

    // Exactly 1 for Slot A and exactly 1 for Slot B
    assert.strictEqual(successes.length, 2);
    assert.strictEqual(conflicts.length, 48);
    assert.strictEqual(engine.bookings.length, 2);
  });
});
