import { verifyToken } from "../utils/jwt.js";
import type { NextFunction, Request, Response } from "express";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer "))
    return res
      .status(401)
      .json({ success: false, message: "Authentication required" });
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
}
