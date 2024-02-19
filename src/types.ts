const CONSTANT_TYPES = {
  Env: Symbol.for("Env"),
};

const CONTROLLER_TYPES = {
  PhotoController: Symbol.for("PhotoController"),
};

const SERVICE_TYPES = {
  EnvService: Symbol.for("EnvService"),
  GoogleStorageService: Symbol.for("GoogleStorageService"),
};

const TYPES = {
  ...CONSTANT_TYPES,
  ...CONTROLLER_TYPES,
  ...SERVICE_TYPES,
};

export { TYPES };
