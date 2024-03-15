import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import formidable from "formidable";
import VolatileFile from "formidable/VolatileFile.js";

import { TYPES } from "../inversify/index.js";
import {
  CloudStorageInterface,
  DbInterface,
  PhotoMetadata,
} from "../models/index.js";
import {
  GetPhotoDataValidator,
  GetPhotoValidator,
} from "../validators/photo.validator.js";
import { validateOrReject } from "class-validator";
import { EnvService } from "../services/env.service.js";
import { DbCollection } from "../models/db-collections.model.js";

@injectable()
export class PhotoController {
  private readonly PHOTOS_BUCKET;

  constructor(
    @inject(TYPES.GcStorageService)
    private readonly cloudStorageService: CloudStorageInterface,
    @inject(TYPES.MongoDbService)
    private readonly dbService: DbInterface,
    @inject(TYPES.EnvService) private readonly envService: EnvService
  ) {
    this.PHOTOS_BUCKET = this.envService.PHOTOS_BUCKET;
  }

  readonly getPhoto = async (req: Request, res: Response) => {
    const data = new GetPhotoValidator(req);
    await validateOrReject(data);
    const photoReadable = await this.cloudStorageService.streamReadFile(
      data.id,
      this.PHOTOS_BUCKET
    );
    res.json(photoReadable);
  };

  readonly getPhotoMetadata = async (req: Request, res: Response) => {
    const data = new GetPhotoDataValidator(req);
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
}
