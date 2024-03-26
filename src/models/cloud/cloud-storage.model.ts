import { Readable, Writable } from "node:stream";
import {
  CloudBucket,
  CloudFile,
  UploadFileParams,
  UploadFileOptions,
} from "./cloud-bucket.model.js";

export interface CloudStorageInterface {
  client: unknown;
  getBuckets: () => Promise<CloudBucket[]>;
  getBucket: (bucketName: CloudBucket["name"]) => CloudBucket;
  fileReadStream: (
    fileName: CloudFile["name"],
    bucketName: CloudBucket["name"]
  ) => Promise<Readable>;
  streamUploadFile: (
    params: UploadFileParams,
    options?: UploadFileOptions
  ) => Writable;
}
