import { injectable } from "inversify";
import { JWTPayload } from "express-oauth2-jwt-bearer";

@injectable()
export class AuthService {
  public readonly includesAnyPermission =
    (...allowedPermissions: string[]) =>
    (claims: JWTPayload) => {
      const tokenPermissions = claims?.permissions as string[];
      if (!tokenPermissions) {
        return false;
      }
      const commonPermissions = allowedPermissions.filter((allowedPermission) =>
        tokenPermissions.includes(allowedPermission)
      );
      return !!commonPermissions.length;
    };
}
