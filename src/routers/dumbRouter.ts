import express from "express";
import { singletons } from "../inversify.config.js";
import { TYPES } from "../types.js";
import { DumbController } from "../controllers/index.js";

export const dumbRouter = express.Router();

const dumbController = singletons.get<DumbController>(TYPES.DumbController);

dumbRouter.use((req, res, next) => {
  console.log("going through dumb router");
  next();
});

dumbRouter.get("/", dumbController.home);
