import { inject, injectable } from "inversify";
import { NextFunction, Request, Response } from "express";
import formidable, { Part } from "formidable";
import VolatileFile from "formidable/VolatileFile.js";

import { TYPES } from "../inversify/index.js";
import {
  DbInterface,
  PhotoFormatOptions as PhotoFormatOptions,
  PhotoMetadata,
} from "../models/index.js";
import {
  GetPhotoMetadataValidator,
  GetPhotoValidator,
  GetPhotosValidator,
} from "../validators/photo.validator.js";
import { validateOrReject } from "class-validator";
import { EnvService } from "../services/env.service.js";
import { DbCollection } from "../models/db-collections.model.js";
import { Filter, ObjectId } from "mongodb";
import { GcStorageService, PhotosService } from "../services/index.js";
import { pick } from "ramda";
import Formidable from "formidable/Formidable.js";

@injectable()
export class PhotosController {
  private readonly PHOTOS_BUCKET;

  constructor(
    @inject(TYPES.GcStorageService)
    private readonly cloudStorageService: GcStorageService,
    @inject(TYPES.MongoDbService)
    private readonly dbService: DbInterface,
    @inject(TYPES.PhotosService)
    private readonly photosService: PhotosService
  ) {
    this.PHOTOS_BUCKET = this.photosService.PHOTOS_BUCKET;
  }

  readonly getPhoto = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const data = new GetPhotoValidator(req);
    await validateOrReject(data);
    const photoBuffer = await this.photosService.getPhotoBuffer(
      data.id,
      this.PHOTOS_BUCKET
    );
    const photoFormatOptions: PhotoFormatOptions = pick(
      ["width", "height", "quality"],
      data
    );
    const photoFormatPipeline = this.photosService.getPhotoFormatPipeline({
      photoBuffer,
      photoFormatOptions,
      errorHandler: (err: Error) => {
        next(err);
      },
    });
    res.contentType("image/jpeg");
    photoFormatPipeline.pipe(res);
  };

  readonly getPhotoMetadata = async (req: Request, res: Response) => {
    const data = new GetPhotoMetadataValidator(req);
    await validateOrReject(data);
    const result = await this.dbService.getDocumentById(
      DbCollection.PhotosMetadata,
      data.id
    );
    res.json(result);
  };

  private readonly getNewFileName =
    (photoId: string) =>
    (name: string, ext: string, part: Part, form: Formidable) =>
      `${photoId}${ext}`;

  readonly createPhoto = async (req: Request, res: Response) => {
    const photoId = new ObjectId().toHexString();
    const maxSizeInMB = 2;
    const form = formidable({
      fileWriteStreamHandler: this.createPhotoWriteStreamHandler,
      filename: this.getNewFileName(photoId),
      keepExtensions: true,
      maxFileSize: maxSizeInMB * 1024 * 1024,
    });
    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];
    if (!file) {
      res.json(false);
      return;
    }
    const photoMetadata: PhotoMetadata = {
      _id: photoId,
      filename: file.newFilename,
    };
    if (fields.description) {
      photoMetadata.description = fields.description[0];
    }
    if (fields.titles?.length) {
      photoMetadata.titles = fields.titles;
    }
    await this.photosService.insertPhotoMetadataInDb(photoMetadata);
    res.json(true);
  };

  private readonly createPhotoWriteStreamHandler = (file?: VolatileFile) => {
    if (!file) {
      throw new Error("no file to upload");
    }

    const fileName = file.toJSON().newFilename || "";
    if (!fileName) {
      throw new Error("no file name");
    }

    const destStream = this.cloudStorageService.streamUploadFile(
      {
        bucketName: this.PHOTOS_BUCKET,
        fileName,
      },
      { isPublic: true }
    );

    return destStream;
  };

  getPhotos = async (req: Request, res: Response) => {
    const { filter, render } = new GetPhotosValidator(req);
    const mongoFilter = this.dbService.photoMetadataFilterAdaptor(
      filter
    ) as Filter<PhotoMetadata>;
    const result = await this.dbService.search(
      DbCollection.PhotosMetadata,
      mongoFilter,
      render
    );
    res.json(result);
  };
}
