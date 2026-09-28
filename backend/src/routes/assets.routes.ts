import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authenticate } from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import { ok } from "../utils/http.js";
import { audit } from "../services/audit.service.js";

const router = Router();

router.use(authenticate);

const schema = z.object({
  name: z.string().min(2),
  type: z.enum(["WEAPON", "VEHICLE", "AMMUNITION", "OTHER"]),
  unit: z.string().min(1),
  description: z.string().optional(),
});

router.get("/", async (_req, res, next) => {
  try {
    return ok(res, await prisma.asset.findMany({ orderBy: { name: "asc" } }));
  } catch (e) {
    next(e);
  }
});

router.post("/", allow("ADMIN"), async (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    const asset = await prisma.asset.create({ data });
    await audit({
      userId: req.user!.id,
      action: "CREATE",
      module: "ASSET",
      referenceId: asset.id,
      description: `Created asset ${asset.name}`,
      newData: asset,
    });
    return ok(res, asset, 201);
  } catch (e) {
    next(e);
  }
});

export default router;
