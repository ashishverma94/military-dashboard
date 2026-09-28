import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { authenticate } from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import { ok } from "../utils/http.js";

const router = Router();

router.use(authenticate, allow("ADMIN"));

router.get("/", async (req, res, next) => {
  try {
    return ok(
      res,

      await prisma.auditLog.findMany({
        include: { user: { select: { name: true, email: true, role: true } } },
        orderBy: { timestamp: "desc" },
        take: 200,
      }),
    );
  } catch (e) {
    next(e);
  }
});

export default router;
