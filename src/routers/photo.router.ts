import express from "express";

import { TYPES, singletons } from "../inversify/index.js";
import { PhotoController } from "../controllers/index.js";
import { errorCatchingWrapper } from "../middlewares/index.js";

export const photoRouter = express.Router();

const photoController = singletons.get<PhotoController>(TYPES.PhotoController);

photoRouter.get("/:name", errorCatchingWrapper(photoController.getPhoto));

photoRouter.put("/", errorCatchingWrapper(photoController.createPhoto));
