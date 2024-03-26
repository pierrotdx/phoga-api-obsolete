import { inject, injectable } from "inversify";
import { NextFunction, Request, Response } from "express";
import formidable from "formidable";
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
import { Filter } from "mongodb";
import { GcStorageService, PhotosService } from "../services/index.js";
import { pick } from "ramda";

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

  readonly createPhoto = async (req: Request, res: Response) => {
    const form = formidable({
      fileWriteStreamHandler: this.createPhotoWriteStreamHandler,
    });
    await form.parse(req);
    res.json(true);
  };

  private readonly createPhotoWriteStreamHandler = (file?: VolatileFile) => {
    if (!file) {
      throw new Error("no file to upload");
    }

    const fileName = file.toJSON().originalFilename || "";
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
