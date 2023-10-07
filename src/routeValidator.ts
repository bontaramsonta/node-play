import z from "zod";
import { HttpCodes } from "./enums";
import { NextFunction, Request, Response } from "express";

export const val = (
  scope: "body" | "query" | "params",
  schema: z.ZodObject<any, any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[scope]);
    if (result.success) {
      req[scope] = result.data;
      next();
    } else {
      res.status(HttpCodes.VALIDATION_ERROR).json({
        message: "Validation failed",
        errors: result.error.errors.map(
          (error) => `${error.path}: ${error.message}`
        ),
      });
    }
  };
};
