import { TYPES } from "../inversify/index.js";
import { commonMockSingletons } from "../jest.common.js";
import { MongoDbService } from "./mongo-db.service.js";
import { LoggerService } from "./logger.service.js";
import { ConnectionCreatedEvent } from "mongodb";
import { EnvService } from "./env.service.js";
import { DbCollection } from "../models/db-collections.model.js";
import exp from "constants";

describe("mongoDbService", () => {
  let mongoDbService: MongoDbService;
  const envService = commonMockSingletons.get<EnvService>(TYPES.EnvService);

  const loggerService = commonMockSingletons.get<LoggerService>(
    TYPES.LoggerService
  );

  beforeEach(() => {
    mongoDbService = new MongoDbService(envService, loggerService);
  });

  describe("getClient", () => {
    it("should log an error and throw if the connection string is invalid", () => {
      jest
        .spyOn(mongoDbService as any, "getConnectionString")
        .mockReturnValueOnce("");
      const getClientSpy = jest.spyOn(mongoDbService as any, "getClient");
      const errorLoggerSpy = jest.spyOn(loggerService, "error");
      expect(() => {
        mongoDbService["getClient"]();
      }).toThrow();
      expect(getClientSpy).toHaveBeenCalled();
      expect(errorLoggerSpy).toHaveBeenCalled();
      expect.assertions(3);
    });

    it('should return a client instance listening to "connectionCreated" and "error" events', async () => {
      const dumbClient = mongoDbService["getClient"]();
      const subscribedEvents = dumbClient.eventNames();
      expect(subscribedEvents).toHaveLength(2);
      expect(subscribedEvents).toContain("connectionCreated");
      expect(subscribedEvents).toContain("error");
      expect.assertions(3);
    });
  });

  describe("onConnectionCreated", () => {
    it("should info log a message", () => {
      const infoLoggerSpy = jest.spyOn(loggerService, "info");
      mongoDbService["onConnectionCreated"]({} as ConnectionCreatedEvent);
      expect(infoLoggerSpy).toHaveBeenCalled();
      expect.assertions(1);
    });
  });

  describe("onClientError", () => {
    it("should throw an error", () => {
      expect(() => {
        mongoDbService["onClientError"](undefined);
      }).toThrow();
      expect.assertions(1);
    });
  });

  describe("getDb", () => {
    it('should call "getDbName" and "client.db"', () => {
      const getDbNameSpy = jest.spyOn(mongoDbService as any, "getDbName");
      const clientDbSpy = jest.spyOn(mongoDbService["client"], "db");
      mongoDbService["getDb"]();
      expect(getDbNameSpy).toHaveBeenCalled();
      expect(clientDbSpy).toHaveBeenCalled();
      expect.assertions(2);
    });
  });

  describe("getCollection", () => {
    it('should call "db.collection" function', () => {
      const dbCollectionSpy = jest.spyOn(mongoDbService["db"], "collection");
      const dumbCollectionName = "dumb collection name";
      mongoDbService["getCollection"](dumbCollectionName as DbCollection);
      expect(dbCollectionSpy).toHaveBeenLastCalledWith(dumbCollectionName);
      expect.assertions(1);
    });
  });

  describe("getDocumentById", () => {
    it('should call "getCollection" and "collection.findOne" functions', async () => {
      const getCollectionSpy = jest.spyOn(
        mongoDbService as any,
        "getCollection"
      );
      const findOneSpy = jest.fn();
      getCollectionSpy.mockReturnValueOnce({
        findOne: findOneSpy,
      });
      const dumbCollectionName = "dumb collection name";
      await mongoDbService.getDocumentById(
        dumbCollectionName as DbCollection,
        "dumb _id"
      );
      expect(getCollectionSpy).toHaveBeenLastCalledWith(dumbCollectionName);
      expect(findOneSpy).toHaveBeenCalled();
      expect.assertions(2);
    });
  });

  describe("search", () => {
    const dumbCollectionName = "dumbCollectionName" as DbCollection;
    const dumbFilter = { dumbFilter: "dumbFilter" } as any;
    const dumbRender = { size: 50 };

    let findSpy: jest.SpyInstance;
    let getCollectionSpy: jest.SpyInstance;
    beforeEach(() => {
      findSpy = jest.fn().mockReturnValue({
        toArray: () => "dumb result",
      });
      getCollectionSpy = jest.spyOn(mongoDbService as any, "getCollection");
      getCollectionSpy.mockReturnValue({
        find: findSpy,
      });
    });

    it('should call the "getCollection" and "collection.find" functions', async () => {
      await mongoDbService.search(dumbCollectionName, dumbFilter, dumbRender);
      expect(getCollectionSpy).toHaveBeenLastCalledWith(dumbCollectionName);
      expect(findSpy).toHaveBeenLastCalledWith(dumbFilter, dumbRender);
      expect.assertions(2);
    });

    it("should be called with a default size if no size is specified in the render param", async () => {
      await mongoDbService.search(dumbCollectionName, dumbFilter);
      const defaultSize = 20;
      expect(findSpy).toHaveBeenLastCalledWith(dumbFilter, {
        size: defaultSize,
      });
      expect.assertions(1);
    });
  });
});
