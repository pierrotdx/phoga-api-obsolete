import { inject, injectable } from "inversify";
import {
  DbDoc,
  DbInterface,
  FilterQuery,
  PatchQuery,
} from "../models/db.model.js";
import { Db, MongoClient, Filter, ConnectionCreatedEvent } from "mongodb";
import { TYPES } from "../inversify/index.js";
import { EnvService } from "./env.service.js";
import { DbCollection } from "../models/db-collections.model.js";
import { LoggerInterface } from "../models/index.js";
import { RenderParams } from "../models/search-params.model.js";

@injectable()
export class MongoDbService implements DbInterface {
  private readonly client: MongoClient;
  private readonly db: Db;

  constructor(
    @inject(TYPES.EnvService) private readonly envService: EnvService,
    @inject(TYPES.LoggerService) private readonly loggerService: LoggerInterface
  ) {
    this.client = this.getClient();
    this.db = this.getDb();
  }

  private readonly getConnectionString = () =>
    this.envService.MONGO_CONNECTION_STRING;

  private readonly getClient = () => {
    try {
      const connectionString = this.getConnectionString();
      const client = new MongoClient(connectionString);
      client
        .on("connectionCreated", this.onConnectionCreated)
        .on("error", this.onClientError);
      return client;
    } catch (err) {
      this.loggerService.error(err);
      throw err;
    }
  };

  private readonly onConnectionCreated = (event: ConnectionCreatedEvent) => {
    this.loggerService.info(
      `successfully connected to MongoDB with connection id \"${event.connectionId}\"`
    );
  };

  private readonly onClientError = (err: unknown) => {
    throw err;
  };

  private readonly getDb = () => {
    const dbName = this.getDbName();
    return this.client.db(dbName);
  };

  private readonly getDbName = () => this.envService.MONGO_DATABASE_NAME;

  private readonly getCollection = <DocType extends DbDoc>(
    collectionName: DbCollection
  ) => this.db.collection<DocType>(collectionName);

  getDocumentById = async <DocType extends DbDoc>(
    collectionName: DbCollection,
    _id: string
  ) => {
    const collection = this.getCollection<DocType>(collectionName);
    const query: Filter<DbDoc> = { _id };
    const doc = await collection.findOne(query);
    return doc;
  };

  search = async <DocType extends DbDoc>(
    collectionName: DbCollection,
    filter: Filter<DocType>,
    render: RenderParams = {}
  ) => {
    if (!render.size) {
      render.size = 20;
    }
    const collection = this.getCollection<DocType>(collectionName);
    const result = await collection.find(filter, render).toArray();
    return result;
  };

  insert = async <DocType extends DbDoc>(
    collectionName: DbCollection,
    doc: DocType & DbDoc
  ) => {
    if (!doc._id) {
      throw new Error('document must have an "_id" field');
    }
    const now = new Date();
    doc.manifest = {
      creation: { when: now },
      last_update: { when: now },
    };
    const collection = this.getCollection<DbDoc>(collectionName);
    await collection.insertOne(doc, { forceServerObjectId: false });
    return doc._id;
  };

  patch = async <DocType extends DbDoc>(
    collectionName: DbCollection,
    filterQuery: FilterQuery,
    patchQuery: PatchQuery
  ) => {
    const collection = this.getCollection<DocType>(collectionName);
    await collection.updateOne(filterQuery, patchQuery, { upsert: false });
    return true;
  };
}
