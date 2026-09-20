import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SomniaError } from "../../../src/errors/index";
import { isRetryable, withRetry } from "../../../src/utils/retry";

describe("utils/retry", () => {
  describe("isRetryable", () => {
    it("should return true for SomniaError with retryable flag", () => {
      const err = new SomniaError("test", { code: "TEST", retryable: true });
      expect(isRetryable(err)).toBe(true);
    });

    it("should return false for SomniaError without retryable flag", () => {
      const err = new SomniaError("test", { code: "TEST", retryable: false });
      expect(isRetryable(err)).toBe(false);
    });

    it("should return true for network-level errors", () => {
      expect(isRetryable(new Error("ECONNRESET"))).toBe(true);
      expect(isRetryable(new Error("ECONNREFUSED"))).toBe(true);
      expect(isRetryable(new Error("ETIMEDOUT"))).toBe(true);
      expect(isRetryable(new Error("socket hang up"))).toBe(true);
      expect(isRetryable(new Error("fetch failed"))).toBe(true);
      expect(isRetryable(new Error("503 Service Unavailable"))).toBe(true);
    });

    it("should return false for non-retryable errors", () => {
      expect(isRetryable(new Error("syntax error"))).toBe(false);
    });

    it("should return false for non-Error values", () => {
      expect(isRetryable("string error")).toBe(false);
    });
  });

  describe("withRetry", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return value on first successful call", async () => {
      const fn = vi.fn().mockResolvedValue("success");
      const result = await withRetry(fn, { maxRetries: 3 });
      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should throw immediately for non-retryable errors", async () => {
      const err = new Error("syntax error");
      const fn = vi.fn().mockRejectedValue(err);
      await expect(withRetry(fn, { maxRetries: 3 })).rejects.toThrow("syntax error");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should throw after max retries for retryable errors", async () => {
      const err = new Error("ECONNRESET");
      const fn = vi.fn().mockRejectedValue(err);

      vi.useRealTimers();
      await expect(
        withRetry(fn, { maxRetries: 2, initialDelayMs: 1, maxDelayMs: 5 }),
      ).rejects.toThrow("ECONNRESET");
      expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
      vi.useFakeTimers();
    });

    it("should cancel on abort signal", async () => {
      const controller = new AbortController();
      controller.abort();

      const fn = vi.fn().mockResolvedValue("never");

      await expect(withRetry(fn, { signal: controller.signal })).rejects.toThrow("cancelled");

      expect(fn).not.toHaveBeenCalled();
    });
  });
});
