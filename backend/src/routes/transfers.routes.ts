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
  fromBaseId: z.string(),
  toBaseId: z.string(),
  quantity: z.number().int().positive(),
  transferDate: z.coerce.date(),
  remarks: z.string().optional(),
});

router.get("/", async (req, res, next) => {
  try {
    const baseId = req.query.baseId?.toString();

    if (req.user!.role !== "ADMIN" && baseId && !canAccessBase(baseId, req))
      return fail(res, "Base access denied", 403);

    const scope =
      req.user!.role === "ADMIN"
        ? baseId
          ? { OR: [{ fromBaseId: baseId }, { toBaseId: baseId }] }
          : {}
        : {
            OR: [
              { fromBaseId: req.user!.baseId! },
              { toBaseId: req.user!.baseId! },
            ],
          };

    const rows = await prisma.transfer.findMany({
      where: { ...scope },
      include: {
        asset: true,
        fromBase: true,
        toBase: true,
        initiatedBy: { select: { name: true } },
      },
      orderBy: { transferDate: "desc" },
    });

    return ok(res, rows);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = schema.parse(req.body);

    if (data.fromBaseId === data.toBaseId)
      return fail(res, "Source and destination bases must differ");
    if (
      req.user!.role !== "ADMIN" &&
      (!canAccessBase(data.fromBaseId, req) ||
        !canAccessBase(data.toBaseId, req))
    )
      return fail(res, "Base access denied", 403);

    const result = await prisma.$transaction(async (tx) => {
      const transfer = await tx.transfer.create({
        data: { ...data, initiatedById: req.user!.id },
      });
      await changeStock(tx, data.fromBaseId, data.assetId, -data.quantity);
      await changeStock(tx, data.toBaseId, data.assetId, data.quantity);
      return transfer;
    });

    await audit({
      userId: req.user!.id,
      action: "CREATE",
      module: "TRANSFER",
      referenceId: result.id,
      description: `Transferred ${data.quantity} units`,
      newData: result,
    });

    return ok(res, result, 201);
  } catch (e) {
    next(e);
  }
});

export default router;
