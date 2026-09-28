import { PrismaClient, Role, EquipmentType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("ChangeMe@123", 12);
  const [north, west, desert] = await Promise.all([
    prisma.base.upsert({
      where: { name: "North Command Base" },
      update: {},
      create: { name: "North Command Base", location: "Chandigarh" },
    }),
    prisma.base.upsert({
      where: { name: "Western Logistics Base" },
      update: {},
      create: { name: "Western Logistics Base", location: "Jaisalmer" },
    }),
    prisma.base.upsert({
      where: { name: "Desert Operations Base" },
      update: {},
      create: { name: "Desert Operations Base", location: "Jodhpur" },
    }),
  ]);

  const assets = await Promise.all([
    prisma.asset.upsert({
      where: { id: "seed-rifle" },
      update: {},
      create: {
        id: "seed-rifle",
        name: "Service Rifle",
        type: EquipmentType.WEAPON,
        unit: "Piece",
        description: "Standard service rifle inventory item",
      },
    }),
    prisma.asset.upsert({
      where: { id: "seed-truck" },
      update: {},
      create: {
        id: "seed-truck",
        name: "Utility Truck",
        type: EquipmentType.VEHICLE,
        unit: "Vehicle",
        description: "General logistics vehicle",
      },
    }),
    prisma.asset.upsert({
      where: { id: "seed-ammo" },
      update: {},
      create: {
        id: "seed-ammo",
        name: "5.56mm Ammunition",
        type: EquipmentType.AMMUNITION,
        unit: "Box",
        description: "Training and operational ammunition stock",
      },
    }),
  ]);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@military.local" },
      update: { passwordHash, role: Role.ADMIN },
      create: {
        name: "System Administrator",
        email: "admin@military.local",
        passwordHash,
        role: Role.ADMIN,
      },
    }),
    prisma.user.upsert({
      where: { email: "commander@military.local" },
      update: { passwordHash, role: Role.BASE_COMMANDER, baseId: north.id },
      create: {
        name: "North Base Commander",
        email: "commander@military.local",
        passwordHash,
        role: Role.BASE_COMMANDER,
        baseId: north.id,
      },
    }),
    prisma.user.upsert({
      where: { email: "logistics@military.local" },
      update: { passwordHash, role: Role.LOGISTICS_OFFICER, baseId: west.id },
      create: {
        name: "Logistics Officer",
        email: "logistics@military.local",
        passwordHash,
        role: Role.LOGISTICS_OFFICER,
        baseId: west.id,
      },
    }),
  ]);

  for (const base of [north, west, desert]) {
    for (const asset of assets) {
      const opening =
        base.id === north.id && asset.id === "seed-rifle"
          ? 200
          : base.id === west.id && asset.id === "seed-ammo"
            ? 500
            : 50;
      await prisma.inventory.upsert({
        where: { assetId_baseId: { assetId: asset.id, baseId: base.id } },
        update: {},
        create: {
          assetId: asset.id,
          baseId: base.id,
          openingBalance: opening,
          currentStock: opening,
        },
      });
    }
  }

  console.log(
    `Seeded ${users.length} users, ${assets.length} assets and ${3 * assets.length} inventory rows.`,
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
