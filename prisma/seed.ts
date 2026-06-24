import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const services = [
  {
    key: "consulta_general",
    name: "Consulta general",
    description: "Evaluación clínica completa de tu mascota.",
    basePrice: 25000,
    durationMin: 45,
  },
  {
    key: "control",
    name: "Control / seguimiento",
    description: "Control de tratamiento o seguimiento de un caso ya evaluado.",
    basePrice: 18000,
    durationMin: 30,
  },
  {
    key: "vacunacion",
    name: "Vacunación",
    description: "Aplicación de vacunas y revisión general.",
    basePrice: 20000,
    durationMin: 30,
  },
  {
    key: "urgencia",
    name: "Urgencia a domicilio",
    description: "Atención prioritaria para situaciones urgentes.",
    basePrice: 40000,
    durationMin: 60,
  },
];

const comunas = [
  { name: "Providencia", surcharge: 0 },
  { name: "Ñuñoa", surcharge: 0 },
  { name: "Macul", surcharge: 1000 },
  { name: "La Reina", surcharge: 2000 },
  { name: "San Miguel", surcharge: 2500 },
  { name: "Las Condes", surcharge: 3000 },
  { name: "La Florida", surcharge: 3500 },
  { name: "Vitacura", surcharge: 4000 },
];

async function main() {
  for (const service of services) {
    await prisma.service.upsert({
      where: { key: service.key },
      update: service,
      create: service,
    });
  }

  for (const comuna of comunas) {
    await prisma.comuna.upsert({
      where: { name: comuna.name },
      update: comuna,
      create: comuna,
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@antoniavet.cl";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "antoniavet2024";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash, name: "Antonia Vet" },
    create: { email: adminEmail, passwordHash, name: "Antonia Vet" },
  });

  console.log("Seed completado.");
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
