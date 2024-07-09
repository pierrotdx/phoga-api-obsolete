import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { claimCheck } from "express-oauth2-jwt-bearer";
import { Permission } from "../../models/permission.model.js";
import { adminPhotosRouter } from "./admin.photo.router.js";
import { singletons } from "../../inversify/inversify.config.js";
import { AuthService } from "../../services/auth.service.js";
import { TYPES } from "../../inversify/types.js";

const authService = singletons.get<AuthService>(TYPES.AuthService);

export const adminRouter = express.Router();

adminRouter.use(authMiddleware);
adminRouter.use(
  claimCheck(authService.includesAnyPermission(Permission.Restricted.Read))
);

const editPhotoPermissions = [
  Permission.Restricted.Write,
  Permission.Photos.Write,
];
adminRouter.use(
  "/photos",
  claimCheck(authService.includesAnyPermission(...editPhotoPermissions)),
  adminPhotosRouter
);
