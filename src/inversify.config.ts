import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types.js";
import { PhotoController } from "./controllers/index.js";
import { GCStorageService } from "./services/index.js";
import { CloudStorageInterface } from "./models/index.js";

const singletons = new Container();
singletons.bind<PhotoController>(TYPES.PhotoController).to(PhotoController);

singletons
  .bind<CloudStorageInterface>(TYPES.GoogleStorageService)
  .to(GCStorageService);
export { singletons };
