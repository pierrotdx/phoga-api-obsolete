import { inject, injectable } from "inversify";
import { TYPES } from "../types.js";
import { DumbAService } from "../services/dumbA.service.js";
import { Request, Response } from "express";

@injectable()
export class DumbController {
  constructor(
    @inject(TYPES.DumbAService) private readonly dumbAService: DumbAService
  ) {
    this.dumbAService = dumbAService;
  }

  public readonly home = (req: Request, res: Response) => {
    this.dumbAService.log();
    res.send("dumb router home");
  };
}
