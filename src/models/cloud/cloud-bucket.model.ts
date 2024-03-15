interface CloudObject extends Object {
  name: string;
  base_url?: string;
}

export interface CloudFile extends CloudObject {
  public_url?: string;
}

export interface CloudBucket extends CloudObject {
  metadata?: unknown;
}

export interface UploadFileParams {
  bucketName: string;
  fileName: string;
}

export interface UploadFileOptions {
  isPublic?: boolean;
}
