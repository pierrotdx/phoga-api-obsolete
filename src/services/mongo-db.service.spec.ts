import { TYPES } from "../inversify/index.js";
import { commonMockSingleton } from "../jest.common.js";
import { MongoDbService } from "./mongo-db.service.js";
import { LoggerService } from "./logger.service.js";
import { ConnectionCreatedEvent } from "mongodb";
import { EnvService } from "./env.service.js";
import { DbCollection } from "../models/db-collections.model.js";
import exp from "constants";

describe("mongoDbService", () => {
  let mongoDbService: MongoDbService;
  const envService = commonMockSingleton.get<EnvService>(TYPES.EnvService);

  const loggerService = commonMockSingleton.get<LoggerService>(
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

  describe("photoMetadataFilterAdaptor", () => {
    it("should throw an error if the provided filter is `undefined`", () => {
      expect(mongoDbService.photoMetadataFilterAdaptor).toThrow();
      expect.assertions(1);
    });

    it("should return an object with a `date` field if the input filter has a `minDate` field", () => {
      const input = { minDate: new Date() };
      const result = mongoDbService.photoMetadataFilterAdaptor(input);
      expect(result.date).toBeDefined();
      expect.assertions(1);
    });

    it("should return an object with a `date` field if the input filter has a `maxDate` field", () => {
      const input = { maxDate: new Date() };
      const result = mongoDbService.photoMetadataFilterAdaptor(input);
      expect(result.date).toBeDefined();
      expect.assertions(1);
    });

    it("should return an object with a `date` field if the input filter has both `minDate` and `maxDate` fields", () => {
      const dumbDate = new Date();
      const input = { minDate: dumbDate, maxDate: dumbDate };
      const result = mongoDbService.photoMetadataFilterAdaptor(input);
      expect(result.date).toBeDefined();
      expect.assertions(1);
    });

    it("should return an object with a `titles` field if the input filter has a `title` field", () => {
      const dumbTitle = "dumb title";
      const input = { title: dumbTitle };
      const result = mongoDbService.photoMetadataFilterAdaptor(input);
      expect(result.titles).toBe(dumbTitle);
      expect.assertions(1);
    });

    it("should return an object with a `filename` field if the input filter has a `filename` field", () => {
      const input = { filename: "dumb filename" };
      const result = mongoDbService.photoMetadataFilterAdaptor(input);
      expect(result.filename).toBeDefined();
      expect.assertions(1);
    });
  });
});
