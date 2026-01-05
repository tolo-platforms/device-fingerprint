import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { collectWebGLSignals } from "./webgl";
import {
  createMockWebGLContext,
  UNMASKED_VENDOR_WEBGL,
  UNMASKED_RENDERER_WEBGL,
  GL_VENDOR,
  GL_RENDERER,
} from "../__mocks__/webgl";

describe("collectWebGLSignals", () => {
  let createElementSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createElementSpy = vi.spyOn(document, "createElement");
  });

  afterEach(() => {
    createElementSpy.mockRestore();
  });

  function setupWebGLMock(options: Parameters<typeof createMockWebGLContext>[0] = {}) {
    const mockGLContext = createMockWebGLContext(options);
    createElementSpy.mockImplementation((tagName: string) => {
      if (tagName === "canvas") {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn().mockImplementation((type: string) => {
            if (type === "webgl" || type === "experimental-webgl") {
              return mockGLContext;
            }
            return null;
          }),
        } as unknown as HTMLCanvasElement;
      }
      return document.createElement(tagName);
    });
    return mockGLContext;
  }

  it("returns vendor and renderer with debug info", () => {
    setupWebGLMock({
      hasDebugInfo: true,
      unmaskedVendor: "NVIDIA Corporation",
      unmaskedRenderer: "NVIDIA GeForce RTX 3080",
    });

    const result = collectWebGLSignals();
    expect(result.vendor).toBe("NVIDIA Corporation");
    expect(result.renderer).toBe("NVIDIA GeForce RTX 3080");
  });

  it("returns vendor/renderer without debug info extension (fallback)", () => {
    const mockGL = setupWebGLMock({
      hasDebugInfo: false,
      vendor: "WebKit",
      renderer: "WebKit WebGL",
    });

    const result = collectWebGLSignals();

    // Should use masked values from VENDOR/RENDERER constants
    expect(mockGL.getExtension).toHaveBeenCalledWith("WEBGL_debug_renderer_info");
    expect(mockGL.getParameter).toHaveBeenCalledWith(GL_VENDOR);
    expect(mockGL.getParameter).toHaveBeenCalledWith(GL_RENDERER);
    expect(result.vendor).toBe("WebKit");
    expect(result.renderer).toBe("WebKit WebGL");
  });

  it("returns nulls when WebGL unavailable", () => {
    createElementSpy.mockImplementation((tagName: string) => {
      if (tagName === "canvas") {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn().mockReturnValue(null),
        } as unknown as HTMLCanvasElement;
      }
      return document.createElement(tagName);
    });

    const result = collectWebGLSignals();
    expect(result.vendor).toBeNull();
    expect(result.renderer).toBeNull();
  });

  it("tries experimental-webgl as fallback", () => {
    let callCount = 0;
    const mockGL = createMockWebGLContext();

    createElementSpy.mockImplementation((tagName: string) => {
      if (tagName === "canvas") {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn().mockImplementation((type: string) => {
            callCount++;
            // First call with "webgl" returns null, second with "experimental-webgl" returns context
            if (type === "experimental-webgl") {
              return mockGL;
            }
            return null;
          }),
        } as unknown as HTMLCanvasElement;
      }
      return document.createElement(tagName);
    });

    const result = collectWebGLSignals();
    expect(callCount).toBe(2); // webgl + experimental-webgl
    expect(result.vendor).toBe("Apple Inc.");
  });

  it("returns nulls on exception", () => {
    createElementSpy.mockImplementation(() => {
      throw new Error("WebGL not supported");
    });

    const result = collectWebGLSignals();
    expect(result.vendor).toBeNull();
    expect(result.renderer).toBeNull();
  });

  it("extracts unmasked info when debug extension available", () => {
    const mockGL = setupWebGLMock({ hasDebugInfo: true });

    collectWebGLSignals();

    expect(mockGL.getExtension).toHaveBeenCalledWith("WEBGL_debug_renderer_info");
    expect(mockGL.getParameter).toHaveBeenCalledWith(UNMASKED_VENDOR_WEBGL);
    expect(mockGL.getParameter).toHaveBeenCalledWith(UNMASKED_RENDERER_WEBGL);
  });

  it("handles various GPU vendors", () => {
    setupWebGLMock({
      hasDebugInfo: true,
      unmaskedVendor: "Intel Inc.",
      unmaskedRenderer: "Intel(R) UHD Graphics 630",
    });

    const result = collectWebGLSignals();
    expect(result.vendor).toBe("Intel Inc.");
    expect(result.renderer).toBe("Intel(R) UHD Graphics 630");
  });
});
