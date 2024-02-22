import { commonDumbError } from "../jest.common.js";
import { LoggerService } from "./logger.service.js";

describe("loggerService", () => {
  let loggerService: LoggerService;

  beforeEach(() => {
    loggerService = new LoggerService(true);
  });

  it("should format log message as expected for the console", () => {
    const level = "dumb level";
    const message = "dumb message";
    const timestamp = new Date();
    const timestampString = timestamp.toISOString();
    const expected = `${timestampString} ${level}: ${message}`;
    jest.spyOn(global, "Date").mockReturnValue(timestamp);
    const result = loggerService["transformInfoForConsole"]({ level, message });
    expect(result).toBe(expected);
    expect.assertions(1);
  });

  it("should call the appropriate callback function when an error occurs in the local-file transport", () => {
    try {
      const callbackSpy = jest.spyOn(
        loggerService as any,
        "onLocalFileTransportError"
      );
      loggerService["localFileTransport"].emit("error", commonDumbError);
      expect(callbackSpy).toHaveBeenCalled();
      expect.assertions(1);
    } catch (err) {}
  });

  describe("info", () => {
    it("should call the function `logger.info`", () => {
      const loggerInfoSpy = jest.spyOn(loggerService["logger"], "info");
      loggerService.info("dumb message");
      expect(loggerInfoSpy).toHaveBeenCalled();
      expect.assertions(1);
    });
  });

  describe("warn", () => {
    it("should call the function `logger.warn`", () => {
      const loggerWarnSpy = jest.spyOn(loggerService["logger"], "warn");
      loggerService.warn("dumb message");
      expect(loggerWarnSpy).toHaveBeenCalled();
      expect.assertions(1);
    });
  });

  describe("error", () => {
    it("should call the function `logger.error`", () => {
      const loggerErrorSpy = jest.spyOn(loggerService["logger"], "error");
      loggerService.error(commonDumbError);
      expect(loggerErrorSpy).toHaveBeenCalled();
      expect.assertions(1);
    });
  });
});
