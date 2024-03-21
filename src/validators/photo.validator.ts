import {
  IsDate,
  IsDefined,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
} from "class-validator";
import { Request } from "express";
import { RenderParams, Sort } from "../models/search-params.model.js";
import { PhotoMetadataFilter } from "../models/photo-metadata.model.js";

export class GetPhotoValidator {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  id: string;

  constructor(req: Request) {
    this.id = req.params?.id;
  }
}

export class GetPhotoMetadataValidator {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  id: string;

  constructor(req: Request) {
    this.id = req?.params?.id;
  }
}

export class GetPhotosValidator {
  @IsString()
  title?: string;

  @IsDate()
  minDate?: Date;

  @IsDate()
  maxDate?: Date;

  @IsInt()
  size?: number;

  @IsEnum(Sort)
  sort?: Sort;

  @IsString()
  filename?: string;

  filter: PhotoMetadataFilter = {};
  render: RenderParams = {};

  constructor(req: Request) {
    const query = req?.query as Record<string, string>;
    if (!query) {
      return;
    }

    this.title = query.title;
    this.filter.title = this.title;

    this.filename = query.filename;
    this.filter.filename = this.filename;

    if (query.minDate) {
      this.minDate = new Date(query.minDate);
      this.filter.minDate = this.minDate;
    }

    if (query.maxDate) {
      this.maxDate = new Date(query.maxDate);
      this.filter.maxDate = this.maxDate;
    }

    if (query.size) {
      this.size = parseInt(query.size);
      this.render.size = this.size;
    }

    if (query.sort) {
      this.sort = query.sort as Sort;
      this.render.sort = this.sort;
    }
  }
}
