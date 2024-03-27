import { DbCollection } from "./db-collections.model.js";
import { PhotoMetadataFilter } from "./photo-metadata.model.js";
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
  insert: <DocType extends DbDoc>(
    collectionName: DbCollection,
    doc: DocType
  ) => Promise<DbDoc["_id"]>;
}

export interface DbDoc {
  _id: string;
  manifest?: {
    creation?: {
      when?: Date;
    };
    last_update?: {
      when?: Date;
    };
  };
  [key: string]: any;
}
