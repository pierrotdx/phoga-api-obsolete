import { Bucket } from "@google-cloud/storage";

export interface CloudStorageInterface<StorageClient> {
  client: StorageClient;
  getBuckets: () => Promise<unknown[]>;
  getBucket: (bucketName: string) => unknown;
  uploadFile: (bucketName: string, isPublic: boolean) => Promise<unknown>;
}
