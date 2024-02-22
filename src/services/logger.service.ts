import { injectable } from "inversify";
import winston, { format, Logform } from "winston";
import "winston-daily-rotate-file";
import { LogData, LoggerInterface } from "../models/logger.model.js";

@injectable()
export class LoggerService implements LoggerInterface {
  private readonly logger: winston.Logger;

  private readonly consoleTransport: winston.transport;
  private readonly localFileTransport: winston.transport;

  constructor(silent = false) {
    this.logger = winston.createLogger();

    this.consoleTransport = this.getConsoleTransport();
    this.logger.add(this.consoleTransport);

    this.localFileTransport = this.getLocalFileTransport();
    this.logger.add(this.localFileTransport);

    this.logger.silent = silent;
  }

  info = (message: string, meta?: LogData) => {
    this.logger.info(message, meta);
  };

  warn = (message: string, meta?: LogData) => {
    this.logger.warn(message, meta);
  };

  error = (err: Error) => {
    this.logger.error(err.stack);
  };

  private readonly onLocalFileTransportError = (err: Error) => {
    console.error("localFileTransport error", err);
  };

  private readonly getConsoleTransport = () => {
    const consoleTransport = new winston.transports.Console();
    const consoleFormat = format.combine(
      format.colorize(),
      format.printf(this.transformInfoForConsole)
    );
    consoleTransport.format = consoleFormat;
    return consoleTransport;
  };

  private transformInfoForConsole = ({
    level,
    message,
  }: Logform.TransformableInfo): string => {
    const timestamp = new Date().toISOString();
    return `${timestamp} ${level}: ${message}`;
  };

  private readonly getLocalFileTransport = () => {
    const localFileTransport = new winston.transports.DailyRotateFile({
      filename: "photo-gallery-public-api-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
    });
    const localFileFormat = format.combine(format.timestamp(), format.json());
    localFileTransport.format = localFileFormat;
    localFileTransport.on("error", this.onLocalFileTransportError);
    return localFileTransport;
  };
}
