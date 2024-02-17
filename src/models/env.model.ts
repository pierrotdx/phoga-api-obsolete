import "dotenv/config";

export const ENV = process.env;

const getEnvVariable = <T = string>(
  varName: string,
  parser: (stringValue: string) => T = (stringValue) => stringValue as T,
  defaultValue?: T
): T => {
  let value = ENV[varName] || "";

  if (value) {
    return parser(value);
  } else if (defaultValue !== undefined) {
    return defaultValue;
  } else {
    throw new Error(`environment variable: \"${varName}\" is undefined`);
  }
};

export const HTTP_SERVER_PORT = getEnvVariable("HTTP_SERVER_PORT", parseInt);

export const PHOTOS_BUCKET = getEnvVariable("PHOTOS_BUCKET");
