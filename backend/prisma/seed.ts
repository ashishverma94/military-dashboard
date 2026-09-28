import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding demo accounts...");

  const passwordHash = await bcrypt.hash("admin123", 10);

  // Optional: remove existing demo accounts
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          "admin@gmail.com",
          "commander@gmail.com",
          "logistics@gmail.com",
        ],
      },
    },
  });

  // Get bases for commander/logistics accounts
  const bases = await prisma.base.findMany({
    orderBy: {
      createdAt: "asc",
    },
    take: 2,
  });

  // Create a demo base if none exists
  let base1 = bases[0];

  if (!base1) {
    base1 = await prisma.base.create({
      data: {
        name: "Alpha Base",
        location: "Demo Location",
      },
    });
  }

  let base2 = bases[1];

  if (!base2) {
    base2 = await prisma.base.create({
      data: {
        name: "Bravo Base",
        location: "Demo Location",
      },
    });
  }

  // Admin
  await prisma.user.create({
    data: {
      name: "Demo Admin",
      email: "admin@gmail.com",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // Base Commander
  await prisma.user.create({
    data: {
      name: "Demo Commander",
      email: "commander@gmail.com",
      passwordHash,
      role: Role.BASE_COMMANDER,
      baseId: base1.id,
    },
  });

  // Logistics Officer
  await prisma.user.create({
    data: {
      name: "Demo Logistics",
      email: "logistics@gmail.com",
      passwordHash,
      role: Role.LOGISTICS_OFFICER,
      baseId: base2.id,
    },
  });

  console.log("✅ Demo accounts created successfully!");
  console.log("");
  console.log("Admin:");
  console.log("  admin@gmail.com / admin123");
  console.log("");
  console.log("Base Commander:");
  console.log("  commander@gmail.com / admin123");
  console.log("");
  console.log("Logistics Officer:");
  console.log("  logistics@gmail.com / admin123");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });