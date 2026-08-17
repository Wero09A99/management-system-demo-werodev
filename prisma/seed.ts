import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { TipoCategoria } from "../src/generated/prisma/enums";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type CategoriaSeed = {
  nombre: string;
  tipo: TipoCategoria;
  color: string;
};

const categorias: CategoriaSeed[] = [
  // Ingresos
  { nombre: "Venta de productos", tipo: "INGRESO", color: "#0B5FFF" },
  { nombre: "Servicios", tipo: "INGRESO", color: "#16A34A" },
  { nombre: "Anticipos", tipo: "INGRESO", color: "#D97706" },
  { nombre: "Otros ingresos", tipo: "INGRESO", color: "#52525B" },
  // Gastos
  { nombre: "Materiales", tipo: "GASTO", color: "#DC2626" },
  { nombre: "Insumos", tipo: "GASTO", color: "#EA580C" },
  { nombre: "Renta / Arriendo", tipo: "GASTO", color: "#7C3AED" },
  { nombre: "Salarios", tipo: "GASTO", color: "#0D9488" },
  { nombre: "Servicios públicos", tipo: "GASTO", color: "#2563EB" },
  { nombre: "Transporte", tipo: "GASTO", color: "#0891B2" },
  { nombre: "Marketing", tipo: "GASTO", color: "#DB2777" },
  { nombre: "Otros gastos", tipo: "GASTO", color: "#71717A" },
];

async function main() {
  let creadas = 0;
  for (const categoria of categorias) {
    const existente = await prisma.categoria.findFirst({
      where: { nombre: categoria.nombre, tipo: categoria.tipo },
    });
    if (!existente) {
      await prisma.categoria.create({ data: categoria });
      creadas += 1;
    }
  }
  console.log(`Seed finalizado: ${creadas} categorías creadas, ${categorias.length} en total.`);

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    console.warn("ADMIN_EMAIL y ADMIN_PASSWORD no definidos: no se creó el usuario admin.");
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.usuario.upsert({
    where: { correo: adminEmail },
    update: { passwordHash },
    create: {
      nombre: "WeroDev",
      correo: adminEmail,
      passwordHash,
      rol: "ADMIN",
    },
  });
  console.log(`Usuario admin asegurado: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error("Error en el seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
