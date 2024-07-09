import { inject, injectable } from "inversify";
import { Request, Response } from "express";

import { TYPES } from "../../inversify/index.js";
import { DbInterface } from "../../models/index.js";
import { PatchPhotoValidator } from "../../validators/photo.validator.js";
import { validateOrReject } from "class-validator";
import { DbCollection } from "../../models/db-collections.model.js";
import { ObjectId } from "mongodb";
import { PhotosService, EditPhotoService } from "../../services/index.js";

@injectable()
export class AdminPhotosController {
  constructor(
    @inject(TYPES.MongoDbService)
    private readonly dbService: DbInterface,
    @inject(TYPES.PhotosService)
    private readonly photosService: PhotosService,
    @inject(TYPES.EditPhotoService)
    private readonly editPhotoService: EditPhotoService
  ) {}
  public readonly createPhoto = async (req: Request, res: Response) => {
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

  public readonly patchPhoto = async (req: Request, res: Response) => {
    const data = new PatchPhotoValidator(req);
    await validateOrReject(data);
    const photoId = data.id;
    const maxSizeInMB = 2;
    const form = this.editPhotoService.initForm(photoId, maxSizeInMB);
    const photoMetadataPatch =
      await this.editPhotoService.getPhotoMetadataFromForm(req, photoId, form);
    const patchQuery =
      this.editPhotoService.photoMetadataPatchAdaptor(photoMetadataPatch);
    const filterQuery = this.photosService.photoMetadataFilterAdaptor({
      _id: photoId,
    });
    await this.dbService.patch(
      DbCollection.PhotosMetadata,
      filterQuery,
      patchQuery
    );
    res.json(true);
  };

  public readonly deletePhoto = async (req: Request, res: Response) => {
    const data = new PatchPhotoValidator(req);
    await validateOrReject(data);
    const photoId = data.id;
    const isSuccess = await this.editPhotoService.deletePhoto(photoId);
    res.json(isSuccess);
  };
}
