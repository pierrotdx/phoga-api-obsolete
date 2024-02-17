import "dotenv/config";
import express from "express";
import { HTTP_SERVER_PORT } from "./models/env.model.js";
import { appRouter } from "./routers/app.router.js";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";

const app = express();

app.use(helmet());

app.use(cors());

app.use(bodyParser.json());

app.use("/", appRouter);

app.listen(HTTP_SERVER_PORT, () => {
  console.log(`server listening on port ${HTTP_SERVER_PORT}`);
});
