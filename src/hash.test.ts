import { describe, it, expect, vi, beforeEach } from "vitest";
import { hash, sha256 } from "./hash";

describe("hash", () => {
  describe("hash()", () => {
    it("returns consistent results for same input", () => {
      const input = "test string";
      const result1 = hash(input);
      const result2 = hash(input);
      expect(result1).toBe(result2);
    });

    it("returns different results for different inputs", () => {
      const result1 = hash("input1");
      const result2 = hash("input2");
      expect(result1).not.toBe(result2);
    });

    it("handles empty string", () => {
      const result = hash("");
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("handles unicode characters", () => {
      const result = hash("Hello 世界 🌍 émoji");
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("handles very long strings", () => {
      const longString = "a".repeat(10000);
      const result = hash(longString);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("returns base36 encoded string", () => {
      const result = hash("test");
      // Base36 only contains digits and lowercase letters
      expect(result).toMatch(/^[0-9a-z]+$/);
    });

    it("produces different hashes for similar inputs", () => {
      const result1 = hash("abc");
      const result2 = hash("abd");
      expect(result1).not.toBe(result2);
    });
  });

  describe("sha256()", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("returns 64-char hex string", async () => {
      const result = await sha256("test");
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBe(64);
      expect(result).toMatch(/^[0-9a-f]+$/);
    });

    it("returns consistent results for same input", async () => {
      const input = "consistent input";
      const result1 = await sha256(input);
      const result2 = await sha256(input);
      expect(result1).toBe(result2);
    });

    it("handles empty string", async () => {
      const result = await sha256("");
      expect(result).toBeDefined();
      expect(result.length).toBe(64);
    });

    it("handles unicode characters", async () => {
      const result = await sha256("Hello 世界 🌍");
      expect(result).toBeDefined();
      expect(result.length).toBe(64);
    });

    it("produces different hashes for different inputs", async () => {
      const result1 = await sha256("input1");
      const result2 = await sha256("input2");
      expect(result1).not.toBe(result2);
    });

    it("uses TextEncoder to encode input", async () => {
      const encodeSpy = vi.spyOn(TextEncoder.prototype, "encode");
      await sha256("test input");
      expect(encodeSpy).toHaveBeenCalledWith("test input");
    });

    it("calls crypto.subtle.digest with SHA-256", async () => {
      const digestSpy = vi.spyOn(crypto.subtle, "digest");
      await sha256("test");
      expect(digestSpy).toHaveBeenCalled();
      const [algorithm, data] = digestSpy.mock.calls[0];
      expect(algorithm).toBe("SHA-256");
      // Check it's a typed array with the right data (jsdom has different Uint8Array class)
      expect(ArrayBuffer.isView(data)).toBe(true);
      expect(data.length).toBe(4); // "test" is 4 bytes
    });
  });
});
