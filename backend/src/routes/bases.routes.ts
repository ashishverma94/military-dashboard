import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authenticate } from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import { ok } from "../utils/http.js";
import { audit } from "../services/audit.service.js";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const bases = await prisma.base.findMany({ orderBy: { name: "asc" } });
    return ok(res, bases);
  } catch (e) {
    next(e);
  }
});

router.post("/", allow("ADMIN"), async (req, res, next) => {
  try {
    const data = z
      .object({ name: z.string().min(2), location: z.string().min(2) })
      .parse(req.body);
    const base = await prisma.base.create({ data });

    await audit({
      userId: req.user!.id,
      action: "CREATE",
      module: "BASE",
      referenceId: base.id,
      description: `Created base ${base.name}`,
      newData: base,
    });

    return ok(res, base, 201);
  } catch (e) {
    next(e);
  }
});

export default router;
