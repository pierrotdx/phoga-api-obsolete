import "dotenv/config";
import { singletons } from "./inversify.config.js";
import { TYPES } from "./types.js";
import express from "express";
import { DumbAService, DumbBService } from "./services/index.js";
import { HTTP_SERVER_PORT } from "./models/env.model.js";

const app = express();
const dumbAService = singletons.get<DumbAService>(TYPES.DumbAService);
dumbAService.log();
const dumbBService = singletons.get<DumbBService>(TYPES.DumbBService);
dumbBService.log();

app.get("/", (req, res) => {
  res.send("Welcome to your app!");
});

app.listen(HTTP_SERVER_PORT, () => {
  console.log(`server listening on port ${HTTP_SERVER_PORT}`);
});
