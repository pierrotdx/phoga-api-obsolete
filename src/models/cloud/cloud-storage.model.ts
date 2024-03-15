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
  streamReadFile: (
    fileName: CloudFile["name"],
    bucketName: CloudBucket["name"]
  ) => Promise<Readable>;
  streamUploadFile: (
    params: UploadFileParams,
    options?: UploadFileOptions
  ) => Writable;
}
