import { inject, injectable } from "inversify";
import sharp from "sharp";
import {
  CloudStorageInterface,
  EnvInterface,
  PhotoFormatOptions,
} from "../models/index.js";
import { TYPES } from "../inversify/index.js";
import { Readable } from "stream";
import { EnvService } from "./env.service.js";

@injectable()
export class PhotosService {
  public readonly PHOTOS_BUCKET;

  constructor(
    @inject(TYPES.EnvService) private readonly envService: EnvService,
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
    pipeline.webp({ quality });
    if (width && height) {
      pipeline.resize(width, height);
    }
    return pipeline;
  };
}
