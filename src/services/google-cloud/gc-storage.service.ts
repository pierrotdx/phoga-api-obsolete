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
    try {
      const gcBuckets = (await this.client.getBuckets())[0];
      const buckets = gcBuckets.map<CloudBucket>((b) => ({
        ...b,
        base_url: b.baseUrl,
      }));
      return buckets;
    } catch (error) {
      const err = JSON.stringify((error as any).errors?.[0] || error);
      throw new Error(err);
    }
  };

  getFile = async (fileName: string, bucketName: string) => {
    const files = (
      await this.getGcBucket(bucketName).getFiles({
        prefix: fileName,
      })
    )[0];
    const matchingFile = files.find(
      (file) =>
        file.name.split(".")[0].toLocaleLowerCase() ===
        fileName.toLocaleLowerCase()
    );
    if (!matchingFile) {
      throw new Error("no matching file");
    }
    return matchingFile.createReadStream();
  };

  streamUploadFile = (
    params: UploadFileParams,
    options: UploadFileOptions = { isPublic: false }
  ) =>
    this.getGcBucket(params.bucketName)
      .file(params.fileName)
      .createWriteStream({ public: !!options?.isPublic })
      .on("close", () => {
        console.log(
          `[gc]: successfully uploaded '${params.fileName}' to '${params.bucketName}'`
        );
      })
      .on("error", (err) => {
        console.error(
          `[gc]: failed uploading '${params.fileName}' to '${params.bucketName}'`
        );
        console.error(`[gc]: uploading error: `, err);
        throw err;
      });
}
