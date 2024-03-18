import express from "express";
import { adminPhotoRouter } from "./admin.photo.router.js";

export const restrictedRouter = express.Router();

restrictedRouter.use("/photo", adminPhotoRouter);
