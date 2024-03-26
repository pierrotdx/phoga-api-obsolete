import {
  IsDate,
  IsDefined,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { Request } from "express";
import { RenderParams, Sort } from "../models/search-params.model.js";
import { PhotoMetadataFilter } from "../models/photo-metadata.model.js";

export class GetPhotoValidator {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  id: string;

  @IsOptional()
  @IsInt()
  width?: number;

  @IsOptional()
  @IsInt()
  height?: number;

  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(100)
  quality?: number;

  constructor(req: Request) {
    this.id = req.params?.id;

    const query = req?.query as Record<string, string>;
    this.width = this.parseQueryParamIntoInt(query.width);
    this.height = this.parseQueryParamIntoInt(query.height);
    this.quality = this.parseQueryParamIntoInt(query.quality);
  }

  private parseQueryParamIntoInt = (param: string) =>
    param ? parseInt(param) : undefined;
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
