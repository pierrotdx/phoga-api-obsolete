import express from "express";
import { dumbRouter } from "./dumbRouter.js";

export const appRouter = express.Router();

appRouter.get("/", (req, res) => {
  res.send("Welcome to your app!");
});

appRouter.use("/dumbRoute", dumbRouter);
