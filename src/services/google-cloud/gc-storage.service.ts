import { injectable } from "inversify";
import { CloudStorageInterface } from "../../models/index.js";
import { Storage } from "@google-cloud/storage";

@injectable()
export class GCStorageService implements CloudStorageInterface<Storage> {
  client = new Storage();
  constructor() {
    this.foo();
  }

  getBuckets = async () => {
    try {
      const response = await this.client.getBuckets();
      const buckets = response[0];
      return buckets;
    } catch (error) {
      const err = JSON.stringify((error as any).errors?.[0] || error);
      throw new Error(err);
    }
  };

  getBucket = (bucketName: string) => {
    try {
      return this.client.bucket(bucketName);
    } catch (error) {
      console.error("[error]", error);
      throw error;
    }
  };

  uploadFile = (bucketName: string, isPublic = false) => {
    const bucket = this.getBucket(bucketName);
    const path =
      "C:\\Users\\Pierre\\Documents\\projets\\photo-gallery-public-api\\src\\assets\\20201118_173153.jpg";
    return bucket.upload(path, { public: isPublic });
  };

  async foo() {
    try {
      console.log("before");
      console.log("after");
    } catch (err) {
      console.log(err);
    }
  }
}
