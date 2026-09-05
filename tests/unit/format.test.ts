import { describe, expect, it } from "vitest";
import { formatNaira, formatPropertyType } from "@/lib/utils";

describe("formatNaira", () => {
  it("formats a number as Nigerian Naira without kobo", () => {
    expect(formatNaira(150000)).toMatch(/150,000/);
  });

  it("returns ₦0 for invalid input", () => {
    expect(formatNaira("not-a-number")).toBe("₦0");
  });
});

describe("formatPropertyType", () => {
  it("labels self_con for tenants", () => {
    expect(formatPropertyType("self_con")).toBe("Self-con");
  });
});
