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
router.use(allow("ADMIN", "BASE_COMMANDER"));

const schema = z.object({
  assetId: z.string(),
  baseId: z.string(),
  quantity: z.number().int().positive(),
  reason: z.string().min(2),
  expenditureDate: z.coerce.date(),
  remarks: z.string().optional(),
});

router.get("/", async (req, res, next) => {
  try {
    const baseId = req.query.baseId?.toString();
    if (req.user!.role !== "ADMIN" && baseId && !canAccessBase(baseId, req))
      return fail(res, "Base access denied", 403);

    return ok(
      res,
      await prisma.expenditure.findMany({
        where:
          req.user!.role === "ADMIN"
            ? baseId
              ? { baseId }
              : {}
            : { baseId: req.user!.baseId! },
        include: {
          asset: true,
          base: true,
          expendedBy: { select: { name: true } },
        },
        orderBy: { expenditureDate: "desc" },
      }),
    );
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = schema.parse(req.body);

    if (!canAccessBase(data.baseId, req))
      return fail(res, "Base access denied", 403);

    const result = await prisma.$transaction(async (tx) => {
      const row = await tx.expenditure.create({
        data: { ...data, expendedById: req.user!.id },
      });
      await changeStock(tx, data.baseId, data.assetId, -data.quantity);
      return row;
    });

    await audit({
      userId: req.user!.id,
      action: "CREATE",
      module: "EXPENDITURE",
      referenceId: result.id,
      description: `Expended ${data.quantity} units`,
      newData: result,
    });

    return ok(res, result, 201);
  } catch (e) {
    next(e);
  }
});

export default router;
