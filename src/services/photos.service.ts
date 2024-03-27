import { inject, injectable } from "inversify";
import sharp from "sharp";
import {
  CloudStorageInterface,
  DbInterface,
  PhotoFormatOptions,
  PhotoMetadata,
} from "../models/index.js";
import { TYPES } from "../inversify/index.js";
import { Readable } from "stream";
import { EnvService } from "./env.service.js";
import { DbCollection } from "../models/db-collections.model.js";

@injectable()
export class PhotosService {
  public readonly PHOTOS_BUCKET;

  constructor(
    @inject(TYPES.EnvService) private readonly envService: EnvService,
    @inject(TYPES.MongoDbService) private readonly dbService: DbInterface,
    @inject(TYPES.GcStorageService)
    private readonly cloudStorageService: CloudStorageInterface
  ) {
    this.PHOTOS_BUCKET = this.envService.PHOTOS_BUCKET;
  }

  public readonly getPhotoBuffer = async (
    photoId: string,
    bucketName: string
  ) => {
    const photoReadableStream = await this.cloudStorageService.fileReadStream(
      photoId,
      bucketName
    );
    return this.getPhotoBufferPromise(photoReadableStream);
  };

  private readonly getPhotoBufferPromise = (
    photoReadableStream: Readable,
    encoding: BufferEncoding = "base64"
  ) =>
    new Promise<Buffer>(function (resolve, reject) {
      photoReadableStream.setEncoding(encoding);
      let encodedPhoto = "";
      photoReadableStream.on("data", (chunk) => {
        encodedPhoto += chunk;
      });
      photoReadableStream.on("end", () => {
        const photoBuffer = Buffer.from(encodedPhoto, encoding);
        resolve(photoBuffer);
      });
      photoReadableStream.on("error", (err) => {
        reject(err);
      });
    });

  public readonly getPhotoFormatPipeline = ({
    photoBuffer,
    errorHandler,
    photoFormatOptions,
  }: {
    photoBuffer: Buffer;
    errorHandler: (err: Error) => void;
    photoFormatOptions?: PhotoFormatOptions;
  }) => {
    const defaultQuality = 100;
    const { width, height, quality } = {
      quality: defaultQuality,
      ...photoFormatOptions,
    };
    const pipeline = sharp(photoBuffer).on("error", errorHandler);
    if (quality) {
      pipeline.jpeg({ quality });
    }
    if (width && height) {
      pipeline.resize(width, height);
    }
    return pipeline;
  };

  insertPhotoMetadataInDb = (
    photoMetadata: PhotoMetadata
  ): Promise<PhotoMetadata["_id"]> =>
    this.dbService.insert(DbCollection.PhotosMetadata, photoMetadata);
}
