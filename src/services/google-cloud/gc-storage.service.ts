import { Storage } from "@google-cloud/storage";
import { inject, injectable } from "inversify";
import { CloudStorageInterface, LoggerInterface } from "../../models/index.js";
import {
  CloudBucket,
  UploadFileParams,
  UploadFileOptions,
} from "../../models/cloud/cloud-bucket.model.js";
import { TYPES } from "../../inversify/index.js";

@injectable()
export class GcStorageService implements CloudStorageInterface {
  client = new Storage();

  constructor(
    @inject(TYPES.LoggerService) private readonly loggerService: LoggerInterface
  ) {}

  private getGcBucket = (bucketName: string) => {
    try {
      return this.client.bucket(bucketName);
    } catch (err) {
      if (err instanceof Error) {
        this.loggerService.error(err);
        throw err;
      } else {
        const error = new Error(JSON.stringify(err));
        this.loggerService.error(error);
        throw error;
      }
    }
  };

  getBucket = (bucketName: string): CloudBucket =>
    this.getGcBucket(bucketName) as CloudBucket;

  getBuckets = async (): Promise<CloudBucket[]> => {
    const gcBuckets = (await this.client.getBuckets())[0];
    const buckets = gcBuckets.map<CloudBucket>((b) => ({
      ...b,
      base_url: b.baseUrl,
    }));
    return buckets;
  };

  streamReadFile = async (fileName: string, bucketName: string) => {
    const files = await this.getFilesFromBucket(fileName, bucketName);
    if (!files?.length) {
      throw new Error("no matching file");
    }
    return files[0].createReadStream();
  };

  private getFilesFromBucket = async (prefix: string, bucketName: string) => {
    const bucket = this.getGcBucket(bucketName);
    const getFilesResponse = await bucket.getFiles({ prefix });
    return getFilesResponse[0];
  };

  streamUploadFile = (
    params: UploadFileParams,
    options: UploadFileOptions = { isPublic: false }
  ) => {
    const bucket = this.getGcBucket(params.bucketName);
    const file = bucket.file(params.fileName);
    const writeStream = file
      .createWriteStream({ public: !!options?.isPublic })
      .on("close", this.onStreamUploadFileClose(params))
      .on("error", this.onStreamUploadFileError(params));
    return writeStream;
  };

  private onStreamUploadFileClose = (params: UploadFileParams) => () => {
    this.loggerService.info(
      `[gc]: successfully uploaded '${params.fileName}' to '${params.bucketName}'`
    );
  };

  private onStreamUploadFileError =
    (params: UploadFileParams) => (err: Error) => {
      this.loggerService.error(err);
      throw err;
    };
}
