import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges tailwind classes correctly", () => {
    expect(cn("text-red-500", "bg-blue-500")).toBe("text-red-500 bg-blue-500");
  });

  it("resolves conflicting classes (later ones override)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("px-2", "px-4", "px-8")).toBe("px-8");
  });

  it("handles falsy values", () => {
    expect(cn("text-blue", false, null, undefined, "")).toBe("text-blue");
  });

  it("handles conditional classes with objects", () => {
    expect(cn("base", true && "active", false && "inactive")).toBe("base active");
  });

  it("handles arrays and objects together", () => {
    expect(cn(["text-blue"], ["bg-red-500"], { hidden: true })).toBe("text-blue bg-red-500 hidden");
  });

  it("returns empty string when no classes provided", () => {
    expect(cn(false, null)).toBe("");
  });
});
