const CONTROLLER_TYPES = {
  DumbController: Symbol.for("DumbController"),
};

const SERVICE_TYPES = {
  GoogleStorageService: Symbol.for("GoogleStorageService"),
};

const TYPES = {
  ...CONTROLLER_TYPES,
  ...SERVICE_TYPES,
};

export { TYPES };
