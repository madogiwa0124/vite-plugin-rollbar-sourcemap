import { Logger, buildLogger } from "../src/logger";

describe("Logger", () => {
  const consoleSpyLog = vi.spyOn(console, "log").mockImplementation(() => {});
  const consoleSpyError = vi.spyOn(console, "error").mockImplementation(() => {});

  afterEach(() => {
    consoleSpyLog.mockClear();
    consoleSpyError.mockClear();
  });

  it("should create a Logger instance with the correct properties", () => {
    const logger = buildLogger(true, false);
    expect(logger).toBeInstanceOf(Logger);
    expect(logger.silent).toBe(true);
    expect(logger.ignoreUploadErrors).toBe(false);
  });

  it("should log messages when silent is false", () => {
    const logger = buildLogger(false, false);
    logger.info("test message");
    expect(consoleSpyLog).toHaveBeenCalledWith("test message");
  });

  it("should not log messages when silent is true", () => {
    const logger = buildLogger(true, false);
    logger.info("test message");
    expect(consoleSpyLog).not.toHaveBeenCalled();
  });

  it("should handle upload errors when ignoreUploadErrors is false", () => {
    const logger = buildLogger(false, false);
    const testError = new Error("test");
    expect(() => logger.error("test error message", testError)).toThrowError("test");
    expect(consoleSpyError).toHaveBeenCalledWith("test error message");
  });

  it("should ignore upload errors when ignoreUploadErrors is true", () => {
    const logger = buildLogger(false, true);
    logger.error("test error message");
    expect(consoleSpyError).toHaveBeenCalledWith("test error message");
  });
});
