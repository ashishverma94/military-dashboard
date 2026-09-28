import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authenticate } from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import { ok } from "../utils/http.js";
import { audit } from "../services/audit.service.js";

const router = Router();
router.use(authenticate);
router.use(allow("ADMIN"));

router.get("/", async (_req, res, next) => {
  try {
    return ok(
      res,
      await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          baseId: true,
          base: { select: { name: true } },
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    );
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = z
      .object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(8),
        role: z.enum(["ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"]),
        baseId: z.string().nullable().optional(),
      })
      .parse(req.body);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: await bcrypt.hash(data.password, 12),
        role: data.role,
        baseId: data.role === "ADMIN" ? null : (data.baseId ?? null),
      },
    });

    await audit({
      userId: req.user!.id,
      action: "CREATE",
      module: "USER",
      referenceId: user.id,
      description: `Created user ${user.email}`,
    });

    return ok(
      res,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        baseId: user.baseId,
      },
      201,
    );
  } catch (e) {
    next(e);
  }
});

export default router;
