import { inject, injectable } from "inversify";
import { NextFunction, Request, Response } from "express";

import { TYPES } from "../inversify/index.js";
import {
  DbInterface,
  PhotoFormatOptions,
  PhotoMetadata,
} from "../models/index.js";
import {
  GetPhotoMetadataValidator,
  GetPhotoValidator,
  GetPhotosValidator,
  PatchPhotoValidator,
} from "../validators/photo.validator.js";
import { validateOrReject } from "class-validator";
import { DbCollection } from "../models/db-collections.model.js";
import { Filter, ObjectId } from "mongodb";
import { PhotosService, EditPhotoService } from "../services/index.js";
import { pick } from "ramda";

@injectable()
export class PhotosController {
  private readonly PHOTOS_BUCKET: string;

  constructor(
    @inject(TYPES.MongoDbService)
    private readonly dbService: DbInterface,
    @inject(TYPES.PhotosService)
    private readonly photosService: PhotosService,
    @inject(TYPES.UpdatePhotoService)
    private readonly editPhotoService: EditPhotoService
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
    const photoId = new ObjectId().toHexString();
    const maxSizeInMB = 2;
    const form = this.editPhotoService.initForm(photoId, maxSizeInMB);
    const photoMetadata = await this.editPhotoService.getPhotoMetadataFromForm(
      req,
      photoId,
      form
    );
    await this.photosService.insertPhotoMetadataInDb(photoMetadata);
    res.json(true);
  };

  patchPhoto = async (req: Request, res: Response) => {
    const data = new PatchPhotoValidator(req);
    await validateOrReject(data);
    const photoId = data.id;
    const maxSizeInMB = 2;
    const form = this.editPhotoService.initForm(photoId, maxSizeInMB);
    const photoMetadataPatch =
      await this.editPhotoService.getPhotoMetadataFromForm(req, photoId, form);
    const patchQuery =
      this.editPhotoService.photoMetadataPatchAdaptor(photoMetadataPatch);
    const filterQuery = this.editPhotoService.photoMetadataFilterAdaptor({
      _id: photoId,
    });
    await this.dbService.patch(
      DbCollection.PhotosMetadata,
      filterQuery,
      patchQuery
    );
    res.json(true);
  };

  getPhotos = async (req: Request, res: Response) => {
    const { filter, render } = new GetPhotosValidator(req);
    const mongoFilter = this.editPhotoService.photoMetadataFilterAdaptor(
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
