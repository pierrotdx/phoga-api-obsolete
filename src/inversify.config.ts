import "reflect-metadata";
import "dotenv/config";

import { Container, ContainerModule } from "inversify";
import { TYPES } from "./types.js";
import { PhotoController } from "./controllers/index.js";
import {
  EnvService,
  GCStorageService,
  LoggerService,
} from "./services/index.js";
import {
  CloudStorageInterface,
  EnvInterface,
  LoggerInterface,
} from "./models/index.js";

export const constantsContainerModule = new ContainerModule((bind) => {
  bind<NodeJS.ProcessEnv>(TYPES.Env).toConstantValue(process.env);
});

export const controllersContainerModule = new ContainerModule((bind) => {
  bind<PhotoController>(TYPES.PhotoController).to(PhotoController);
});

export const servicesContainerModule = new ContainerModule((bind) => {
  bind<CloudStorageInterface>(TYPES.GoogleStorageService).to(GCStorageService);
  bind<EnvInterface>(TYPES.EnvService).to(EnvService);
  bind<LoggerInterface>(TYPES.LoggerService).to(LoggerService);
});

// https://github.com/inversify/InversifyJS/blob/master/wiki/recipes.md#overriding-bindings-on-unit-tests
export const singletons = new Container();
singletons.load(
  constantsContainerModule,
  controllersContainerModule,
  servicesContainerModule
);
