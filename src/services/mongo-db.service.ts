import { inject, injectable } from "inversify";
import { DbInterface } from "../models/db.model.js";
import { Db, Document, MongoClient, Filter } from "mongodb";
import { TYPES } from "../inversify/index.js";
import { EnvService } from "./env.service.js";
import { LoggerService } from "./logger.service.js";
import { DbCollection } from "../models/db-collections.model.js";
import { PhotoMetadata } from "../models/index.js";

@injectable()
export class MongoDbService implements DbInterface {
  private readonly client: MongoClient;
  private readonly db: Db;

  constructor(
    @inject(TYPES.EnvService) private readonly envService: EnvService,
    @inject(TYPES.LoggerService) private readonly loggerService: LoggerService
  ) {
    try {
      this.client = new MongoClient(this.envService.MONGO_CONNECTION_STRING);

      const dbName = this.envService.MONGO_DATABASE_NAME;
      if (!dbName) {
        throw new Error("no name provided for the MongoDB database");
      }
      this.db = this.client.db(this.envService.MONGO_DATABASE_NAME);
      this.client.on("connectionCreated", () => {
        this.loggerService.info("successfully connected to MongoDB");
      });
      this.client.on("error", (err) => {
        throw err;
      });
    } catch (err) {
      this.loggerService.error(err);
      throw err;
    }
  }

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
