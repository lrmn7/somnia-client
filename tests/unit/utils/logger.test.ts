import { describe, expect, it, vi } from "vitest";
import { consoleLogger, noopLogger } from "../../../src/utils/logger";

describe("utils/logger", () => {
  describe("noopLogger", () => {
    it("safely handles all log methods without throwing or outputting", () => {
      expect(() => {
        noopLogger.debug("debug message");
        noopLogger.info("info message", { detail: 1 });
        noopLogger.warn("warning message");
        noopLogger.error("error message", new Error("test"));
      }).not.toThrow();
    });
  });

  describe("consoleLogger", () => {
    it("calls underlying console methods prefixed with [somnia-client]", () => {
      const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
      const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      consoleLogger.debug("test-debug", 123);
      expect(debugSpy).toHaveBeenCalledWith("[somnia-client] test-debug", 123);

      consoleLogger.info("test-info");
      expect(infoSpy).toHaveBeenCalledWith("[somnia-client] test-info");

      consoleLogger.warn("test-warn");
      expect(warnSpy).toHaveBeenCalledWith("[somnia-client] test-warn");

      consoleLogger.error("test-error");
      expect(errorSpy).toHaveBeenCalledWith("[somnia-client] test-error");

      debugSpy.mockRestore();
      infoSpy.mockRestore();
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });
});
