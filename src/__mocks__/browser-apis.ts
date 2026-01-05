import { vi } from "vitest";

// Mock screen object
Object.defineProperty(globalThis, "screen", {
  value: {
    width: 1920,
    height: 1080,
    colorDepth: 24,
    pixelDepth: 24,
  },
  writable: true,
  configurable: true,
});

// Mock window.devicePixelRatio
Object.defineProperty(window, "devicePixelRatio", {
  value: 2,
  writable: true,
  configurable: true,
});

// Mock navigator properties
const mockPlugins = [
  { name: "Chrome PDF Plugin", filename: "internal-pdf-viewer" },
  { name: "Chrome PDF Viewer", filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai" },
];

const mockMimeTypes = [
  { type: "application/pdf" },
  { type: "text/plain" },
];

Object.defineProperty(navigator, "platform", {
  value: "MacIntel",
  writable: true,
  configurable: true,
});

Object.defineProperty(navigator, "hardwareConcurrency", {
  value: 8,
  writable: true,
  configurable: true,
});

Object.defineProperty(navigator, "deviceMemory", {
  value: 16,
  writable: true,
  configurable: true,
});

Object.defineProperty(navigator, "maxTouchPoints", {
  value: 0,
  writable: true,
  configurable: true,
});

Object.defineProperty(navigator, "cookieEnabled", {
  value: true,
  writable: true,
  configurable: true,
});

Object.defineProperty(navigator, "doNotTrack", {
  value: "1",
  writable: true,
  configurable: true,
});

Object.defineProperty(navigator, "language", {
  value: "en-US",
  writable: true,
  configurable: true,
});

Object.defineProperty(navigator, "languages", {
  value: ["en-US", "en"],
  writable: true,
  configurable: true,
});

Object.defineProperty(navigator, "vendor", {
  value: "Google Inc.",
  writable: true,
  configurable: true,
});

Object.defineProperty(navigator, "plugins", {
  value: {
    length: mockPlugins.length,
    item: (i: number) => mockPlugins[i],
    [Symbol.iterator]: function* () {
      for (const plugin of mockPlugins) {
        yield plugin;
      }
    },
    ...mockPlugins.reduce(
      (acc, plugin, i) => {
        acc[i] = plugin;
        return acc;
      },
      {} as Record<number, (typeof mockPlugins)[0]>
    ),
  },
  writable: true,
  configurable: true,
});

Object.defineProperty(navigator, "mimeTypes", {
  value: {
    length: mockMimeTypes.length,
    item: (i: number) => mockMimeTypes[i],
    [Symbol.iterator]: function* () {
      for (const type of mockMimeTypes) {
        yield type;
      }
    },
    ...mockMimeTypes.reduce(
      (acc, type, i) => {
        acc[i] = type;
        return acc;
      },
      {} as Record<number, (typeof mockMimeTypes)[0]>
    ),
  },
  writable: true,
  configurable: true,
});

// Mock crypto.subtle for sha256
const mockCrypto = {
  subtle: {
    digest: vi.fn().mockImplementation(async (_algorithm: string, data: ArrayBuffer) => {
      // Simple mock hash based on input length and first bytes
      const view = new Uint8Array(data);
      const result = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        result[i] = (view[i % view.length] || 0) ^ (i * 17);
      }
      return result.buffer;
    }),
  },
  getRandomValues: vi.fn((arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }),
};

Object.defineProperty(globalThis, "crypto", {
  value: mockCrypto,
  writable: true,
  configurable: true,
});

// Mock Intl.DateTimeFormat
const originalDateTimeFormat = Intl.DateTimeFormat;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(vi.spyOn(Intl, "DateTimeFormat") as any).mockImplementation(
  (...args: ConstructorParameters<typeof Intl.DateTimeFormat>) => {
    const instance = new originalDateTimeFormat(...args);
    return {
      ...instance,
      resolvedOptions: () => ({
        ...instance.resolvedOptions(),
        timeZone: "America/New_York",
      }),
    } as Intl.DateTimeFormat;
  }
);

// Mock indexedDB
Object.defineProperty(window, "indexedDB", {
  value: {
    open: vi.fn(),
  },
  writable: true,
  configurable: true,
});

// Export mock reset utilities
export function resetScreenMock(overrides: Partial<typeof screen> = {}) {
  Object.assign(screen, {
    width: 1920,
    height: 1080,
    colorDepth: 24,
    pixelDepth: 24,
    ...overrides,
  });
}

export function resetNavigatorMock(
  overrides: Partial<{
    platform: string;
    hardwareConcurrency: number;
    deviceMemory: number | undefined;
    maxTouchPoints: number;
    cookieEnabled: boolean;
    doNotTrack: string | null;
    language: string;
    languages: readonly string[];
    vendor: string;
  }> = {}
) {
  const defaults = {
    platform: "MacIntel",
    hardwareConcurrency: 8,
    deviceMemory: 16,
    maxTouchPoints: 0,
    cookieEnabled: true,
    doNotTrack: "1",
    language: "en-US",
    languages: ["en-US", "en"],
    vendor: "Google Inc.",
  };
  const values = { ...defaults, ...overrides };

  Object.defineProperty(navigator, "platform", { value: values.platform, writable: true, configurable: true });
  Object.defineProperty(navigator, "hardwareConcurrency", { value: values.hardwareConcurrency, writable: true, configurable: true });
  Object.defineProperty(navigator, "deviceMemory", { value: values.deviceMemory, writable: true, configurable: true });
  Object.defineProperty(navigator, "maxTouchPoints", { value: values.maxTouchPoints, writable: true, configurable: true });
  Object.defineProperty(navigator, "cookieEnabled", { value: values.cookieEnabled, writable: true, configurable: true });
  Object.defineProperty(navigator, "doNotTrack", { value: values.doNotTrack, writable: true, configurable: true });
  Object.defineProperty(navigator, "language", { value: values.language, writable: true, configurable: true });
  Object.defineProperty(navigator, "languages", { value: values.languages, writable: true, configurable: true });
  Object.defineProperty(navigator, "vendor", { value: values.vendor, writable: true, configurable: true });
}
