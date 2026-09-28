import { Router } from "express";
import { z } from "zod";

import { prisma } from "../config/prisma.js";
import { authenticate } from "../middleware/auth.js";
import { ok, fail } from "../utils/http.js";
import { canAccessBase } from "../middleware/rbac.js";

const router = Router();

router.use(authenticate);

/**
 * ---------------------------------------------------------
 * QUERY SCHEMA
 * ---------------------------------------------------------
 */

const qSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  baseId: z.string().optional(),
  assetId: z.string().optional(),
});

/**
 * ---------------------------------------------------------
 * DATE HELPERS
 * ---------------------------------------------------------
 *
 * The frontend sends:
 *
 *   2026-09-28
 *
 * If we directly use:
 *
 *   new Date("2026-09-28")
 *
 * it represents the beginning of the day.
 *
 * That means:
 *
 *   purchaseDate <= 2026-09-28 00:00:00
 *
 * excludes purchases made at 10:00, 14:00, etc.
 *
 * We therefore convert:
 *
 * from -> beginning of day
 * to   -> end of day
 */

function startOfDay(value?: string) {
  if (!value) {
    const date = new Date();

    date.setHours(0, 0, 0, 0);

    return date;
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid from date");
  }

  date.setHours(0, 0, 0, 0);

  return date;
}

function endOfDay(value?: string) {
  if (!value) {
    return new Date();
  }

  const date = new Date(`${value}T23:59:59.999`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid to date");
  }

  return date;
}

/**
 * ---------------------------------------------------------
 * SUM HELPER
 * ---------------------------------------------------------
 */

function sum(rows: { quantity: number }[]) {
  return rows.reduce((total, row) => total + row.quantity, 0);
}

/**
 * ---------------------------------------------------------
 * DASHBOARD
 * ---------------------------------------------------------
 */

router.get("/", async (req, res, next) => {
  try {
    const q = qSchema.parse(req.query);

    const from = startOfDay(q.from);
    const to = endOfDay(q.to);

    /**
     * -----------------------------------------------------
     * BASE ACCESS
     * -----------------------------------------------------
     */

    if (q.baseId && !canAccessBase(q.baseId, req)) {
      return fail(res, "Base access denied", 403);
    }

    /**
     * Admin:
     *
     *   no baseId -> all bases
     *
     *   baseId -> selected base
     *
     * Non-admin:
     *
     *   always assigned base
     */

    const baseFilter =
      req.user!.role === "ADMIN"
        ? q.baseId
          ? { baseId: q.baseId }
          : {}
        : {
            baseId: req.user!.baseId!,
          };

    const assetFilter = q.assetId
      ? {
          assetId: q.assetId,
        }
      : {};

    /**
     * -----------------------------------------------------
     * CURRENT PERIOD TRANSACTIONS
     * -----------------------------------------------------
     */

    const [
      inventory,
      purchases,
      transfersIn,
      transfersOut,
      assignments,
      expenditures,
    ] = await Promise.all([
      prisma.inventory.findMany({
        where: {
          ...baseFilter,
          ...assetFilter,
        },
        include: {
          asset: true,
          base: true,
        },
        orderBy: {
          lastUpdated: "desc",
        },
      }),

      prisma.purchase.findMany({
        where: {
          ...baseFilter,
          ...assetFilter,
          purchaseDate: {
            gte: from,
            lte: to,
          },
        },

        include: {
          asset: true,
          base: true,
        },

        orderBy: {
          purchaseDate: "desc",
        },
      }),

      prisma.transfer.findMany({
        where: {
          ...assetFilter,

          ...(baseFilter.baseId
            ? {
                toBaseId: baseFilter.baseId,
              }
            : {}),

          transferDate: {
            gte: from,
            lte: to,
          },
        },

        include: {
          asset: true,
          fromBase: true,
          toBase: true,
        },

        orderBy: {
          transferDate: "desc",
        },
      }),

      prisma.transfer.findMany({
        where: {
          ...assetFilter,

          ...(baseFilter.baseId
            ? {
                fromBaseId: baseFilter.baseId,
              }
            : {}),

          transferDate: {
            gte: from,
            lte: to,
          },
        },

        include: {
          asset: true,
          fromBase: true,
          toBase: true,
        },

        orderBy: {
          transferDate: "desc",
        },
      }),

      prisma.assignment.findMany({
        where: {
          ...baseFilter,
          ...assetFilter,
          assignmentDate: {
            gte: from,
            lte: to,
          },
        },

        include: {
          asset: true,
          base: true,
        },

        orderBy: {
          assignmentDate: "desc",
        },
      }),

      prisma.expenditure.findMany({
        where: {
          ...baseFilter,
          ...assetFilter,
          expenditureDate: {
            gte: from,
            lte: to,
          },
        },

        include: {
          asset: true,
          base: true,
        },

        orderBy: {
          expenditureDate: "desc",
        },
      }),
    ]);

    /**
     * -----------------------------------------------------
     * TRANSACTIONS BEFORE SELECTED PERIOD
     * -----------------------------------------------------
     *
     * Used to calculate opening balance.
     */

    const [
      beforePurchases,
      beforeTransfersIn,
      beforeTransfersOut,
      beforeAssignments,
      beforeExpenditures,
    ] = await Promise.all([
      prisma.purchase.findMany({
        where: {
          ...baseFilter,
          ...assetFilter,
          purchaseDate: {
            lt: from,
          },
        },

        select: {
          quantity: true,
        },
      }),

      prisma.transfer.findMany({
        where: {
          ...assetFilter,

          ...(baseFilter.baseId
            ? {
                toBaseId: baseFilter.baseId,
              }
            : {}),

          transferDate: {
            lt: from,
          },
        },

        select: {
          quantity: true,
        },
      }),

      prisma.transfer.findMany({
        where: {
          ...assetFilter,

          ...(baseFilter.baseId
            ? {
                fromBaseId: baseFilter.baseId,
              }
            : {}),

          transferDate: {
            lt: from,
          },
        },

        select: {
          quantity: true,
        },
      }),

      prisma.assignment.findMany({
        where: {
          ...baseFilter,
          ...assetFilter,
          assignmentDate: {
            lt: from,
          },
        },

        select: {
          quantity: true,
        },
      }),

      prisma.expenditure.findMany({
        where: {
          ...baseFilter,
          ...assetFilter,
          expenditureDate: {
            lt: from,
          },
        },

        select: {
          quantity: true,
        },
      }),
    ]);

    /**
     * -----------------------------------------------------
     * OPENING BALANCE
     * -----------------------------------------------------
     */

    const inventoryBaseline = inventory.reduce(
      (total, row) => total + row.openingBalance,
      0,
    );

    const openingBalance =
      inventoryBaseline +
      sum(beforePurchases) +
      sum(beforeTransfersIn) -
      sum(beforeTransfersOut) -
      sum(beforeAssignments) -
      sum(beforeExpenditures);

    /**
     * -----------------------------------------------------
     * PERIOD TOTALS
     * -----------------------------------------------------
     */

    const purchaseTotal = sum(purchases);

    const transferInTotal = sum(transfersIn);

    const transferOutTotal = sum(transfersOut);

    const assignedTotal = sum(assignments);

    const expendedTotal = sum(expenditures);

    /**
     * -----------------------------------------------------
     * NET MOVEMENT
     * -----------------------------------------------------
     *
     * Purchases
     * + Transfer In
     * - Transfer Out
     */

    const netMovement = purchaseTotal + transferInTotal - transferOutTotal;

    /**
     * -----------------------------------------------------
     * CLOSING BALANCE
     * -----------------------------------------------------
     */

    const closingBalance =
      openingBalance + netMovement - assignedTotal - expendedTotal;

    /**
     * -----------------------------------------------------
     * RESPONSE
     * -----------------------------------------------------
     */

    return ok(res, {
      period: {
        from,
        to,
      },

      metrics: {
        openingBalance,
        closingBalance,

        netMovement,

        purchases: purchaseTotal,

        transferIn: transferInTotal,

        transferOut: transferOutTotal,

        assigned: assignedTotal,

        expended: expendedTotal,
      },

      details: {
        purchases,
        transfersIn,
        transfersOut,
      },

      inventory,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * ---------------------------------------------------------
 * NET MOVEMENT DETAILS
 * ---------------------------------------------------------
 */

router.get("/net-movement", async (req, res, next) => {
  try {
    const q = qSchema.parse(req.query);

    const from = startOfDay(q.from);
    const to = endOfDay(q.to);

    if (q.baseId && !canAccessBase(q.baseId, req)) {
      return fail(res, "Base access denied", 403);
    }

    const baseFilter =
      req.user!.role === "ADMIN"
        ? q.baseId
          ? { baseId: q.baseId }
          : {}
        : {
            baseId: req.user!.baseId!,
          };

    const assetFilter = q.assetId
      ? {
          assetId: q.assetId,
        }
      : {};

    const [purchases, incoming, outgoing] = await Promise.all([
      prisma.purchase.findMany({
        where: {
          ...baseFilter,
          ...assetFilter,

          purchaseDate: {
            gte: from,
            lte: to,
          },
        },

        include: {
          asset: true,
          base: true,
        },

        orderBy: {
          purchaseDate: "desc",
        },
      }),

      prisma.transfer.findMany({
        where: {
          ...assetFilter,

          ...(baseFilter.baseId
            ? {
                toBaseId: baseFilter.baseId,
              }
            : {}),

          transferDate: {
            gte: from,
            lte: to,
          },
        },

        include: {
          asset: true,
          fromBase: true,
          toBase: true,
        },

        orderBy: {
          transferDate: "desc",
        },
      }),

      prisma.transfer.findMany({
        where: {
          ...assetFilter,

          ...(baseFilter.baseId
            ? {
                fromBaseId: baseFilter.baseId,
              }
            : {}),

          transferDate: {
            gte: from,
            lte: to,
          },
        },

        include: {
          asset: true,
          fromBase: true,
          toBase: true,
        },

        orderBy: {
          transferDate: "desc",
        },
      }),
    ]);

    return ok(res, {
      purchases,
      incoming,
      outgoing,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
