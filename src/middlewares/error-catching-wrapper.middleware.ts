import { NextFunction, Request, RequestHandler, Response } from "express";

export const errorCatchingWrapper =
  (fn: RequestHandler) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await (fn as any)(req, res, next);
    } catch (err) {
      next(err);
    }
  };
