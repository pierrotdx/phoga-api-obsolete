import "dotenv/config";
import express from "express";
import { appRouter } from "./routers/app.router.js";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import { TYPES, singletons } from "./inversify/index.js";
import { EnvInterface } from "./models/env.model.js";
import { getExpressLoggerMiddleware } from "./middlewares/index.js";

const { HTTP_SERVER_PORT } = singletons.get<EnvInterface>(TYPES.EnvService);

const app = express();

app.use(helmet());

app.use(cors());

app.use(bodyParser.json());

app.use(getExpressLoggerMiddleware());

app.use("/", appRouter);

app.listen(HTTP_SERVER_PORT, () => {
  console.log(`server listening on port ${HTTP_SERVER_PORT}`);
});
