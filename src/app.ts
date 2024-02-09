import "dotenv/config";
import express from "express";
import { HTTP_SERVER_PORT } from "./models/env.model.js";
import { appRouter } from "./routers/appRouter.js";
import { singletons } from "./inversify.config.js";
import { GCStorageService } from "./services/index.js";
import { TYPES } from "./types.js";

const app = express();

const googleStorageService = singletons.get<GCStorageService>(
  TYPES.GoogleStorageService
);

app.use("/", appRouter);

app.listen(HTTP_SERVER_PORT, () => {
  console.log(`server listening on port ${HTTP_SERVER_PORT}`);
});
