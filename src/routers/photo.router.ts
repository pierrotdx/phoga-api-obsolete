import express from "express";

import { TYPES, singletons } from "../inversify/index.js";
import { PhotosController } from "../controllers/index.js";
import { errorCatchingWrapper } from "../middlewares/index.js";

export const photosRouter = express.Router();

const photosController = singletons.get<PhotosController>(
  TYPES.PhotosController
);

photosRouter.get("/metadata", errorCatchingWrapper(photosController.getPhotos));

photosRouter.get("/:id", errorCatchingWrapper(photosController.getPhoto));

photosRouter.get(
  "/:id/metadata",
  errorCatchingWrapper(photosController.getPhotoMetadata)
);
