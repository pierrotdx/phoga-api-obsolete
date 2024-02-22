import { inject, injectable } from "inversify";
import { TYPES } from "../types.js";
import { EnvInterface, LoggerInterface } from "../models/index.js";
import { LoggerService } from "./logger.service.js";

@injectable()
export class EnvService implements EnvInterface {
  public readonly HTTP_SERVER_PORT: string;
  public readonly PHOTOS_BUCKET: string;

  private readonly ENV: NodeJS.ProcessEnv;

  constructor(
    @inject(TYPES.Env) private readonly env: NodeJS.ProcessEnv,
    @inject(TYPES.LoggerService) private readonly loggerService: LoggerInterface
  ) {
    this.ENV = env;
    this.HTTP_SERVER_PORT = this.getEnvVariable("HTTP_SERVER_PORT");
    this.PHOTOS_BUCKET = this.getEnvVariable("PHOTOS_BUCKET");
  }

  private readonly getEnvVariable = (
    varName: string,
    defaultValue?: string
  ): string => {
    let value = this.ENV[varName] || "";

    if (value) {
      return value;
    } else if (defaultValue !== undefined) {
      return defaultValue;
    } else {
      this.loggerService.warn(
        `environment variable: \"${varName}\" is undefined`
      );
      return "";
    }
  };
}
