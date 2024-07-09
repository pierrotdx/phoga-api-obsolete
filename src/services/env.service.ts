import { inject, injectable } from "inversify";
import { TYPES } from "../inversify/index.js";
import { EnvInterface, LoggerInterface } from "../models/index.js";

@injectable()
export class EnvService implements EnvInterface {
  public readonly HTTP_SERVER_PORT: string;
  public readonly PHOTOS_BUCKET: string;
  public readonly MONGO_CONNECTION_STRING: string;
  public readonly MONGO_DATABASE_NAME: string;

  public readonly AUTH0_AUDIENCE: string;
  public readonly AUTH0_DOMAIN: string;

  private readonly ENV: NodeJS.ProcessEnv;

  constructor(
    @inject(TYPES.Env) private readonly env: NodeJS.ProcessEnv,
    @inject(TYPES.LoggerService) private readonly loggerService: LoggerInterface
  ) {
    this.ENV = env;
    this.HTTP_SERVER_PORT = this.getEnvVariable("HTTP_SERVER_PORT");
    this.PHOTOS_BUCKET = this.getEnvVariable("PHOTOS_BUCKET");
    this.MONGO_CONNECTION_STRING = this.getEnvVariable(
      "MONGO_CONNECTION_STRING"
    );
    this.MONGO_DATABASE_NAME = this.getEnvVariable("MONGO_DATABASE_NAME");
    this.AUTH0_AUDIENCE = this.getEnvVariable("AUTH0_AUDIENCE");
    this.AUTH0_DOMAIN = this.getEnvVariable("AUTH0_DOMAIN");
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
