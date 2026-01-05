import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { collectAudioFingerprint } from "./audio";
import {
  createMockAudioContext,
  setupAudioContextUnavailable,
  type MockAudioContext,
} from "../__mocks__/audio";

describe("collectAudioFingerprint", () => {
  let mockContext: MockAudioContext;

  beforeEach(() => {
    vi.useFakeTimers();
    mockContext = createMockAudioContext();
    const MockAudioContextClass = vi.fn().mockImplementation(() => mockContext);

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
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("returns hash string", async () => {
    const promise = collectAudioFingerprint();
    await vi.advanceTimersByTimeAsync(500);
    const result = await promise;

    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result!.length).toBeGreaterThan(0);
  });

  it("returns null when AudioContext unavailable", async () => {
    setupAudioContextUnavailable();
    const result = await collectAudioFingerprint();
    expect(result).toBeNull();
  });

  it("returns null on exception", async () => {
    Object.defineProperty(window, "AudioContext", {
      value: vi.fn().mockImplementation(() => {
        throw new Error("Audio not supported");
      }),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "webkitAudioContext", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const result = await collectAudioFingerprint();
    expect(result).toBeNull();
  });

  it("uses webkitAudioContext as fallback", async () => {
    // Remove standard AudioContext
    Object.defineProperty(window, "AudioContext", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    // Keep webkit version
    const WebkitMock = vi.fn().mockImplementation(() => mockContext);
    Object.defineProperty(window, "webkitAudioContext", {
      value: WebkitMock,
      writable: true,
      configurable: true,
    });

    const promise = collectAudioFingerprint();
    await vi.advanceTimersByTimeAsync(500);
    const result = await promise;

    expect(WebkitMock).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("creates oscillator with triangle wave", async () => {
    const promise = collectAudioFingerprint();
    await vi.advanceTimersByTimeAsync(500);
    await promise;

    const oscillator = mockContext.createOscillator();
    expect(oscillator.type).toBe("triangle");
  });

  it("sets oscillator frequency to 10000Hz", async () => {
    const promise = collectAudioFingerprint();
    await vi.advanceTimersByTimeAsync(500);
    await promise;

    const oscillator = mockContext.createOscillator();
    expect(oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(10000, 0);
  });

  it("configures compressor correctly", async () => {
    const promise = collectAudioFingerprint();
    await vi.advanceTimersByTimeAsync(500);
    await promise;

    const compressor = mockContext.createDynamicsCompressor();
    expect(compressor.threshold.setValueAtTime).toHaveBeenCalledWith(-50, 0);
    expect(compressor.knee.setValueAtTime).toHaveBeenCalledWith(40, 0);
    expect(compressor.ratio.setValueAtTime).toHaveBeenCalledWith(12, 0);
    expect(compressor.attack.setValueAtTime).toHaveBeenCalledWith(0, 0);
    expect(compressor.release.setValueAtTime).toHaveBeenCalledWith(0.25, 0);
  });

  it("mutes output via gain node", async () => {
    const promise = collectAudioFingerprint();
    await vi.advanceTimersByTimeAsync(500);
    await promise;

    const gain = mockContext.createGain();
    expect(gain.gain.setValueAtTime).toHaveBeenCalledWith(0, 0);
  });

  it("caps wait time at 500ms", async () => {
    const promise = collectAudioFingerprint(2000); // Request 2000ms
    await vi.advanceTimersByTimeAsync(500); // Should complete at 500ms (capped)
    const result = await promise;

    expect(result).toBeDefined();
  });

  it("uses provided timeout when less than 500ms", async () => {
    const startTime = Date.now();
    const promise = collectAudioFingerprint(100);
    await vi.advanceTimersByTimeAsync(100);
    const result = await promise;

    expect(result).toBeDefined();
  });

  it("uses default 1000ms timeout (capped to 500ms)", async () => {
    const promise = collectAudioFingerprint(); // Default timeout
    await vi.advanceTimersByTimeAsync(500);
    const result = await promise;

    expect(result).toBeDefined();
  });

  it("closes audio context after completion", async () => {
    const promise = collectAudioFingerprint();
    await vi.advanceTimersByTimeAsync(500);
    await promise;

    expect(mockContext.close).toHaveBeenCalled();
  });

  it("stops oscillator after completion", async () => {
    const promise = collectAudioFingerprint();
    await vi.advanceTimersByTimeAsync(500);
    await promise;

    const oscillator = mockContext.createOscillator();
    expect(oscillator.stop).toHaveBeenCalled();
  });

  it("hashes first 30 frequency values", async () => {
    const frequencyData = new Array(128).fill(0).map((_, i) => -100 + i);
    mockContext = createMockAudioContext({ frequencyData });

    const MockClass = vi.fn().mockImplementation(() => mockContext);
    Object.defineProperty(window, "AudioContext", {
      value: MockClass,
      writable: true,
      configurable: true,
    });

    const promise = collectAudioFingerprint();
    await vi.advanceTimersByTimeAsync(500);
    const result = await promise;

    expect(result).toBeDefined();
    // The hash is computed from first 30 values joined by comma
    const analyser = mockContext.createAnalyser();
    expect(analyser.getFloatFrequencyData).toHaveBeenCalled();
  });

  it("returns consistent hash for same audio data", async () => {
    const promise1 = collectAudioFingerprint();
    await vi.advanceTimersByTimeAsync(500);
    const result1 = await promise1;

    // Reset mock for second call
    mockContext = createMockAudioContext();
    const MockClass = vi.fn().mockImplementation(() => mockContext);
    Object.defineProperty(window, "AudioContext", {
      value: MockClass,
      writable: true,
      configurable: true,
    });

    const promise2 = collectAudioFingerprint();
    await vi.advanceTimersByTimeAsync(500);
    const result2 = await promise2;

    expect(result1).toBe(result2);
  });
});
