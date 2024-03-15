import "reflect-metadata";
import "dotenv/config";

import { Container, ContainerModule } from "inversify";
import { TYPES } from "./types.js";
import { PhotoController } from "../controllers/index.js";
import {
  EnvService,
  GcStorageService,
  LoggerService,
  MongoDbService,
} from "../services/index.js";
import {
  CloudStorageInterface,
  DbInterface,
  EnvInterface,
  LoggerInterface,
} from "../models/index.js";

export const constantsContainerModule = new ContainerModule((bind) => {
  bind<NodeJS.ProcessEnv>(TYPES.Env).toConstantValue(process.env);
});

export const controllersContainerModule = new ContainerModule((bind) => {
  bind<PhotoController>(TYPES.PhotoController)
    .to(PhotoController)
    .inSingletonScope();
});

export const servicesContainerModule = new ContainerModule((bind) => {
  bind<CloudStorageInterface>(TYPES.GcStorageService)
    .to(GcStorageService)
    .inSingletonScope();
  bind<EnvInterface>(TYPES.EnvService).to(EnvService).inSingletonScope();
  bind<LoggerInterface>(TYPES.LoggerService)
    .to(LoggerService)
    .inSingletonScope();
  bind<DbInterface>(TYPES.MongoDbService).to(MongoDbService).inSingletonScope();
});

// https://github.com/inversify/InversifyJS/blob/master/wiki/recipes.md#overriding-bindings-on-unit-tests
export const singletons = new Container();
singletons.load(
  constantsContainerModule,
  controllersContainerModule,
  servicesContainerModule
);
