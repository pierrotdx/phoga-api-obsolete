import "dotenv/config";
import { singletons } from "./inversify.config.js";
import { TYPES } from "./types.js";
import { DumbAService, DumbBService } from "./services/index.js";

const env = process.env;
console.log("env:", env.TEST_VARIABLE);

const dumbAService = singletons.get<DumbAService>(TYPES.DumbAService);
dumbAService.log();
const dumbBService = singletons.get<DumbBService>(TYPES.DumbBService);
dumbBService.log();
