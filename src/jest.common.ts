import { Container } from "inversify";
import {
  constantsContainerModule,
  servicesContainerModule,
  controllersContainerModule,
} from "./inversify/inversify.config.js";
import { TYPES } from "./inversify/index.js";
import { LogData, LoggerInterface } from "./models/logger.model.js";

const bindMockEnv = (container: Container, env?: NodeJS.ProcessEnv) => {
  container.unbind(TYPES.Env);
  container.bind(TYPES.Env).toConstantValue(env);
};

const mockLoggerService: LoggerInterface = {
  info: (message: string, meta?: LogData) => console.info(message, meta),
  warn: (message: string, meta?: LogData) => console.warn(message, meta),
  error: (error: any) => console.error(error),
};

// hack: mocking logger using console so that jest's argument `--silent` works
const bindMockLogger = (container: Container) => {
  container.unbind(TYPES.LoggerService);
  container.bind(TYPES.LoggerService).toConstantValue(mockLoggerService);
};

// https://github.com/inversify/InversifyJS/blob/master/wiki/recipes.md#overriding-bindings-on-unit-tests
export const getMockSingletons = (env?: NodeJS.ProcessEnv) => {
  const mockSingletons = new Container();
  mockSingletons.load(constantsContainerModule);
  bindMockEnv(mockSingletons, env);
  mockSingletons.load(controllersContainerModule, servicesContainerModule);
  bindMockLogger(mockSingletons);
  return mockSingletons;
};

const commonDumbEnv: NodeJS.ProcessEnv = {
  HTTP_SERVER_PORT: "dumb http port",
  PHOTOS_BUCKET: "dumb photo bucket",
  MONGO_CONNECTION_STRING: "mongodb://dumb connection string",
  MONGO_DATABASE_NAME: "dumb database name",
};
export const commonMockSingletons = getMockSingletons(commonDumbEnv);

export const commonDumbError = new Error("dumb error");
