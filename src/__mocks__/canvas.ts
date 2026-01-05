import { vi } from "vitest";

export interface MockCanvasGradient {
  addColorStop: ReturnType<typeof vi.fn>;
}

export interface MockCanvas2DContext {
  fillStyle: string;
  font: string;
  textBaseline: string;
  fillRect: ReturnType<typeof vi.fn>;
  fillText: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  arc: ReturnType<typeof vi.fn>;
  closePath: ReturnType<typeof vi.fn>;
  fill: ReturnType<typeof vi.fn>;
  createLinearGradient: ReturnType<typeof vi.fn>;
  measureText: ReturnType<typeof vi.fn>;
}

export function createMockCanvas2DContext(
  options: { measureTextWidth?: number } = {}
): MockCanvas2DContext {
  const mockGradient: MockCanvasGradient = {
    addColorStop: vi.fn(),
  };

  return {
    fillStyle: "",
    font: "",
    textBaseline: "",
    fillRect: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    createLinearGradient: vi.fn().mockReturnValue(mockGradient),
    measureText: vi.fn().mockReturnValue({ width: options.measureTextWidth ?? 100 }),
  };
}

export interface MockCanvasElement {
  width: number;
  height: number;
  getContext: ReturnType<typeof vi.fn>;
  toDataURL: ReturnType<typeof vi.fn>;
}

export function createMockCanvas(
  ctx: MockCanvas2DContext | null = null,
  options: { dataURL?: string } = {}
): MockCanvasElement {
  const context = ctx || createMockCanvas2DContext();
  return {
    width: 0,
    height: 0,
    getContext: vi.fn().mockImplementation((type: string) => {
      if (type === "2d") return context;
      if (type === "webgl" || type === "experimental-webgl") return null;
      return null;
    }),
    toDataURL: vi.fn().mockReturnValue(options.dataURL ?? "data:image/png;base64,mockImageData"),
  };
}

export function setupCanvasMock(
  ctx: MockCanvas2DContext | null = null,
  options: { dataURL?: string } = {}
): MockCanvasElement {
  const mockCanvas = createMockCanvas(ctx, options);
  vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
    if (tagName === "canvas") {
      return mockCanvas as unknown as HTMLCanvasElement;
    }
    return document.createElement(tagName);
  });
  return mockCanvas;
}

export function setupCanvasMockWithVariableWidths(
  widthMap: Record<string, number>
): MockCanvasElement {
  const ctx = createMockCanvas2DContext();
  ctx.measureText = vi.fn().mockImplementation((text: string) => {
    // Check if any font key matches the current font setting
    for (const [fontKey, width] of Object.entries(widthMap)) {
      if (ctx.font.includes(fontKey)) {
        return { width };
      }
    }
    return { width: 100 }; // Default width
  });
  return setupCanvasMock(ctx);
}
