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
  insert: <DocType extends DbDoc>(
    collectionName: DbCollection,
    doc: DocType
  ) => Promise<DbDoc["_id"]>;
  patch: (
    collectionName: DbCollection,
    filterQuery: FilterQuery,
    patchQuery: PatchQuery
  ) => Promise<boolean>;
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

export type FilterQuery = Record<string, any>;
export type PatchQuery = Record<string, any>;
