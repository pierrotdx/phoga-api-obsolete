import { TYPES } from "../types.js";
import { EnvService } from "./env.service.js";
import { LoggerService } from "./logger.service.js";
import { getMockSingletons } from "../jest.common.js";
import { Container } from "inversify";

const [dumbEnvVarName1, envVarWithUndefinedValue] = [
  "dumbEnvVarName1",
  "envVarWithUndefinedValue",
];

const dumbEnv: NodeJS.ProcessEnv = {
  [dumbEnvVarName1]: "dumb value 1",
  [envVarWithUndefinedValue]: undefined,
};

describe("envService", () => {
  const mockSingletons = getMockSingletons(dumbEnv);
  const loggerService = mockSingletons.get<LoggerService>(TYPES.LoggerService);
  const envService = mockSingletons.get<EnvService>(TYPES.EnvService);

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
      const warnSpy = jest.spyOn(loggerService, "warn");
      envService["getEnvVariable"]("dumb key name");
      expect(warnSpy).toHaveBeenCalled();
      expect.assertions(1);
    });
  });
});
