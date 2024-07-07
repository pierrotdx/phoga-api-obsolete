const CONSTANT_TYPES = {
  Env: Symbol.for("Env"),
};

const ADMIN_CONTROLLER_TYPES = {
  AdminPhotosController: Symbol.for("AdminPhotosController"),
};

const CONTROLLER_TYPES = {
  PhotosController: Symbol.for("PhotosController"),
};

const SERVICE_TYPES = {
  AuthService: Symbol.for("AuthService"),
  EnvService: Symbol.for("EnvService"),
  GcStorageService: Symbol.for("GcStorageService"),
  LoggerService: Symbol.for("LoggerService"),
  MongoDbService: Symbol.for("MongoDbService"),
  PhotosService: Symbol.for("PhotosService"),
  EditPhotoService: Symbol.for("EditPhotoService"),
};

const TYPES = {
  ...CONSTANT_TYPES,
  ...ADMIN_CONTROLLER_TYPES,
  ...CONTROLLER_TYPES,
  ...SERVICE_TYPES,
};

export { TYPES };
