import { describe, it, expect, beforeEach, vi, afterEach, type MockInstance } from "vitest";
import { getFingerprint, getDeviceId } from "../index";
import { resetScreenMock, resetNavigatorMock } from "../__mocks__/browser-apis";
import { createMockCanvas2DContext } from "../__mocks__/canvas";
import { createMockWebGLContext } from "../__mocks__/webgl";
import { createMockAudioContext } from "../__mocks__/audio";

describe("Fingerprint Integration Tests", () => {
  let createElementSpy: MockInstance;

  function setupFullEnvironment() {
    resetScreenMock();
    resetNavigatorMock();

    const ctx2d = createMockCanvas2DContext();
    const webglCtx = createMockWebGLContext();

    createElementSpy = vi.spyOn(document, "createElement").mockImplementation(((tagName: string) => {
      if (tagName === "canvas") {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn().mockImplementation((type: string) => {
            if (type === "2d") return ctx2d;
            if (type === "webgl" || type === "experimental-webgl") return webglCtx;
            return null;
          }),
          toDataURL: vi.fn().mockReturnValue("data:image/png;base64,integrationTestData"),
        } as unknown as HTMLCanvasElement;
      }
      return document.createElement(tagName);
    }) as typeof document.createElement);

    const mockAudioContext = createMockAudioContext();
    const MockAudioContextClass = vi.fn().mockImplementation(() => mockAudioContext);
    Object.defineProperty(window, "AudioContext", {
      value: MockAudioContextClass,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "webkitAudioContext", {
      value: MockAudioContextClass,
      writable: true,
      configurable: true,
    });
  }

  beforeEach(() => {
    vi.useFakeTimers();
    setupFullEnvironment();
  });

  afterEach(() => {
    vi.useRealTimers();
    if (createElementSpy) {
      createElementSpy.mockRestore();
    }
  });

  describe("Full fingerprint generation", () => {
    it("generates complete fingerprint with all collectors enabled", async () => {
      const promise = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      // Check all signals are present
      expect(result.signals.screenResolution).toBe("1920x1080");
      expect(result.signals.colorDepth).toBe(24);
      expect(result.signals.pixelRatio).toBe(2);
      expect(result.signals.timezone).toBe("America/New_York");
      expect(result.signals.language).toBe("en-US");
      expect(result.signals.platform).toBe("MacIntel");
      expect(result.signals.hardwareConcurrency).toBe(8);
      expect(result.signals.deviceMemory).toBe(16);
      expect(result.signals.canvas).toBeDefined();
      expect(result.signals.webglVendor).toBeDefined();
      expect(result.signals.webglRenderer).toBeDefined();
      expect(result.signals.audioFingerprint).toBeDefined();
      expect(result.signals.fontsHash).toBeDefined();
      expect(result.signals.sessionStorage).toBe(true);
      expect(result.signals.localStorage).toBe(true);
      expect(result.signals.indexedDB).toBe(true);

      // Check metadata
      expect(result.deviceId).toHaveLength(64);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.version).toBe("1.0.0");
      expect(result.timestamp).toBeDefined();
    });

    it("generates minimal fingerprint with all collectors disabled", async () => {
      const promise = getFingerprint({
        canvas: false,
        webgl: false,
        audio: false,
        fonts: false,
      });
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      // Optional signals should be null
      expect(result.signals.canvas).toBeNull();
      expect(result.signals.webglVendor).toBeNull();
      expect(result.signals.webglRenderer).toBeNull();
      expect(result.signals.audioFingerprint).toBeNull();
      expect(result.signals.fontsHash).toBeNull();

      // Basic signals should still be present
      expect(result.signals.screenResolution).toBe("1920x1080");
      expect(result.signals.platform).toBe("MacIntel");
      expect(result.signals.timezone).toBe("America/New_York");

      // Confidence should be lower
      expect(result.confidence).toBeLessThan(1);
      expect(result.deviceId).toHaveLength(64);
    });
  });

  describe("Fingerprint consistency", () => {
    it("produces consistent fingerprints across multiple calls", async () => {
      const promise1 = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const result1 = await promise1;

      const promise2 = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const result2 = await promise2;

      const promise3 = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const result3 = await promise3;

      expect(result1.deviceId).toBe(result2.deviceId);
      expect(result2.deviceId).toBe(result3.deviceId);
    });

    it("produces different fingerprints when hardware signals change", async () => {
      const promise1 = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const result1 = await promise1;

      // Simulate different device
      resetScreenMock({ width: 2560, height: 1440 });
      resetNavigatorMock({
        platform: "Win32",
        hardwareConcurrency: 16,
        deviceMemory: 32,
      });

      const promise2 = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const result2 = await promise2;

      expect(result1.deviceId).not.toBe(result2.deviceId);
    });
  });

  describe("Graceful degradation", () => {
    it("handles mixed collector failures gracefully", async () => {
      // WebGL unavailable
      createElementSpy.mockRestore();
      createElementSpy = vi.spyOn(document, "createElement").mockImplementation(((tagName: string) => {
        if (tagName === "canvas") {
          return {
            width: 0,
            height: 0,
            getContext: vi.fn().mockImplementation((type: string) => {
              if (type === "2d") return createMockCanvas2DContext();
              // WebGL returns null
              return null;
            }),
            toDataURL: vi.fn().mockReturnValue("data:image/png;base64,test"),
          } as unknown as HTMLCanvasElement;
        }
        return document.createElement(tagName);
      }) as typeof document.createElement);

      const promise = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      // Should still produce a valid fingerprint
      expect(result.deviceId).toHaveLength(64);
      expect(result.signals.webglVendor).toBeNull();
      expect(result.signals.webglRenderer).toBeNull();
      // Canvas should still work
      expect(result.signals.canvas).toBeDefined();
    });

    it("handles storage blocked scenario (private browsing)", async () => {
      // Simulate private browsing where storage is blocked
      Object.defineProperty(window, "sessionStorage", {
        get() {
          throw new Error("SecurityError");
        },
        configurable: true,
      });
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new Error("SecurityError");
        },
        configurable: true,
      });

      const promise = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      expect(result.deviceId).toHaveLength(64);
      expect(result.signals.sessionStorage).toBe(false);
      expect(result.signals.localStorage).toBe(false);
    });
  });

  describe("getDeviceId consistency", () => {
    it("returns same value as getFingerprint().deviceId", async () => {
      const idPromise = getDeviceId();
      await vi.advanceTimersByTimeAsync(500);
      const deviceId = await idPromise;

      // Reset environment for consistent comparison
      setupFullEnvironment();

      const fpPromise = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const fingerprint = await fpPromise;

      expect(deviceId).toBe(fingerprint.deviceId);
    });

    it("handles options correctly", async () => {
      // Test that options are respected by verifying different option combinations work
      const promise1 = getDeviceId({ canvas: false });
      await vi.advanceTimersByTimeAsync(500);
      const id1 = await promise1;

      const promise2 = getDeviceId({ audio: false });
      await vi.advanceTimersByTimeAsync(500);
      const id2 = await promise2;

      // Both should be valid device IDs
      expect(id1).toHaveLength(64);
      expect(id2).toHaveLength(64);
      expect(id1).toMatch(/^[0-9a-f]+$/);
      expect(id2).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe("Concurrent calls", () => {
    it("handles multiple concurrent fingerprint calls", async () => {
      const promises = [
        getFingerprint(),
        getFingerprint(),
        getFingerprint(),
      ];

      await vi.advanceTimersByTimeAsync(500);
      const results = await Promise.all(promises);

      // All should produce the same fingerprint
      expect(results[0].deviceId).toBe(results[1].deviceId);
      expect(results[1].deviceId).toBe(results[2].deviceId);

      // All should be valid
      results.forEach((result) => {
        expect(result.deviceId).toHaveLength(64);
        expect(result.confidence).toBeGreaterThan(0);
      });
    });
  });

  describe("Performance", () => {
    it("completes fingerprint generation within timeout", async () => {
      const promise = getFingerprint({ timeout: 100 });
      await vi.advanceTimersByTimeAsync(100);
      const result = await promise;

      expect(result.deviceId).toBeDefined();
      // With fake timers, we just verify it completes
    });
  });

  describe("Signal completeness", () => {
    it("includes all expected signal types", async () => {
      const promise = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      const expectedSignals = [
        "screenResolution",
        "colorDepth",
        "pixelRatio",
        "timezone",
        "timezoneOffset",
        "language",
        "languages",
        "platform",
        "userAgent",
        "vendor",
        "hardwareConcurrency",
        "deviceMemory",
        "maxTouchPoints",
        "cookiesEnabled",
        "doNotTrack",
        "plugins",
        "mimeTypes",
        "sessionStorage",
        "localStorage",
        "indexedDB",
        "canvas",
        "webglVendor",
        "webglRenderer",
        "audioFingerprint",
        "fontsHash",
      ];

      expectedSignals.forEach((signal) => {
        expect(result.signals).toHaveProperty(signal);
      });
    });
  });
});
