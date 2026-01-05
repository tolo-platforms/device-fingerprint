import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { getFingerprint, getDeviceId } from "./fingerprint";
import { resetScreenMock, resetNavigatorMock } from "./__mocks__/browser-apis";
import { createMockCanvas2DContext, createMockCanvas } from "./__mocks__/canvas";
import { createMockWebGLContext } from "./__mocks__/webgl";
import { createMockAudioContext } from "./__mocks__/audio";

describe("fingerprint", () => {
  let createElementSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    resetScreenMock();
    resetNavigatorMock();

    // Setup canvas mock with both 2D and WebGL support
    const ctx2d = createMockCanvas2DContext();
    const webglCtx = createMockWebGLContext();

    createElementSpy = vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "canvas") {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn().mockImplementation((type: string) => {
            if (type === "2d") return ctx2d;
            if (type === "webgl" || type === "experimental-webgl") return webglCtx;
            return null;
          }),
          toDataURL: vi.fn().mockReturnValue("data:image/png;base64,mockData"),
        } as unknown as HTMLCanvasElement;
      }
      return document.createElement(tagName);
    });

    // Setup AudioContext mock
    const mockAudioContext = createMockAudioContext();
    const MockAudioContextClass = vi.fn().mockImplementation(() => mockAudioContext);
    Object.defineProperty(window, "AudioContext", {
      value: MockAudioContextClass,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    createElementSpy.mockRestore();
  });

  describe("getFingerprint()", () => {
    it("returns DeviceFingerprint object", async () => {
      const promise = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      expect(result).toHaveProperty("deviceId");
      expect(result).toHaveProperty("confidence");
      expect(result).toHaveProperty("signals");
      expect(result).toHaveProperty("timestamp");
      expect(result).toHaveProperty("version");
    });

    it("returns deviceId as 64-char hex string", async () => {
      const promise = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      expect(result.deviceId).toBeDefined();
      expect(typeof result.deviceId).toBe("string");
      expect(result.deviceId.length).toBe(64);
      expect(result.deviceId).toMatch(/^[0-9a-f]+$/);
    });

    it("returns confidence between 0 and 1", async () => {
      const promise = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it("returns signals object with all properties", async () => {
      const promise = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      expect(result.signals).toHaveProperty("screenResolution");
      expect(result.signals).toHaveProperty("colorDepth");
      expect(result.signals).toHaveProperty("pixelRatio");
      expect(result.signals).toHaveProperty("timezone");
      expect(result.signals).toHaveProperty("language");
      expect(result.signals).toHaveProperty("platform");
      expect(result.signals).toHaveProperty("userAgent");
      expect(result.signals).toHaveProperty("hardwareConcurrency");
    });

    it("returns timestamp", async () => {
      const before = Date.now();
      const promise = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;
      const after = Date.now();

      expect(result.timestamp).toBeGreaterThanOrEqual(before);
      expect(result.timestamp).toBeLessThanOrEqual(after + 1000);
    });

    it("returns version '1.0.0'", async () => {
      const promise = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      expect(result.version).toBe("1.0.0");
    });

    it("uses default options when none provided", async () => {
      const promise = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      // With default options, canvas/webgl/audio/fonts should be collected
      expect(result.signals.canvas).toBeDefined();
    });

    it("respects canvas: false option", async () => {
      const promise = getFingerprint({ canvas: false });
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      expect(result.signals.canvas).toBeNull();
    });

    it("respects webgl: false option", async () => {
      const promise = getFingerprint({ webgl: false });
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      expect(result.signals.webglVendor).toBeNull();
      expect(result.signals.webglRenderer).toBeNull();
    });

    it("respects audio: false option", async () => {
      const promise = getFingerprint({ audio: false });
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      expect(result.signals.audioFingerprint).toBeNull();
    });

    it("respects fonts: false option", async () => {
      const promise = getFingerprint({ fonts: false });
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      expect(result.signals.fontsHash).toBeNull();
    });

    it("calculates confidence based on collected signals", async () => {
      const promise = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      // With all signals collected, confidence should be high
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("returns lower confidence when signals missing", async () => {
      const promise1 = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const fullResult = await promise1;

      const promise2 = getFingerprint({
        canvas: false,
        webgl: false,
        audio: false,
        fonts: false,
      });
      await vi.advanceTimersByTimeAsync(500);
      const partialResult = await promise2;

      expect(partialResult.confidence).toBeLessThan(fullResult.confidence);
    });

    it("generates consistent deviceId for same signals", async () => {
      const promise1 = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const result1 = await promise1;

      const promise2 = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const result2 = await promise2;

      expect(result1.deviceId).toBe(result2.deviceId);
    });

    it("generates different deviceId for different signals", async () => {
      const promise1 = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const result1 = await promise1;

      // Change screen resolution
      resetScreenMock({ width: 2560, height: 1440 });

      const promise2 = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const result2 = await promise2;

      expect(result1.deviceId).not.toBe(result2.deviceId);
    });

    it("passes timeout to audio collector", async () => {
      const promise = getFingerprint({ timeout: 100 });
      await vi.advanceTimersByTimeAsync(100);
      const result = await promise;

      expect(result).toBeDefined();
    });
  });

  describe("getDeviceId()", () => {
    it("returns just the deviceId string", async () => {
      const promise = getDeviceId();
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      expect(typeof result).toBe("string");
      expect(result.length).toBe(64);
      expect(result).toMatch(/^[0-9a-f]+$/);
    });

    it("passes options to getFingerprint", async () => {
      const promise1 = getDeviceId();
      await vi.advanceTimersByTimeAsync(500);
      const result1 = await promise1;

      // Change screen to get different result
      resetScreenMock({ width: 800, height: 600 });

      const promise2 = getDeviceId();
      await vi.advanceTimersByTimeAsync(500);
      const result2 = await promise2;

      expect(result1).not.toBe(result2);
    });

    it("returns same value as getFingerprint().deviceId", async () => {
      const idPromise = getDeviceId();
      await vi.advanceTimersByTimeAsync(500);
      const deviceId = await idPromise;

      const fpPromise = getFingerprint();
      await vi.advanceTimersByTimeAsync(500);
      const fingerprint = await fpPromise;

      expect(deviceId).toBe(fingerprint.deviceId);
    });
  });
});
