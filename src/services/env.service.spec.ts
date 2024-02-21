import { constantsContainerModule } from "../inversify.config.js";
import { TYPES } from "../types.js";
import { EnvService } from "./env.service.js";
import { Container } from "inversify";

describe("envService", () => {
  let envService: EnvService;
  let mockSingletons: Container | null;

  beforeEach(() => {
    const mockEnv = getMockSingletons().get<NodeJS.ProcessEnv>(TYPES.Env);
    envService = new EnvService(mockEnv);
  });

  afterEach(() => {
    mockSingletons = null;
  });

  describe("getEnvVariable", () => {
    it("should return the value corresponding to the env name variable if it exists", () => {
      const result = envService["getEnvVariable"](dumbEnvVarName1);
      expect(result).toBe(dumbEnv[dumbEnvVarName1]);
      expect.assertions(1);
    });

    it("should return the default value if provided", () => {
      const defaultValue = "dumb default value";
      const result = envService["getEnvVariable"](
        envVarWithUndefinedValue,
        defaultValue
      );
      expect(result).toBe(defaultValue);
      expect.assertions(1);
    });

    it("should warn if no value has been found and no default value is given", () => {
      const warnSpy = jest.spyOn(global.console, "warn");
      envService["getEnvVariable"]("dumb key name");
      expect(warnSpy).toHaveBeenCalled();
      expect.assertions(1);
    });
  });
});

const [dumbEnvVarName1, envVarWithUndefinedValue] = [
  "dumbEnvVarName1",
  "envVarWithUndefinedValue",
];
const dumbEnv: NodeJS.ProcessEnv = {
  [dumbEnvVarName1]: "dumb value 1",
  [envVarWithUndefinedValue]: undefined,
};

const getMockSingletons = () => {
  const mockSingletons = new Container();
  mockSingletons.load(constantsContainerModule);
  mockSingletons.unbind(TYPES.Env);
  mockSingletons.bind(TYPES.Env).toConstantValue(dumbEnv);
  return mockSingletons;
};
