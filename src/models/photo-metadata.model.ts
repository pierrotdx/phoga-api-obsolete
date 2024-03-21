import { DbDoc } from "./db.model.js";
import { FilterParams } from "./search-params.model.js";

export interface PhotoMetadata extends DbDoc {
  filename: string;
  date?: Date;
  description?: string;
  geoLocation?: Pick<GeolocationCoordinates, "latitude" | "longitude">;
  titles?: string[];
}

export interface PhotoMetadataFilter extends FilterParams {
  filename?: string;
  description?: string;
  minDate?: Date;
  maxDate?: Date;
  title?: string;
}
