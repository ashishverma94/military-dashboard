import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authenticate } from "../middleware/auth.js";
import { allow, canAccessBase } from "../middleware/rbac.js";
import { ok, fail } from "../utils/http.js";
import { changeStock } from "../services/inventory.service.js";
import { audit } from "../services/audit.service.js";

const router = Router();
router.use(authenticate);
router.use(allow("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"));

const schema = z.object({
  assetId: z.string(),
  baseId: z.string(),
  quantity: z.number().int().positive(),
  purchaseDate: z.coerce.date(),
  supplier: z.string().optional(),
  remarks: z.string().optional(),
});

router.get("/", async (req, res, next) => {
  try {
    const baseId = req.query.baseId?.toString();
    if (req.user!.role !== "ADMIN" && baseId && !canAccessBase(baseId, req))
      return fail(res, "Base access denied", 403);

    const rows = await prisma.purchase.findMany({
      where: {
        ...(baseId
          ? { baseId }
          : req.user!.baseId
            ? { baseId: req.user!.baseId }
            : {}),
        ...(req.query.assetId ? { assetId: req.query.assetId.toString() } : {}),
        ...(req.query.from
          ? { purchaseDate: { gte: new Date(req.query.from.toString()) } }
          : {}),
      },
      include: { asset: true, base: true, addedBy: { select: { name: true } } },
      orderBy: { purchaseDate: "desc" },
    });

    return ok(res, rows);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = schema.parse(req.body);

    if (req.user!.role !== "ADMIN" && !canAccessBase(data.baseId, req))
      return fail(res, "Base access denied", 403);

    const result = await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.create({
        data: { ...data, addedById: req.user!.id },
      });
      await changeStock(tx, data.baseId, data.assetId, data.quantity);

      return purchase;
    });

    await audit({
      userId: req.user!.id,
      action: "CREATE",
      module: "PURCHASE",
      referenceId: result.id,
      description: `Purchased ${data.quantity} units`,
      newData: result,
    });

    return ok(res, result, 201);
  } catch (e) {
    next(e);
  }
});

export default router;
