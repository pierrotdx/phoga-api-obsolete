import express from "express";
import { errorCatchingWrapper } from "../../middlewares/index.js";
import { TYPES, singletons } from "../../inversify/index.js";
import { PhotoController } from "../../controllers/index.js";

export const adminPhotoRouter = express.Router();

const photoController = singletons.get<PhotoController>(TYPES.PhotoController);

adminPhotoRouter.put("/", errorCatchingWrapper(photoController.createPhoto));
