import express, { NextFunction, Request, Response } from "express";
import { photoRouter } from "./photo.router.js";
import { LoggerInterface } from "../models/logger.model.js";
import { TYPES, singletons } from "../inversify/index.js";
import { errorCatchingWrapper } from "../middlewares/index.js";
import { restrictedRouter } from "./restricted/index.js";
import { authRouter } from "./auth.router.js";

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

const onAuth0Login = (req: Request, res: Response, next: NextFunction) => {
  console.log("--------------------------------> req", req);
  res.send(`login callback!`);
};

appRouter.post(
  "/logoutCallback",
  errorCatchingWrapper((req, res) => {
    res.send("logout callback!");
  })
);

// public routes
appRouter.use("/photo", photoRouter);

appRouter.use(authRouter);
// private routes
appRouter.post("/loginCallback", errorCatchingWrapper(onAuth0Login));
appRouter.use("/restricted", restrictedRouter);
