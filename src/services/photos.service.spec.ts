import { commonMockSingletons } from "../jest.common.js";
import { PhotosService } from "./photos.service.js";
import { TYPES } from "../inversify/index.js";
import { CloudStorageInterface, DbInterface } from "../models/index.js";
import { Readable } from "stream";
import { EnvService } from "./env.service.js";

describe("photosService", () => {
  let photosService: PhotosService;
  const dumbPhotoId = "dumbPhotoId";
  const dumbBucketName = "dumbBucketName";
  const dumbReadable = new Readable({ read: function (size) {} });

  const envService = commonMockSingletons.get<EnvService>(TYPES.EnvService);
  const cloudStorageService = commonMockSingletons.get<CloudStorageInterface>(
    TYPES.GcStorageService
  );
  const dbService = commonMockSingletons.get<DbInterface>(TYPES.MongoDbService);
  beforeEach(() => {
    photosService = new PhotosService(
      envService,
      dbService,
      cloudStorageService
    );
  });

  describe("getPhotoBuffer", () => {
    let mockFileReadStream: jest.SpyInstance;

    it('should call the "fileReadStream" and "getPhotoBufferPromise" functions', async () => {
      mockFileReadStream = jest.spyOn(cloudStorageService, "fileReadStream");
      mockFileReadStream.mockResolvedValueOnce(dumbReadable);
      const mockGetPhotoBufferPromise = jest.spyOn(
        photosService as any,
        "getPhotoBufferPromise"
      );
      mockGetPhotoBufferPromise.mockResolvedValueOnce(null);
      await photosService.getPhotoBuffer(dumbPhotoId, dumbBucketName);
      expect(mockFileReadStream).toHaveBeenCalled();
      expect(mockGetPhotoBufferPromise).toHaveBeenCalled();
      expect.assertions(2);
    });
  });

  describe("getPhotoBufferPromise", () => {
    it("should return an instance of promise", () => {
      const result = photosService["getPhotoBufferPromise"](dumbReadable);
      expect(result).toBeInstanceOf(Promise);
      expect.assertions(1);
    });
  });
});
