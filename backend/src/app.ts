import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import assetsRoutes from "./routes/assets.routes.js";
import basesRoutes from "./routes/bases.routes.js";
import usersRoutes from "./routes/users.routes.js";
import purchasesRoutes from "./routes/purchases.routes.js";
import transfersRoutes from "./routes/transfers.routes.js";
import assignmentsRoutes from "./routes/assignments.routes.js";
import expendituresRoutes from "./routes/expenditures.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import { errorHandler } from "./middleware/error.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("combined"));
app.get("/health", (_req, res) =>
  res.json({
    success: true,
    status: "ok",
    service: "military-asset-management-api",
  }),
);

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/assets", assetsRoutes);
app.use("/api/bases", basesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/purchases", purchasesRoutes);
app.use("/api/transfers", transfersRoutes);
app.use("/api/assignments", assignmentsRoutes);
app.use("/api/expenditures", expendituresRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use(errorHandler);
export default app;
