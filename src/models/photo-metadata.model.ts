import { DbDoc } from "./db.model.js";

export interface PhotoMetadata extends DbDoc {
  filename: string;
  date?: Date;
  description?: string;
  geoLocation?: Pick<GeolocationCoordinates, "latitude" | "longitude">;
  titles?: string[];
}
