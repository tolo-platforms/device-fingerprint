import { describe, it, expect, beforeEach, vi } from "vitest";
import { collectStorageSignals } from "./storage";

describe("collectStorageSignals", () => {
  let originalSessionStorage: Storage;
  let originalLocalStorage: Storage;

  beforeEach(() => {
    vi.clearAllMocks();
    // Save original storage objects
    originalSessionStorage = window.sessionStorage;
    originalLocalStorage = window.localStorage;

    // Reset indexedDB
    Object.defineProperty(window, "indexedDB", {
      value: { open: vi.fn() },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore original storage objects
    Object.defineProperty(window, "sessionStorage", {
      value: originalSessionStorage,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "localStorage", {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
  });

  it("returns all storage booleans", () => {
    const result = collectStorageSignals();
    expect(result).toHaveProperty("sessionStorage");
    expect(result).toHaveProperty("localStorage");
    expect(result).toHaveProperty("indexedDB");
  });

  it("returns true for available sessionStorage", () => {
    const result = collectStorageSignals();
    expect(result.sessionStorage).toBe(true);
  });

  it("returns true for available localStorage", () => {
    const result = collectStorageSignals();
    expect(result.localStorage).toBe(true);
  });

  it("returns true when indexedDB exists", () => {
    const result = collectStorageSignals();
    expect(result.indexedDB).toBe(true);
  });

  it("returns false when sessionStorage throws", () => {
    Object.defineProperty(window, "sessionStorage", {
      get() {
        throw new Error("SecurityError");
      },
      configurable: true,
    });
    const result = collectStorageSignals();
    expect(result.sessionStorage).toBe(false);
  });

  it("returns false when localStorage throws", () => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("SecurityError");
      },
      configurable: true,
    });
    const result = collectStorageSignals();
    expect(result.localStorage).toBe(false);
  });

  it("returns false when indexedDB undefined", () => {
    Object.defineProperty(window, "indexedDB", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const result = collectStorageSignals();
    expect(result.indexedDB).toBe(false);
  });

  it("handles QuotaExceededError for sessionStorage", () => {
    const mockStorage = {
      setItem: vi.fn().mockImplementation(() => {
        throw new DOMException("QuotaExceededError");
      }),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, "sessionStorage", {
      value: mockStorage,
      writable: true,
      configurable: true,
    });
    const result = collectStorageSignals();
    expect(result.sessionStorage).toBe(false);
  });

  it("handles QuotaExceededError for localStorage", () => {
    const mockStorage = {
      setItem: vi.fn().mockImplementation(() => {
        throw new DOMException("QuotaExceededError");
      }),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: mockStorage,
      writable: true,
      configurable: true,
    });
    const result = collectStorageSignals();
    expect(result.localStorage).toBe(false);
  });

  it("handles indexedDB throwing on access", () => {
    Object.defineProperty(window, "indexedDB", {
      get() {
        throw new Error("Access denied");
      },
      configurable: true,
    });
    const result = collectStorageSignals();
    expect(result.indexedDB).toBe(false);
  });
});
