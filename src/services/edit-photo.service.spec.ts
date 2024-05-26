import { TYPES } from "../inversify/index.js";
import { commonMockSingletons } from "../jest.common.js";
import { DbInterface } from "../models/db.model.js";

import { EditPhotoService, GcStorageService, PhotosService } from "./index.js";

describe("editPhotoService", () => {
  let editPhotoService: EditPhotoService;
  const photosService = commonMockSingletons.get<PhotosService>(
    TYPES.PhotosService
  );
  const cloudStorageService = commonMockSingletons.get<GcStorageService>(
    TYPES.GcStorageService
  );
  const dbService = commonMockSingletons.get<DbInterface>(TYPES.MongoDbService);
  beforeEach(() => {
    editPhotoService = new EditPhotoService(
      cloudStorageService,
      photosService,
      dbService
    );
  });

  describe("photoMetadataFilterAdaptor", () => {
    it("should throw an error if the provided filter is `undefined`", () => {
      expect(editPhotoService.photoMetadataFilterAdaptor).toThrow();
      expect.assertions(1);
    });

    it("should return an object with a `date` field if the input filter has a `minDate` field", () => {
      const input = { minDate: new Date() };
      const result = editPhotoService.photoMetadataFilterAdaptor(input);
      expect(result.date).toBeDefined();
      expect.assertions(1);
    });

    it("should return an object with a `date` field if the input filter has a `maxDate` field", () => {
      const input = { maxDate: new Date() };
      const result = editPhotoService.photoMetadataFilterAdaptor(input);
      expect(result.date).toBeDefined();
      expect.assertions(1);
    });

    it("should return an object with a `date` field if the input filter has both `minDate` and `maxDate` fields", () => {
      const dumbDate = new Date();
      const input = { minDate: dumbDate, maxDate: dumbDate };
      const result = editPhotoService.photoMetadataFilterAdaptor(input);
      expect(result.date).toBeDefined();
      expect.assertions(1);
    });

    it("should return an object with a `titles` field if the input filter has a `title` field", () => {
      const dumbTitle = "dumb title";
      const input = { title: dumbTitle };
      const result = editPhotoService.photoMetadataFilterAdaptor(input);
      expect(result.titles).toBe(dumbTitle);
      expect.assertions(1);
    });

    it("should return an object with a `filename` field if the input filter has a `filename` field", () => {
      const input = { filename: "dumb filename" };
      const result = editPhotoService.photoMetadataFilterAdaptor(input);
      expect(result.filename).toBeDefined();
      expect.assertions(1);
    });
  });
});
