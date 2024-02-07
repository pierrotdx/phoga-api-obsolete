const CONTROLLER_TYPES = {
  DumbController: Symbol.for("DumbController"),
};

const SERVICE_TYPES = {
  DumbAService: Symbol.for("DumbAService"),
  DumbBService: Symbol.for("DumbBService"),
};

const TYPES = {
  ...CONTROLLER_TYPES,
  ...SERVICE_TYPES,
};

export { TYPES };
