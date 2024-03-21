export type FilterParams = Record<string, any>;

export interface RenderParams {
  size?: number;
  sort?: Sort;
}

export enum Sort {
  Asc = "asc",
  Desc = "desc",
}
