import { ConfigParams, auth } from "express-openid-connect";
import { singletons } from "../inversify/inversify.config.js";
import { TYPES } from "../inversify/types.js";
import { EnvService } from "../services/env.service.js";

const envService = singletons.get<EnvService>(TYPES.EnvService);
const baseUrl = `${envService.HTTP_SERVER_HOST}:${envService.HTTP_SERVER_PORT}`;

const config: ConfigParams = {
  authRequired: true,
  auth0Logout: true,
  clientSecret: "test",
  baseURL: baseUrl,
  clientID: envService.AUTH0_CLIENT_ID,
  issuerBaseURL: envService.AUTH0_DOMAIN,
  secret: envService.AUTH0_CLIENT_SECRET,
  authorizationParams: {
    redirect_uri: `${baseUrl}/loginCallback`,
    audience: envService.AUTH0_DOMAIN,
  },
};

export const authRouter = auth(config);
