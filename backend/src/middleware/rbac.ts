import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";

export function allow(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role))
      return res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
    next();
  };
}

export function canAccessBase(baseId: string | undefined, req: Request) {
  if (!req.user || !baseId) return false;
  return req.user.role === "ADMIN" || req.user.baseId === baseId;
}
