import { IsDefined, IsNotEmpty, IsString } from "class-validator";
import { Request } from "express";

export class GetPhotoValidator {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  name: string;

  constructor(req: Request) {
    this.name = req.params?.name;
  }
}
