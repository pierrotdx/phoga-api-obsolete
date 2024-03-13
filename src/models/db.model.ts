import { DbCollection } from "./db-collections.model.js";

export interface DbInterface {
  getDocumentById: (
    collectionName: DbCollection,
    _id: string
  ) => Promise<unknown>;
}

export interface DbDoc {
  _id: string;
}
