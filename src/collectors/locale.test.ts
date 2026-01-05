import { describe, it, expect, beforeEach, vi } from "vitest";
import { collectLocaleSignals } from "./locale";
import { resetNavigatorMock } from "../__mocks__/browser-apis";

describe("collectLocaleSignals", () => {
  beforeEach(() => {
    resetNavigatorMock();
    vi.clearAllMocks();
  });

  it("returns timezone", () => {
    const result = collectLocaleSignals();
    expect(result.timezone).toBe("America/New_York");
  });

  it("returns timezoneOffset", () => {
    const result = collectLocaleSignals();
    expect(typeof result.timezoneOffset).toBe("number");
  });

  it("returns language", () => {
    const result = collectLocaleSignals();
    expect(result.language).toBe("en-US");
  });

  it("returns languages array", () => {
    const result = collectLocaleSignals();
    expect(result.languages).toEqual(["en-US", "en"]);
  });

  it("handles different languages", () => {
    resetNavigatorMock({ language: "fr-FR", languages: ["fr-FR", "fr", "en"] });
    const result = collectLocaleSignals();
    expect(result.language).toBe("fr-FR");
    expect(result.languages).toEqual(["fr-FR", "fr", "en"]);
  });

  it("falls back to single language array when languages unavailable", () => {
    Object.defineProperty(navigator, "languages", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const result = collectLocaleSignals();
    expect(result.languages).toEqual(["en-US"]);
  });

  it("returns unknown for missing language", () => {
    Object.defineProperty(navigator, "language", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const result = collectLocaleSignals();
    expect(result.language).toBe("unknown");
  });

  it("returns all expected properties", () => {
    const result = collectLocaleSignals();
    expect(result).toHaveProperty("timezone");
    expect(result).toHaveProperty("timezoneOffset");
    expect(result).toHaveProperty("language");
    expect(result).toHaveProperty("languages");
  });

  it("handles various locale formats", () => {
    resetNavigatorMock({ language: "zh-CN", languages: ["zh-CN", "zh"] });
    const result = collectLocaleSignals();
    expect(result.language).toBe("zh-CN");
  });
});
