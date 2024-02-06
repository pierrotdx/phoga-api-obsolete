import { injectable } from "inversify";
import { DumbInterface } from "../models/index.js";

@injectable()
export class DumbBService implements DumbInterface {
  log = () => {
    console.log("creating dumb B service");
  };
}
