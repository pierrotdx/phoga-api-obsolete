import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types.js";
import { DumbController } from "./controllers/index.js";
import { GCStorageService } from "./services/index.js";

const singletons = new Container();
singletons.bind<DumbController>(TYPES.DumbController).to(DumbController);

singletons
  .bind<GCStorageService>(TYPES.GoogleStorageService)
  .to(GCStorageService);

export { singletons };
