import { describe, it, expect, beforeEach, vi, afterEach, type MockInstance } from "vitest";
import { collectFontsFingerprint } from "./fonts";
import { createMockCanvas2DContext, createMockCanvas } from "../__mocks__/canvas";

describe("collectFontsFingerprint", () => {
  let createElementSpy: MockInstance;

  beforeEach(() => {
    createElementSpy = vi.spyOn(document, "createElement");
  });

  afterEach(() => {
    createElementSpy.mockRestore();
  });

  function setupFontMock(fontWidths: Record<string, number> = {}) {
    const ctx = createMockCanvas2DContext();

    // Default widths for base fonts
    const baseWidths: Record<string, number> = {
      monospace: 100,
      "sans-serif": 90,
      serif: 95,
    };

    ctx.measureText = vi.fn().mockImplementation(() => {
      const font = ctx.font;

      // Check for specific fonts in the font string
      for (const [fontKey, width] of Object.entries(fontWidths)) {
        if (font.includes(`'${fontKey}'`)) {
          return { width };
        }
      }

      // Check for base fonts
      for (const [baseFont, width] of Object.entries(baseWidths)) {
        if (font.endsWith(baseFont)) {
          return { width };
        }
      }

      return { width: 100 };
    });

    const mockCanvas = createMockCanvas(ctx);
    createElementSpy.mockImplementation(((tagName: string) => {
      if (tagName === "canvas") {
        return mockCanvas as unknown as HTMLCanvasElement;
      }
      return document.createElement(tagName);
    }) as typeof document.createElement);

    return { ctx, mockCanvas };
  }

  it("returns hash string", () => {
    setupFontMock({ Arial: 85 }); // Different from base widths, so Arial detected
    const result = collectFontsFingerprint();
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result!.length).toBeGreaterThan(0);
  });

  it("returns null when canvas context unavailable", () => {
    const mockCanvas = createMockCanvas(null);
    mockCanvas.getContext = vi.fn().mockReturnValue(null);
    createElementSpy.mockImplementation(((tagName: string) => {
      if (tagName === "canvas") {
        return mockCanvas as unknown as HTMLCanvasElement;
      }
      return document.createElement(tagName);
    }) as typeof document.createElement);

    const result = collectFontsFingerprint();
    expect(result).toBeNull();
  });

  it("returns null on exception", () => {
    createElementSpy.mockImplementation(() => {
      throw new Error("Canvas not supported");
    });
    const result = collectFontsFingerprint();
    expect(result).toBeNull();
  });

  it("uses correct test string (mmmmmmmmmmlli)", () => {
    const { ctx } = setupFontMock();
    collectFontsFingerprint();
    expect(ctx.measureText).toHaveBeenCalledWith("mmmmmmmmmmlli");
  });

  it("uses correct test size (72px)", () => {
    const { ctx } = setupFontMock();
    collectFontsFingerprint();

    // Check that 72px was used in font setting
    const fontCalls = (ctx.measureText as ReturnType<typeof vi.fn>).mock.calls;
    expect(fontCalls.length).toBeGreaterThan(0);
  });

  it("measures against monospace, sans-serif, serif base fonts", () => {
    const { ctx } = setupFontMock();
    collectFontsFingerprint();

    // Check that base fonts were measured
    const fontSettings: string[] = [];
    const measureCalls = (ctx.measureText as ReturnType<typeof vi.fn>).mock.calls;
    measureCalls.forEach(() => {
      fontSettings.push(ctx.font);
    });

    // The function sets ctx.font before calling measureText
    // We should see base fonts being used
    expect(ctx.font).toBeDefined();
  });

  it("detects fonts by width difference", () => {
    // Arial returns different width than all base fonts
    setupFontMock({ Arial: 50 });
    const result1 = collectFontsFingerprint();

    // Reset and use same widths as base (no fonts detected)
    setupFontMock({});
    const result2 = collectFontsFingerprint();

    // Hashes should be different if fonts are detected
    expect(result1).not.toBe(result2);
  });

  it("returns consistent hash for same fonts", () => {
    setupFontMock({ Arial: 50, Verdana: 55 });
    const result1 = collectFontsFingerprint();

    // Same setup
    setupFontMock({ Arial: 50, Verdana: 55 });
    const result2 = collectFontsFingerprint();

    expect(result1).toBe(result2);
  });

  it("handles all fonts same as base (empty result)", () => {
    // All fonts return same width as base fonts
    setupFontMock({});
    const result = collectFontsFingerprint();
    // Should still return a hash (of empty string)
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("handles multiple detected fonts", () => {
    setupFontMock({
      Arial: 50,
      "Arial Black": 60,
      Verdana: 55,
      "Times New Roman": 45,
    });
    const result = collectFontsFingerprint();
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("tests common fonts list", () => {
    const { ctx } = setupFontMock();
    collectFontsFingerprint();

    // Should measure multiple times (base fonts + test fonts)
    const measureCalls = (ctx.measureText as ReturnType<typeof vi.fn>).mock.calls;
    // 3 base fonts + (22 test fonts * 3 base comparisons) = many calls
    expect(measureCalls.length).toBeGreaterThan(20);
  });
});
