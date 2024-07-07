import express from "express";

import { errorCatchingWrapper } from "../../middlewares/index.js";
import { singletons } from "../../inversify/inversify.config.js";
import { TYPES } from "../../inversify/types.js";
import { AdminPhotosController } from "../../controllers/admin/admin.photos.controller.js";

export const adminPhotosRouter = express.Router();

const adminPhotosController = singletons.get<AdminPhotosController>(
  TYPES.AdminPhotosController
);

adminPhotosRouter.put(
  "/",
  errorCatchingWrapper(adminPhotosController.createPhoto)
);

adminPhotosRouter.patch(
  "/:id",
  errorCatchingWrapper(adminPhotosController.patchPhoto)
);

adminPhotosRouter.delete(
  "/:id",
  errorCatchingWrapper(adminPhotosController.deletePhoto)
);
