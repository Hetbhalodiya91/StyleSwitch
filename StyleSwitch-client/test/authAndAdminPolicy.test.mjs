import { describe, it } from "node:test";
import assert from "node:assert";

function validateRegistrationRole(role) {
  if (role === "admin") {
    throw new Error("Registration for administrator role is forbidden.");
  }
  const allowed = ["tenant", "lender", "renter"];
  if (role && !allowed.includes(role)) {
    throw new Error("Invalid role provided.");
  }
  return role || "tenant";
}

function parseBearerToken(authHeader) {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.trim().split(/\s+/);
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

function enforceSingleAdmin(existingAdminsCount, targetRole) {
  if (targetRole === "admin" && existingAdminsCount >= 1) {
    throw new Error("Strict singleton policy: only one administrator permitted.");
  }
  return true;
}

describe("Security & Single Administrator Policy Tests", () => {
  it("should prevent public users from self-registering as admin", () => {
    assert.throws(() => {
      validateRegistrationRole("admin");
    }, /Registration for administrator role is forbidden/);

    assert.strictEqual(validateRegistrationRole("tenant"), "tenant");
    assert.strictEqual(validateRegistrationRole("lender"), "lender");
  });

  it("should enforce the singleton admin policy when an administrator already exists", () => {
    // Attempting to create a second admin
    assert.throws(() => {
      enforceSingleAdmin(1, "admin");
    }, /only one administrator permitted/);

    // Creating normal lender/tenant accounts is always allowed
    assert.strictEqual(enforceSingleAdmin(1, "lender"), true);
    assert.strictEqual(enforceSingleAdmin(1, "tenant"), true);
  });

  it("should accurately extract JWT tokens from Bearer headers", () => {
    const valid = parseBearerToken("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz");
    assert.strictEqual(valid, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz");

    assert.strictEqual(parseBearerToken("Basic 12345"), null);
    assert.strictEqual(parseBearerToken(""), null);
    assert.strictEqual(parseBearerToken(undefined), null);
  });
});
