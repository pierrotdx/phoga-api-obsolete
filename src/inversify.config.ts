import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types.js";
import { DumbAService, DumbBService } from "./services/index.js";

const singletons = new Container();
singletons.bind<DumbAService>(TYPES.DumbAService).to(DumbAService);
singletons.bind<DumbBService>(TYPES.DumbBService).to(DumbBService);

export { singletons };
