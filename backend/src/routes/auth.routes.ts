import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { signToken } from "../utils/jwt.js";
import { ok, fail } from "../utils/http.js";
import { audit } from "../services/audit.service.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return fail(res, "Invalid email or password", 401);

    const authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      baseId: user.baseId,
    };

    const token = signToken(authUser);
    await audit({
      userId: user.id,
      action: "LOGIN",
      module: "AUTH",
      referenceId: user.id,
      description: `User ${user.email} logged in`,
    });

    return ok(res, { token, user: authUser });
  } catch (e) {
    next(e);
  }
});

router.get("/me", authenticate, async (req, res) => ok(res, req.user));

export default router;
