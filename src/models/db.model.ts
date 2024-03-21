import { DbCollection } from "./db-collections.model.js";
import { PhotoMetadata, PhotoMetadataFilter } from "./photo-metadata.model.js";
import { FilterParams, RenderParams } from "./search-params.model.js";

export interface DbInterface {
  getDocumentById: (
    collectionName: DbCollection,
    _id: string
  ) => Promise<unknown>;
  search: (
    collectionName: DbCollection,
    filter: FilterParams,
    render?: RenderParams
  ) => Promise<unknown>;
  photoMetadataFilterAdaptor: (filter: PhotoMetadataFilter) => unknown;
}

export interface DbDoc {
  _id: string;
  [key: string]: any;
}
