import type { Prisma } from "@prisma/client";

export async function changeStock(
  tx: Prisma.TransactionClient,
  baseId: string,
  assetId: string,
  delta: number,
) {
  const row = await tx.inventory.upsert({
    where: { assetId_baseId: { assetId, baseId } },
    update: {},
    create: { assetId, baseId, openingBalance: 0, currentStock: 0 },
  });

  const next = row.currentStock + delta;

  if (next < 0) throw new Error("INSUFFICIENT_STOCK");

  return tx.inventory.update({
    where: { id: row.id },
    data: { currentStock: next },
  });
}
