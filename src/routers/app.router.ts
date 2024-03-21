import express, { NextFunction, Request, Response } from "express";
import { photosRouter } from "./photo.router.js";
import { LoggerInterface } from "../models/logger.model.js";
import { TYPES, singletons } from "../inversify/index.js";
import { errorCatchingWrapper } from "../middlewares/index.js";

const loggerService = singletons.get<LoggerInterface>(TYPES.LoggerService);

export const appRouter = express.Router();

appRouter.use((req: Request, res: Response, next: NextFunction) => {
  loggerService.info(`[incoming]: HTTP ${req.method} ${req.url}`);
  next();
});

appRouter.get(
  "/",
  errorCatchingWrapper((req, res) => {
    res.send("Welcome to your app!");
  })
);

appRouter.use("/photos", photosRouter);
