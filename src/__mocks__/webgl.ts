import { vi } from "vitest";

// WebGL constants
export const GL_VENDOR = 0x1f00;
export const GL_RENDERER = 0x1f01;
export const UNMASKED_VENDOR_WEBGL = 0x9245;
export const UNMASKED_RENDERER_WEBGL = 0x9246;

export interface MockWebGLDebugInfo {
  UNMASKED_VENDOR_WEBGL: number;
  UNMASKED_RENDERER_WEBGL: number;
}

export interface MockWebGLContext {
  VENDOR: number;
  RENDERER: number;
  getExtension: ReturnType<typeof vi.fn>;
  getParameter: ReturnType<typeof vi.fn>;
}

export interface WebGLMockOptions {
  hasDebugInfo?: boolean;
  vendor?: string;
  renderer?: string;
  unmaskedVendor?: string;
  unmaskedRenderer?: string;
}

export function createMockWebGLContext(options: WebGLMockOptions = {}): MockWebGLContext {
  const {
    hasDebugInfo = true,
    vendor = "WebKit",
    renderer = "WebKit WebGL",
    unmaskedVendor = "Apple Inc.",
    unmaskedRenderer = "Apple M1 Pro",
  } = options;

  const debugInfo: MockWebGLDebugInfo | null = hasDebugInfo
    ? {
        UNMASKED_VENDOR_WEBGL,
        UNMASKED_RENDERER_WEBGL,
      }
    : null;

  return {
    VENDOR: GL_VENDOR,
    RENDERER: GL_RENDERER,
    getExtension: vi.fn().mockImplementation((name: string) => {
      if (name === "WEBGL_debug_renderer_info") return debugInfo;
      return null;
    }),
    getParameter: vi.fn().mockImplementation((param: number) => {
      switch (param) {
        case GL_VENDOR:
          return vendor;
        case GL_RENDERER:
          return renderer;
        case UNMASKED_VENDOR_WEBGL:
          return unmaskedVendor;
        case UNMASKED_RENDERER_WEBGL:
          return unmaskedRenderer;
        default:
          return null;
      }
    }),
  };
}

export function setupWebGLMock(options: WebGLMockOptions = {}): MockWebGLContext {
  const mockGLContext = createMockWebGLContext(options);

  vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
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
        toDataURL: vi.fn().mockReturnValue("data:image/png;base64,mock"),
      } as unknown as HTMLCanvasElement;
    }
    return document.createElement(tagName);
  });

  return mockGLContext;
}

export function setupWebGLUnavailable(): void {
  vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
    if (tagName === "canvas") {
      return {
        width: 0,
        height: 0,
        getContext: vi.fn().mockReturnValue(null),
        toDataURL: vi.fn().mockReturnValue(""),
      } as unknown as HTMLCanvasElement;
    }
    return document.createElement(tagName);
  });
}
