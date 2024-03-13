import { IsDefined, IsNotEmpty, IsString } from "class-validator";
import { Request } from "express";

export class GetPhotoValidator {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  id: string;

  constructor(req: Request) {
    this.id = req.params?.id;
  }
}

export class GetPhotoDataValidator {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  id: string;

  constructor(req: Request) {
    this.id = req?.params?.id;
  }
}
