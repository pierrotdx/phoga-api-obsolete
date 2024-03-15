import { inject, injectable } from "inversify";
import { DbInterface } from "../models/db.model.js";
import {
  Db,
  Document,
  MongoClient,
  Filter,
  ConnectionCreatedEvent,
} from "mongodb";
import { TYPES } from "../inversify/index.js";
import { EnvService } from "./env.service.js";
import { DbCollection } from "../models/db-collections.model.js";
import { LoggerInterface, PhotoMetadata } from "../models/index.js";

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

  private readonly getCollection = <DocType extends Document>(
    collectionName: DbCollection
  ) => this.db.collection<DocType>(collectionName);

  getDocumentById = async (collectionName: DbCollection, _id: string) => {
    const collection = this.getCollection<PhotoMetadata>(collectionName);
    const query: Filter<PhotoMetadata> = { _id };
    const doc = await collection.findOne(query);
    return doc;
  };
}
