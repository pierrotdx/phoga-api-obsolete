import formidable, { Part } from "formidable";
import { inject, injectable } from "inversify";
import { GcStorageService } from "./google-cloud/index.js";
import { TYPES } from "../inversify/types.js";
import { PhotoMetadata, PhotoMetadataFilter } from "../models/index.js";
import { Request } from "express";
import Formidable from "formidable/Formidable.js";
import VolatileFile from "formidable/VolatileFile.js";
import { PhotosService } from "./index.js";
import IncomingForm from "formidable/Formidable.js";
import { Filter, UpdateFilter } from "mongodb";

@injectable()
export class EditPhotoService {
  private readonly PHOTOS_BUCKET: string;
  constructor(
    @inject(TYPES.GcStorageService)
    private readonly cloudStorageService: GcStorageService,
    @inject(TYPES.PhotosService)
    private readonly photosService: PhotosService
  ) {
    this.PHOTOS_BUCKET = this.photosService.PHOTOS_BUCKET;
  }

  public readonly initForm = (
    photoId: string,
    maxSizeInMB: number
  ): IncomingForm =>
    formidable({
      fileWriteStreamHandler: this.createPhotoWriteStreamHandler,
      filename: this.getNewFileName(photoId),
      filter: this.filterFile,
      keepExtensions: true,
      maxFileSize: maxSizeInMB * 1024 * 1024,
    });

  public readonly getPhotoMetadataFromForm = async (
    req: Request,
    photoId: string,
    form: IncomingForm
  ): Promise<PhotoMetadata> => {
    const [fields, files] = await form.parse(req);
    const photoMetadata: PhotoMetadata = {
      _id: photoId,
    };
    if (fields.description) {
      photoMetadata.description = fields.description[0];
    }
    if (fields.titles) {
      photoMetadata.titles = fields.titles[0].split(",");
    }
    if (fields.latitude?.[0] && fields.longitude?.[0]) {
      const geoLocation: PhotoMetadata["geoLocation"] = {
        latitude: Number.parseFloat(fields.latitude[0]),
        longitude: parseFloat(fields.longitude[0]),
      };
      photoMetadata.geoLocation = geoLocation;
    }
    if (fields.date?.[0]) {
      const date = new Date(fields.date?.[0]);
      photoMetadata.date = date;
    }
    return photoMetadata;
  };

  private readonly getNewFileName =
    (photoId: string) =>
    (name: string, ext: string, part: Part, form: Formidable) =>
      `${photoId}${ext}`;

  private readonly filterFile = (part: formidable.Part) => {
    const fileField = "file";
    return part.name === fileField;
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

  photoMetadataFilterAdaptor = (
    filter: PhotoMetadataFilter
  ): Filter<PhotoMetadata> => {
    if (!filter) {
      throw new Error("no filter params");
    }
    const mongoFilter: Filter<PhotoMetadata> = {};
    if (filter._id) {
      mongoFilter._id = filter._id;
    }
    if (filter.minDate) {
      mongoFilter.date = { $gte: filter.minDate };
    }
    if (filter.maxDate) {
      mongoFilter.date = mongoFilter.date
        ? { $and: [mongoFilter.date, { $lte: filter.maxDate }] }
        : { $lte: filter.maxDate };
    }
    if (filter.title) {
      mongoFilter.titles = filter.title;
    }
    if (filter.filename) {
      mongoFilter.filename = { $regex: filter.filename };
    }
    return mongoFilter;
  };

  photoMetadataPatchAdaptor = (
    patch: Partial<PhotoMetadata>
  ): UpdateFilter<PhotoMetadata> => {
    const patchQuery: UpdateFilter<PhotoMetadata> = {};
    const manifestUpdate = { "manifest.last_update.when": new Date() };
    const fieldsToSet = { ...manifestUpdate, ...patch };
    if (fieldsToSet._id) {
      delete fieldsToSet._id;
    }
    patchQuery.$set = fieldsToSet;
    return patchQuery;
  };
}
