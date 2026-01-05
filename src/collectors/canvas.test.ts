import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { collectCanvasFingerprint } from "./canvas";
import {
  createMockCanvas2DContext,
  createMockCanvas,
  type MockCanvas2DContext,
  type MockCanvasElement,
} from "../__mocks__/canvas";

describe("collectCanvasFingerprint", () => {
  let mockCtx: MockCanvas2DContext;
  let mockCanvas: MockCanvasElement;
  let createElementSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockCtx = createMockCanvas2DContext();
    mockCanvas = createMockCanvas(mockCtx, { dataURL: "data:image/png;base64,testImageData" });
    createElementSpy = vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "canvas") {
        return mockCanvas as unknown as HTMLCanvasElement;
      }
      return document.createElement(tagName);
    });
  });

  afterEach(() => {
    createElementSpy.mockRestore();
  });

  it("returns hash string", () => {
    const result = collectCanvasFingerprint();
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result!.length).toBeGreaterThan(0);
  });

  it("returns null when canvas context unavailable", () => {
    mockCanvas.getContext = vi.fn().mockReturnValue(null);
    const result = collectCanvasFingerprint();
    expect(result).toBeNull();
  });

  it("returns null on exception", () => {
    createElementSpy.mockImplementation(() => {
      throw new Error("Canvas not supported");
    });
    const result = collectCanvasFingerprint();
    expect(result).toBeNull();
  });

  it("sets correct canvas dimensions (200x50)", () => {
    collectCanvasFingerprint();
    expect(mockCanvas.width).toBe(200);
    expect(mockCanvas.height).toBe(50);
  });

  it("draws background", () => {
    collectCanvasFingerprint();
    expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 200, 50);
  });

  it("draws text with correct fonts", () => {
    collectCanvasFingerprint();
    expect(mockCtx.fillText).toHaveBeenCalledWith("Tolo Fingerprint 🔐", 2, 15);
    expect(mockCtx.fillText).toHaveBeenCalledWith("Canvas Test", 4, 35);
  });

  it("draws arc", () => {
    collectCanvasFingerprint();
    expect(mockCtx.beginPath).toHaveBeenCalled();
    expect(mockCtx.arc).toHaveBeenCalledWith(50, 25, 10, 0, Math.PI * 2, true);
    expect(mockCtx.closePath).toHaveBeenCalled();
    expect(mockCtx.fill).toHaveBeenCalled();
  });

  it("creates gradient", () => {
    collectCanvasFingerprint();
    expect(mockCtx.createLinearGradient).toHaveBeenCalledWith(100, 0, 200, 0);
  });

  it("calls toDataURL with correct format", () => {
    collectCanvasFingerprint();
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith("image/png");
  });

  it("returns consistent hash for same canvas data", () => {
    const result1 = collectCanvasFingerprint();
    const result2 = collectCanvasFingerprint();
    expect(result1).toBe(result2);
  });

  it("handles different canvas data", () => {
    const result1 = collectCanvasFingerprint();
    mockCanvas.toDataURL = vi.fn().mockReturnValue("data:image/png;base64,differentData");
    const result2 = collectCanvasFingerprint();
    expect(result1).not.toBe(result2);
  });

  it("sets textBaseline to alphabetic", () => {
    collectCanvasFingerprint();
    expect(mockCtx.textBaseline).toBe("alphabetic");
  });
});
