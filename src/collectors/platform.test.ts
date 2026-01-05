import { describe, it, expect, beforeEach } from "vitest";
import { collectPlatformSignals } from "./platform";
import { resetNavigatorMock } from "../__mocks__/browser-apis";

describe("collectPlatformSignals", () => {
  beforeEach(() => {
    resetNavigatorMock();
  });

  it("returns platform string", () => {
    const result = collectPlatformSignals();
    expect(result.platform).toBe("MacIntel");
  });

  it("returns 'unknown' for missing platform", () => {
    Object.defineProperty(navigator, "platform", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const result = collectPlatformSignals();
    expect(result.platform).toBe("unknown");
  });

  it("returns userAgent", () => {
    const result = collectPlatformSignals();
    expect(result.userAgent).toBeDefined();
    expect(typeof result.userAgent).toBe("string");
  });

  it("returns vendor", () => {
    const result = collectPlatformSignals();
    expect(result.vendor).toBe("Google Inc.");
  });

  it("returns empty string for missing vendor", () => {
    Object.defineProperty(navigator, "vendor", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const result = collectPlatformSignals();
    expect(result.vendor).toBe("");
  });

  it("returns hardwareConcurrency", () => {
    const result = collectPlatformSignals();
    expect(result.hardwareConcurrency).toBe(8);
  });

  it("returns 0 for missing hardwareConcurrency", () => {
    Object.defineProperty(navigator, "hardwareConcurrency", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const result = collectPlatformSignals();
    expect(result.hardwareConcurrency).toBe(0);
  });

  it("returns deviceMemory", () => {
    const result = collectPlatformSignals();
    expect(result.deviceMemory).toBe(16);
  });

  it("returns null for missing deviceMemory", () => {
    Object.defineProperty(navigator, "deviceMemory", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const result = collectPlatformSignals();
    expect(result.deviceMemory).toBeNull();
  });

  it("returns maxTouchPoints", () => {
    const result = collectPlatformSignals();
    expect(result.maxTouchPoints).toBe(0);
  });

  it("returns 0 for missing maxTouchPoints", () => {
    Object.defineProperty(navigator, "maxTouchPoints", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const result = collectPlatformSignals();
    expect(result.maxTouchPoints).toBe(0);
  });

  it("returns cookiesEnabled", () => {
    const result = collectPlatformSignals();
    expect(result.cookiesEnabled).toBe(true);
  });

  it("returns doNotTrack", () => {
    const result = collectPlatformSignals();
    expect(result.doNotTrack).toBe("1");
  });

  it("returns null for missing doNotTrack", () => {
    Object.defineProperty(navigator, "doNotTrack", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const result = collectPlatformSignals();
    expect(result.doNotTrack).toBeNull();
  });

  it("returns plugins array", () => {
    const result = collectPlatformSignals();
    expect(Array.isArray(result.plugins)).toBe(true);
    expect(result.plugins).toContain("Chrome PDF Plugin");
  });

  it("returns empty array when plugins unavailable", () => {
    Object.defineProperty(navigator, "plugins", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const result = collectPlatformSignals();
    expect(result.plugins).toEqual([]);
  });

  it("returns mimeTypes array", () => {
    const result = collectPlatformSignals();
    expect(Array.isArray(result.mimeTypes)).toBe(true);
    expect(result.mimeTypes).toContain("application/pdf");
  });

  it("returns empty array when mimeTypes unavailable", () => {
    Object.defineProperty(navigator, "mimeTypes", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const result = collectPlatformSignals();
    expect(result.mimeTypes).toEqual([]);
  });

  it("handles touch-enabled devices", () => {
    Object.defineProperty(navigator, "maxTouchPoints", {
      value: 10,
      writable: true,
      configurable: true,
    });
    const result = collectPlatformSignals();
    expect(result.maxTouchPoints).toBe(10);
  });

  it("handles mobile platforms", () => {
    Object.defineProperty(navigator, "platform", {
      value: "iPhone",
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, "maxTouchPoints", {
      value: 5,
      writable: true,
      configurable: true,
    });
    const result = collectPlatformSignals();
    expect(result.platform).toBe("iPhone");
    expect(result.maxTouchPoints).toBe(5);
  });

  it("returns all expected properties", () => {
    const result = collectPlatformSignals();
    expect(result).toHaveProperty("platform");
    expect(result).toHaveProperty("userAgent");
    expect(result).toHaveProperty("vendor");
    expect(result).toHaveProperty("hardwareConcurrency");
    expect(result).toHaveProperty("deviceMemory");
    expect(result).toHaveProperty("maxTouchPoints");
    expect(result).toHaveProperty("cookiesEnabled");
    expect(result).toHaveProperty("doNotTrack");
    expect(result).toHaveProperty("plugins");
    expect(result).toHaveProperty("mimeTypes");
  });
});
