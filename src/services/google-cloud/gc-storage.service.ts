import { Storage } from "@google-cloud/storage";
import { injectable } from "inversify";
import { CloudStorageInterface } from "../../models/index.js";
import {
  CloudBucket,
  UploadFileParams,
  UploadFileOptions,
} from "../../models/cloud/cloud-bucket.model.js";

@injectable()
export class GCStorageService implements CloudStorageInterface {
  client = new Storage();

  private getGcBucket = (bucketName: string) => {
    try {
      return this.client.bucket(bucketName);
    } catch (error) {
      console.error("[error]", error);
      throw error;
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
    console.log(
      `[gc]: successfully uploaded '${params.fileName}' to '${params.bucketName}'`
    );
  };

  private onStreamUploadFileError =
    (params: UploadFileParams) => (err: Error) => {
      console.error(
        `[gc]: failed uploading '${params.fileName}' to '${params.bucketName}'`
      );
      console.error(`[gc]: uploading error: `, err);
      throw err;
    };
}
