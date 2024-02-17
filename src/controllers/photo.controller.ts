import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import formidable from "formidable";
import VolatileFile from "formidable/VolatileFile.js";

import { TYPES } from "../types.js";
import { CloudStorageInterface, PHOTOS_BUCKET } from "../models/index.js";
import { GetPhotoValidator } from "../validators/photo.validator.js";
import { validateOrReject } from "class-validator";

@injectable()
export class PhotoController {
  constructor(
    @inject(TYPES.GoogleStorageService)
    private readonly cloudStorageService: CloudStorageInterface
  ) {}

  readonly getPhoto = async (req: Request, res: Response) => {
    try {
      const validator = new GetPhotoValidator(req);
      await validateOrReject(validator);
      const photoReadable = await this.cloudStorageService.getFile(
        validator.name,
        PHOTOS_BUCKET
      );
      res.json(photoReadable);
    } catch (err) {
      console.error(err);
      res.json(err);
    }
  };

  readonly createPhoto = async (req: Request, res: Response) => {
    try {
      const form = formidable({
        fileWriteStreamHandler: this.createPhotoWriteStreamHandler,
      });
      await form.parse(req);
      res.json(true);
    } catch (err) {
      console.error(err);
      res.json(err);
    }
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
        bucketName: PHOTOS_BUCKET,
        fileName,
      },
      { isPublic: true }
    );

    return destStream;
  };
}
