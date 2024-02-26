import { Bucket, File, Storage } from "@google-cloud/storage";
import { GCStorageService } from "./gc-storage.service.js";
import { UploadFileParams } from "../../models/cloud/cloud-bucket.model.js";
import { FileOptions } from "buffer";
import { Writable } from "node:stream";
import { commonDumbError, commonMockSingleton } from "../../jest.common.js";
import { TYPES } from "../../inversify/index.js";
import { LoggerInterface } from "../../models/logger.model.js";

const dumbStorage = new Storage();
const dumbGcBucket = new Bucket(dumbStorage, "dumbBucket");
const dumbFileName = "fileName";
const dumbFile: File = new File(dumbGcBucket, dumbFileName + ".jpg");

describe("gc-storage.service", () => {
  const loggerService = commonMockSingleton.get<LoggerInterface>(
    TYPES.LoggerService
  );
  const gcStorageService = commonMockSingleton.get<GCStorageService>(
    TYPES.GoogleStorageService
  );

  const errorLogSpy = jest.spyOn(loggerService, "error");
  const clientBucketSpy = jest.spyOn(gcStorageService.client, "bucket");
  const bucketGetFilesSpy: jest.SpyInstance = jest.spyOn(
    dumbGcBucket as Bucket,
    "getFiles"
  );
  const getGcBucketSpy = jest.spyOn(gcStorageService as any, "getGcBucket");
  const getBucketsSpy = jest.spyOn(gcStorageService, "getBuckets");
  const getFilesFromBucket = jest.spyOn(
    gcStorageService as any,
    "getFilesFromBucket"
  );

  describe("getGcBucket", () => {
    it("should call the cloud-client-function `bucket`", () => {
      gcStorageService["getGcBucket"]("test");
      expect(clientBucketSpy).toHaveBeenCalled();
      expect.assertions(1);
    });

    it("should log and throw when the cloud client throws", () => {
      clientBucketSpy.mockImplementationOnce(() => {
        throw commonDumbError;
      });
      expect(() => {
        gcStorageService["getGcBucket"]("test");
      }).toThrow();
      expect(errorLogSpy).toHaveBeenCalled();
      expect.assertions(2);
    });

    it("should convert the message received into error, and then log and throw it", () => {
      clientBucketSpy.mockImplementationOnce(() => {
        throw "error message";
      });
      expect(() => {
        gcStorageService["getGcBucket"]("test");
      }).toThrow();
      expect(errorLogSpy).toHaveBeenCalled();
      expect.assertions(2);
    });
  });

  describe("getBucket", () => {
    it("should call the function `getGcBucket`", () => {
      getGcBucketSpy.mockReturnValueOnce(dumbGcBucket);
      const result = gcStorageService.getBucket("dumb name");
      expect(result).toBe(dumbGcBucket);
      expect(getGcBucketSpy).toHaveBeenCalled();
      expect.assertions(2);
    });
  });

  describe("getBuckets", () => {
    it("should call the cloud-client-function `getBuckets`", async () => {
      await gcStorageService.getBuckets();
      expect(getBucketsSpy).toHaveBeenCalled();
      expect.assertions(1);
    });
  });

  describe("getFilesFromBucket", () => {
    it("should call the functions `getGcBucket` and `Bucket.getFiles`", async () => {
      getGcBucketSpy.mockReturnValueOnce(dumbGcBucket);
      bucketGetFilesSpy.mockReturnValueOnce([dumbFile]);
      await gcStorageService["getFilesFromBucket"](
        dumbFileName,
        dumbGcBucket.name
      );
      expect(getGcBucketSpy).toHaveBeenCalled();
      expect(bucketGetFilesSpy).toHaveBeenCalled();
      expect.assertions(2);
    });
  });

  describe("streamReadFile", () => {
    it("should call the function `getFilesFromBucket`", async () => {
      getGcBucketSpy.mockReturnValueOnce(dumbGcBucket);
      try {
        await gcStorageService.streamReadFile(
          "dumbFileName",
          dumbGcBucket.name
        );
      } catch (err) {}
      expect(getFilesFromBucket).toHaveBeenCalled();
      expect.assertions(1);
    });

    it("should find the file with a matching name and return its read stream", async () => {
      getFilesFromBucket.mockResolvedValueOnce([dumbFile]);
      const createReadStreamSpy = jest.spyOn(dumbFile, "createReadStream");
      await gcStorageService.streamReadFile(dumbFile.name, dumbGcBucket.name);
      expect(createReadStreamSpy).toHaveBeenCalled();
      expect(getFilesFromBucket).toHaveBeenCalled();
      expect.assertions(2);
    });

    it("should reject if no file is matching the requested file name", async () => {
      getFilesFromBucket.mockResolvedValueOnce([]);
      expect(async () => {
        await gcStorageService.streamReadFile(
          "non-matching file name",
          dumbGcBucket.name
        );
      }).rejects.toThrow();
      expect(getFilesFromBucket).toHaveBeenCalled();
      expect.assertions(2);
    });
  });

  describe("streamUploadFile", () => {
    const dumbParams: UploadFileParams = {
      bucketName: dumbGcBucket.name,
      fileName: dumbFileName,
    };
    let bucketFileSpy: jest.SpyInstance;
    let fileCreateWriteStream: jest.SpyInstance;
    let dumbWriteStream: Writable;

    beforeEach(() => {
      getGcBucketSpy.mockReturnValueOnce(dumbGcBucket);

      bucketFileSpy = jest.spyOn(dumbGcBucket, "file");
      bucketFileSpy.mockImplementation(
        (name: string, options?: FileOptions) => dumbFile
      );

      fileCreateWriteStream = jest.spyOn(dumbFile, "createWriteStream");
      dumbWriteStream = dumbFile.createWriteStream();
      fileCreateWriteStream.mockReturnValueOnce(dumbWriteStream);
    });

    it("should call the function `Bucket.file`", () => {
      gcStorageService.streamUploadFile(dumbParams);
      expect(bucketFileSpy).toHaveBeenCalled();
      expect.assertions(1);
    });

    it("should call the appropriate callback function on `close` event", () => {
      const callBackFn = jest.spyOn(
        gcStorageService as any,
        "onStreamUploadFileClose"
      );
      gcStorageService.streamUploadFile(dumbParams);
      dumbWriteStream.emit("close");
      expect(callBackFn).toHaveBeenCalled();
      expect.assertions(1);
    });

    it("should call the appropriate callback function on `error` event", () => {
      const callBackFn = jest.spyOn(
        gcStorageService as any,
        "onStreamUploadFileError"
      );
      try {
        gcStorageService.streamUploadFile(dumbParams);
        dumbWriteStream.emit("error", commonDumbError);
      } catch (err) {
        expect(err).toBe(commonDumbError);
      }

      expect(callBackFn).toHaveBeenCalled();
      expect.assertions(2);
    });
  });
});
