import { auth } from "express-oauth2-jwt-bearer";
import { singletons } from "../inversify/inversify.config.js";
import { TYPES } from "../inversify/types.js";
import { EnvService } from "../services/env.service.js";

const envService = singletons.get<EnvService>(TYPES.EnvService);

export const authMiddleware = auth({
  authRequired: false,
  issuerBaseURL: `https://${envService.AUTH0_DOMAIN}`,
  audience: envService.AUTH0_AUDIENCE,
});
