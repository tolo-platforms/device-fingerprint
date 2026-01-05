import { describe, it, expect, beforeEach } from "vitest";
import { collectScreenSignals } from "./screen";
import { resetScreenMock } from "../__mocks__/browser-apis";

describe("collectScreenSignals", () => {
  beforeEach(() => {
    resetScreenMock();
    Object.defineProperty(window, "devicePixelRatio", {
      value: 2,
      writable: true,
      configurable: true,
    });
  });

  it("returns correct screen resolution format", () => {
    const result = collectScreenSignals();
    expect(result.screenResolution).toBe("1920x1080");
  });

  it("returns correct colorDepth", () => {
    const result = collectScreenSignals();
    expect(result.colorDepth).toBe(24);
  });

  it("returns correct pixelRatio", () => {
    const result = collectScreenSignals();
    expect(result.pixelRatio).toBe(2);
  });

  it("handles different screen sizes", () => {
    resetScreenMock({ width: 2560, height: 1440 });
    const result = collectScreenSignals();
    expect(result.screenResolution).toBe("2560x1440");
  });

  it("handles missing devicePixelRatio (defaults to 1)", () => {
    Object.defineProperty(window, "devicePixelRatio", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const result = collectScreenSignals();
    expect(result.pixelRatio).toBe(1);
  });

  it("handles high DPI displays", () => {
    Object.defineProperty(window, "devicePixelRatio", {
      value: 3,
      writable: true,
      configurable: true,
    });
    const result = collectScreenSignals();
    expect(result.pixelRatio).toBe(3);
  });

  it("handles various color depths", () => {
    resetScreenMock({ colorDepth: 32 });
    const result = collectScreenSignals();
    expect(result.colorDepth).toBe(32);
  });

  it("returns all expected properties", () => {
    const result = collectScreenSignals();
    expect(result).toHaveProperty("screenResolution");
    expect(result).toHaveProperty("colorDepth");
    expect(result).toHaveProperty("pixelRatio");
  });
});
