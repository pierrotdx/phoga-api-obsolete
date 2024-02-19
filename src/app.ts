import "dotenv/config";
import express from "express";
import { appRouter } from "./routers/app.router.js";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import { singletons } from "./inversify.config.js";
import { EnvService } from "./services/env.service.js";
import { TYPES } from "./types.js";

const app = express();

app.use(helmet());

app.use(cors());

app.use(bodyParser.json());

app.use("/", appRouter);

const { HTTP_SERVER_PORT } = singletons.get<EnvService>(TYPES.EnvService);
app.listen(HTTP_SERVER_PORT, () => {
  console.log(`server listening on port ${HTTP_SERVER_PORT}`);
});
