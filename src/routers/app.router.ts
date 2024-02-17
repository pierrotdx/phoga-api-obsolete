import express, { NextFunction, Request, Response } from "express";
import { photoRouter } from "./photo.router.js";

export const appRouter = express.Router();

appRouter.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[incoming]: ${req.method} ${req.url}`);
  next();
});

appRouter.get("/", (req, res) => {
  res.send("Welcome to your app!");
});

appRouter.use("/photo", photoRouter);
