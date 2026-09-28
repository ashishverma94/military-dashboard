import { prisma } from "../config/prisma.js";
import type { AuditAction, AuditModule } from "@prisma/client";

export async function audit(input: {
  userId?: string;
  action: AuditAction;
  module: AuditModule;
  referenceId?: string;
  description: string;
  oldData?: unknown;
  newData?: unknown;
}) {
  return prisma.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      module: input.module,
      referenceId: input.referenceId,
      description: input.description,
      oldData: input.oldData as object | undefined,
      newData: input.newData as object | undefined,
    },
  });
}
