const CONSTANT_TYPES = {
  Env: Symbol.for("Env"),
};

const CONTROLLER_TYPES = {
  PhotosController: Symbol.for("PhotosController"),
};

const SERVICE_TYPES = {
  EnvService: Symbol.for("EnvService"),
  GcStorageService: Symbol.for("GcStorageService"),
  LoggerService: Symbol.for("LoggerService"),
  MongoDbService: Symbol.for("MongoDbService"),
  PhotosService: Symbol.for("PhotosService"),
};

const TYPES = {
  ...CONSTANT_TYPES,
  ...CONTROLLER_TYPES,
  ...SERVICE_TYPES,
};

export { TYPES };
