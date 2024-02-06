import { injectable } from "inversify";
import { DumbInterface } from "../models/index.js";

@injectable()
export class DumbAService implements DumbInterface {
  log = () => {
    console.log("creating dumb A service");
  };
}
