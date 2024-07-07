import "reflect-metadata";
import "dotenv/config";

import { Container, ContainerModule } from "inversify";
import { TYPES } from "./types.js";
import { PhotosController } from "../controllers/index.js";
import {
  EnvService,
  GcStorageService,
  LoggerService,
  MongoDbService,
  EditPhotoService,
  AuthService,
} from "../services/index.js";
import {
  CloudStorageInterface,
  DbInterface,
  EnvInterface,
  LoggerInterface,
} from "../models/index.js";
import { PhotosService } from "../services/photos.service.js";
import { AdminPhotosController } from "../controllers/admin/index.js";

export const constantsContainerModule = new ContainerModule((bind) => {
  bind<NodeJS.ProcessEnv>(TYPES.Env).toConstantValue(process.env);
});

export const adminControllersContainerModule = new ContainerModule((bind) => {
  bind<AdminPhotosController>(TYPES.AdminPhotosController)
    .to(AdminPhotosController)
    .inSingletonScope();
});

export const controllersContainerModule = new ContainerModule((bind) => {
  bind<PhotosController>(TYPES.PhotosController)
    .to(PhotosController)
    .inSingletonScope();
});

export const servicesContainerModule = new ContainerModule((bind) => {
  bind<AuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
  bind<CloudStorageInterface>(TYPES.GcStorageService)
    .to(GcStorageService)
    .inSingletonScope();
  bind<EnvInterface>(TYPES.EnvService).to(EnvService).inSingletonScope();
  bind<LoggerInterface>(TYPES.LoggerService)
    .to(LoggerService)
    .inSingletonScope();
  bind<DbInterface>(TYPES.MongoDbService).to(MongoDbService).inSingletonScope();
  bind<PhotosService>(TYPES.PhotosService).to(PhotosService).inSingletonScope();
  bind<EditPhotoService>(TYPES.EditPhotoService)
    .to(EditPhotoService)
    .inSingletonScope();
});

// https://github.com/inversify/InversifyJS/blob/master/wiki/recipes.md#overriding-bindings-on-unit-tests
export const singletons = new Container();
singletons.load(
  adminControllersContainerModule,
  constantsContainerModule,
  controllersContainerModule,
  servicesContainerModule
);
