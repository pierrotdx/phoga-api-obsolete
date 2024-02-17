import express from "express";

import { singletons } from "../inversify.config.js";
import { TYPES } from "../types.js";
import { PhotoController } from "../controllers/index.js";

export const photoRouter = express.Router();

const photoController = singletons.get<PhotoController>(TYPES.PhotoController);

photoRouter.get("/:name", photoController.getPhoto);

photoRouter.put("/", photoController.createPhoto);
