import { describe, it, expect } from "vitest";
import * as exports from "./index";
import { getFingerprint, getDeviceId } from "./index";
import type { DeviceFingerprint, DeviceSignals, FingerprintOptions } from "./index";

describe("index exports", () => {
  it("exports getFingerprint function", () => {
    expect(exports.getFingerprint).toBeDefined();
    expect(typeof exports.getFingerprint).toBe("function");
  });

  it("exports getDeviceId function", () => {
    expect(exports.getDeviceId).toBeDefined();
    expect(typeof exports.getDeviceId).toBe("function");
  });

  it("getFingerprint is the correct function", () => {
    expect(getFingerprint).toBe(exports.getFingerprint);
  });

  it("getDeviceId is the correct function", () => {
    expect(getDeviceId).toBe(exports.getDeviceId);
  });

  // Type exports are verified by TypeScript compilation
  // These tests ensure the types are properly re-exported
  it("exports DeviceFingerprint type (compilation check)", () => {
    // This is a compile-time check - if the type isn't exported, TypeScript will error
    const _typeCheck: DeviceFingerprint = {
      deviceId: "abc123",
      confidence: 0.9,
      signals: {} as DeviceSignals,
      timestamp: Date.now(),
      version: "1.0.0",
    };
    expect(_typeCheck).toBeDefined();
  });

  it("exports DeviceSignals type (compilation check)", () => {
    const _typeCheck: DeviceSignals = {
      screenResolution: "1920x1080",
      colorDepth: 24,
      pixelRatio: 2,
      timezone: "America/New_York",
      timezoneOffset: -300,
      language: "en-US",
      languages: ["en-US"],
      platform: "MacIntel",
      userAgent: "Mozilla/5.0",
      vendor: "Google Inc.",
      hardwareConcurrency: 8,
      deviceMemory: 16,
      maxTouchPoints: 0,
      cookiesEnabled: true,
      doNotTrack: "1",
      plugins: [],
      mimeTypes: [],
      sessionStorage: true,
      localStorage: true,
      indexedDB: true,
      canvas: "hash",
      webglVendor: "vendor",
      webglRenderer: "renderer",
      audioFingerprint: "audio",
      fontsHash: "fonts",
    };
    expect(_typeCheck).toBeDefined();
  });

  it("exports FingerprintOptions type (compilation check)", () => {
    const _typeCheck: FingerprintOptions = {
      canvas: true,
      webgl: true,
      audio: true,
      fonts: true,
      timeout: 1000,
    };
    expect(_typeCheck).toBeDefined();
  });
});
