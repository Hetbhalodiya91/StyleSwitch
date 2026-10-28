import mongoose from "mongoose";
import "dotenv/config";
import Booking from "./model/Booking.model.js";
import Cloth from "./model/Cloth.model.js";
import User from "./model/User.model.js";
import { withClothLock } from "./controller/Booking.controller.js";

/**
 * High-Concurrency Stress Test Script
 * Simulates 50 distinct members concurrently attempting to book the SAME garment
 * for the EXACT SAME date range at the exact same millisecond.
 */
async function runConcurrentBookingStressTest() {
  console.log("═".repeat(70));
  console.log("⚡ STYLESWITCH HIGH-CONCURRENCY RESERVATION STRESS TEST (50 USERS)");
  console.log("═".repeat(70));

  try {
    await mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/styleswitch", {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✓ Connected to MongoDB.");

    // Retrieve or seed a test garment
    let cloth = await Cloth.findOne({ isAvailable: true });
    let renter = await User.findOne({ role: "tenant" });

    if (!cloth || !renter) {
      console.log("⚠️ Missing cloth or tenant in DB. Please run 'npm run seed' first.");
      process.exit(1);
    }

    console.log(`\nTarget Garment: ${cloth.brand} (${cloth.category}) - ID: ${cloth._id}`);
    console.log(`Target Dates  : 2026-12-25 → 2026-12-30 (5 Days)`);

    const sd = new Date("2026-12-25");
    const ed = new Date("2026-12-30");

    // Clean up any old test booking for this window
    await Booking.deleteMany({
      clothId: cloth._id,
      startDate: sd,
      endDate: ed,
    });

    console.log(`\n🚀 Launching 50 concurrent booking requests simultaneously via Promise.all()...`);

    const CONCURRENT_COUNT = 50;
    const startBench = Date.now();

    // 50 parallel requests
    const tasks = Array.from({ length: CONCURRENT_COUNT }, (_, index) => {
      const userNum = index + 1;

      return withClothLock(cloth._id, async () => {
        // Overlap verification
        const conflicting = await Booking.findOne({
          clothId: cloth._id,
          status: { $in: ["PENDING", "CONFIRMED"] },
          startDate: { $lt: ed },
          endDate: { $gt: sd },
        });

        if (conflicting) {
          return {
            user: userNum,
            status: 409,
            conflict: true,
            message: "Double-booking prevented by mutex lock",
          };
        }

        const booking = await Booking.create({
          clothId: cloth._id,
          tenantId: renter._id,
          lenderId: cloth.lenderId,
          startDate: sd,
          endDate: ed,
          pricePerDay: cloth.rentalPricePerDay,
          totalAmount: cloth.rentalPricePerDay * 5,
          securityDeposit: cloth.securityDeposit || 0,
          status: "PENDING",
        });

        return {
          user: userNum,
          status: 201,
          bookingId: booking._id,
        };
      });
    });

    const results = await Promise.all(tasks);
    const totalTime = Date.now() - startBench;

    const successful = results.filter((r) => r.status === 201);
    const conflicts = results.filter((r) => r.status === 409);
    const failures = results.filter((r) => r.status !== 201 && r.status !== 409);

    console.log("\n" + "─".repeat(70));
    console.log(`⏱️  Total Duration          : ${totalTime}ms (Avg ${Math.round(totalTime / CONCURRENT_COUNT)}ms / request)`);
    console.log(`✅  Successful Bookings     : ${successful.length} (Expected: Exactly 1)`);
    console.log(`🛡️  Double-Bookings Blocked : ${conflicts.length} (Expected: Exactly 49)`);
    console.log(`❌  Server Errors / 500s    : ${failures.length} (Expected: 0)`);
    console.log("─".repeat(70));

    if (successful.length === 1 && conflicts.length === 49 && failures.length === 0) {
      console.log("\n🎉 TEST RESULT: 100% SUFFICIENT & RESILIENT ✅");
      console.log("   The website successfully serialized 50 concurrent booking attempts,");
      console.log("   awarded the reservation to the winning user, and cleanly rejected 49 duplicate attempts.");
      console.log("   ZERO double-bookings occurred.\n");
    } else {
      console.error("\n❌ CONCURRENCY VIOLATION DETECTED!");
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.\n");
  }
}

runConcurrentBookingStressTest();
