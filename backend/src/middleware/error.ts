import type { NextFunction, Request, Response } from "express";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(err);

  if (err instanceof Error && err.message === "INSUFFICIENT_STOCK")
    return res
      .status(409)
      .json({ success: false, message: "Insufficient stock available" });
  return res
    .status(500)
    .json({ success: false, message: "Internal server error" });
}
