import { injectable } from "inversify";
import { Request, Response } from "express";

@injectable()
export class DumbController {
  constructor() {}

  public readonly home = (req: Request, res: Response) => {
    res.send("dumb router home");
  };
}
