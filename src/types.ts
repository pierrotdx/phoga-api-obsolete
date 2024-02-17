const CONTROLLER_TYPES = {
  PhotoController: Symbol.for("PhotoController"),
};

const SERVICE_TYPES = {
  GoogleStorageService: Symbol.for("GoogleStorageService"),
};

const TYPES = {
  ...CONTROLLER_TYPES,
  ...SERVICE_TYPES,
};

export { TYPES };
