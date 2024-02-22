import { injectable } from "inversify";
import winston, { format } from "winston";
import "winston-daily-rotate-file";
import { LogData, LoggerInterface } from "../models/logger.model.js";

@injectable()
export class LoggerService implements LoggerInterface {
  private readonly logger: winston.Logger;

  private readonly consoleFormat = format.combine(
    format.colorize(),
    format.printf(({ level, message }) => {
      const timestamp = new Date().toISOString();
      return `${timestamp} ${level}: ${message}`;
    })
  );
  private readonly consoleTransport = new winston.transports.Console();

  private readonly fileFormat = format.combine(
    format.timestamp(),
    format.json()
  );
  private readonly rotatingLocalFileTransport =
    new winston.transports.DailyRotateFile({
      filename: "photo-gallery-public-api-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
    });

  constructor() {
    this.logger = winston.createLogger();

    this.consoleTransport.format = this.consoleFormat;

    this.rotatingLocalFileTransport.format = this.fileFormat;
    this.rotatingLocalFileTransport.on("error", (err) => {
      console.error("rotatingLocalFileTransport error", err);
    });

    this.logger.add(this.consoleTransport);
    this.logger.add(this.rotatingLocalFileTransport);
  }

  info = (message: string, meta?: LogData) => this.logger.info(message, meta);

  warn = (message: string, meta?: LogData) => this.logger.warn(message, meta);

  error = (err: Error) => this.logger.error(err.stack);
}
