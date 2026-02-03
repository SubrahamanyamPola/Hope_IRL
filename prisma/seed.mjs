import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@hope-irl.local").toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD || "Admin123!";

  const exists = await prisma.user.findUnique({ where: { email: adminEmail }});
  if (!exists) {
    const passwordHash = await bcrypt.hash(adminPass, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "HOPE_IRL Admin",
        role: "admin",
        passwordHash
      }
    });
    console.log("Seeded admin:", adminEmail);
  } else {
    console.log("Admin already exists:", adminEmail);
  }

  // Seed sample consultants
  const existing = await prisma.consultant.count();
  if (existing === 0) {
    await prisma.consultant.createMany({
      data: [
        { name: "Team Member 1", email: "team1@hope-irl.local" },
        { name: "Team Member 2", email: "team2@hope-irl.local" }
      ]
    });
    console.log("Seeded consultants");
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
