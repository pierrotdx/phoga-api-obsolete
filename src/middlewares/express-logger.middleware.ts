import expressWinston from "express-winston";
import { LoggerService } from "../services/index.js";
import { TYPES, singletons } from "../inversify/index.js";

const loggerService = singletons.get<LoggerService>(TYPES.LoggerService);

export const getExpressLoggerMiddleware = () => {
  expressWinston.requestWhitelist.push("body");
  expressWinston.responseWhitelist.push("body");
  const expressLoggerMiddleware = expressWinston.logger({
    transports: [
      loggerService.consoleTransport,
      loggerService.localFileTransport,
    ],
    meta: true,
    msg: "HTTP {{req.method}} {{res.statusCode}} {{ res.responseTime }}ms {{req.url}}",
    statusLevels: true,
    bodyBlacklist: ["password"],
  });
  return expressLoggerMiddleware;
};
