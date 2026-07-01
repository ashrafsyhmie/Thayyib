import { describe, expect, it } from "vitest";
import { getCertificateStatus } from "./format";

describe("getCertificateStatus", () => {
  const today = new Date("2026-06-28T00:00:00.000Z");

  it("returns Missing Certificate when no expiry date is recorded", () => {
    expect(getCertificateStatus(null, today)).toBe("Missing Certificate");
  });

  it("returns Expired when the expiry date is in the past", () => {
    expect(getCertificateStatus("2026-06-01", today)).toBe("Expired");
  });

  it("returns Expiring Soon when the expiry date is within 30 days", () => {
    expect(getCertificateStatus("2026-07-15", today)).toBe("Expiring Soon");
  });

  it("returns Valid when the expiry date is more than 30 days away", () => {
    expect(getCertificateStatus("2026-08-15", today)).toBe("Valid");
  });
});
