import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { TipoCategoria, MetodoPago, EstadoIngreso } from "../src/generated/prisma/enums";
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

/** Clientes demo (pensado para demostración del producto en venta). */
const clientesDemo = [
  { nombre: "Carlos Méndez", telefono: "5551234567", correo: "carlos.mendez@correo.com", empresa: "Méndez & Asociados", notas: "Cliente frecuente de servicios de consultoría." },
  { nombre: "Mariana López", telefono: "5559876543", correo: "mariana.lopez@correo.com", empresa: "López Construcciones", notas: "Pagos puntuales." },
  { nombre: "Grupo Ferretería El Cobre", telefono: "5555551212", correo: "ventas@elcobre.mx", empresa: "Ferretería El Cobre", notas: "Compra mensual de insumos." },
  { nombre: "Ana Torres", telefono: "5552223344", correo: "ana.torres@correo.com", empresa: null, notas: "Contrato de diseño web." },
  { nombre: "Distribuidora Ríos", telefono: "5556667788", correo: "contacto@rios.mx", empresa: "Distribuidora Ríos S.A.", notas: null },
];

type IngresoDemo = {
  concepto: string;
  categoria: string;
  monto: number;
  metodoPago: MetodoPago;
  estado: EstadoIngreso;
};

const ingresosDemo: IngresoDemo[] = [
  { concepto: "Venta de materiales de construcción", categoria: "Venta de productos", monto: 48500.0, metodoPago: "TRANSFERENCIA", estado: "LIQUIDADO" },
  { concepto: "Consulta de asesoría fiscal", categoria: "Servicios", monto: 12400.0, metodoPago: "EFECTIVO", estado: "LIQUIDADO" },
  { concepto: "Anticipo proyecto remodelación", categoria: "Anticipos", monto: 30000.0, metodoPago: "TRANSFERENCIA", estado: "ANTICIPO" },
  { concepto: "Diseño de página web", categoria: "Servicios", monto: 18000.0, metodoPago: "TARJETA", estado: "PENDIENTE" },
  { concepto: "Venta de insumos eléctricos", categoria: "Venta de productos", monto: 9600.0, metodoPago: "TRANSFERENCIA", estado: "LIQUIDADO" },
  { concepto: "Mantenimiento preventivo", categoria: "Servicios", monto: 7500.0, metodoPago: "EFECTIVO", estado: "LIQUIDADO" },
];

type GastoDemo = {
  concepto: string;
  categoria: string;
  monto: number;
  metodoPago: MetodoPago;
};

const gastosDemo: GastoDemo[] = [
  { concepto: "Compra de cemento y varilla", categoria: "Materiales", monto: 15600.0, metodoPago: "TRANSFERENCIA" },
  { concepto: "Insumos de oficina", categoria: "Insumos", monto: 3400.0, metodoPago: "EFECTIVO" },
  { concepto: "Renta mensual del local", categoria: "Renta / Arriendo", monto: 12000.0, metodoPago: "TRANSFERENCIA" },
  { concepto: "Nómina quincenal", categoria: "Salarios", monto: 28000.0, metodoPago: "TRANSFERENCIA" },
  { concepto: "Recibo de electricidad", categoria: "Servicios públicos", monto: 2100.0, metodoPago: "OTRO" },
  { concepto: "Combustible para entregas", categoria: "Transporte", monto: 1850.0, metodoPago: "EFECTIVO" },
  { concepto: "Campaña en redes sociales", categoria: "Marketing", monto: 4200.0, metodoPago: "TARJETA" },
];

async function main() {
  let creadas = 0;
  const mapaCategorias = new Map<string, string>();

  for (const categoria of categorias) {
    const existente = await prisma.categoria.findFirst({
      where: { nombre: categoria.nombre, tipo: categoria.tipo },
    });
    const registro =
      existente ??
      (await prisma.categoria.create({
        data: { nombre: categoria.nombre, tipo: categoria.tipo, color: categoria.color },
      }));
    if (!existente) creadas += 1;
    mapaCategorias.set(categoria.nombre, registro.id);
  }
  console.log(`Seed: ${creadas} categorías creadas, ${categorias.length} en total.`);

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    console.warn("ADMIN_EMAIL y ADMIN_PASSWORD no definidos: no se creó el usuario admin.");
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.usuario.upsert({
    where: { correo: adminEmail },
    update: { passwordHash, rol: "ADMIN", activo: true },
    create: {
      nombre: "WeroDev",
      correo: adminEmail,
      passwordHash,
      rol: "ADMIN",
    },
  });
  console.log(`Usuario admin asegurado: ${adminEmail}`);

  // ─── Datos demo ────────────────────────────────────────────────
  let clientesCreados = 0;
  const idsClientes: string[] = [];
  for (const cliente of clientesDemo) {
    const existente = await prisma.cliente.findFirst({
      where: { correo: cliente.correo ?? undefined, nombre: cliente.nombre },
    });
    if (existente) {
      idsClientes.push(existente.id);
      continue;
    }
    const creado = await prisma.cliente.create({
      data: { ...cliente, fechaRegistro: new Date(Date.now() - 30 * 24 * 3600 * 1000) },
    });
    idsClientes.push(creado.id);
    clientesCreados += 1;
  }
  console.log(`Seed: ${clientesCreados} clientes demo creados.`);

  // Ingresos demo: distribuir en los últimos 6 meses, rotando clientes.
  let ingresosCreados = 0;
  const ahora = new Date();
  for (let i = 0; i < ingresosDemo.length; i++) {
    const ingreso = ingresosDemo[i];
    const fecha = new Date(ahora);
    fecha.setMonth(fecha.getMonth() - (i % 6));
    fecha.setDate(Math.min(5 + i, 28));
    const categoriaId = mapaCategorias.get(ingreso.categoria);
    if (!categoriaId) continue;
    await prisma.ingreso.create({
      data: {
        concepto: ingreso.concepto,
        categoriaId,
        monto: ingreso.monto,
        metodoPago: ingreso.metodoPago,
        estado: ingreso.estado,
        fecha,
        creadoPorId: admin.id,
        clienteId: idsClientes[i % idsClientes.length] ?? null,
        notas: "Registro de demostración.",
        origen: "manual",
      },
    });
    ingresosCreados += 1;
  }
  console.log(`Seed: ${ingresosCreados} ingresos demo creados.`);

  let gastosCreados = 0;
  for (let i = 0; i < gastosDemo.length; i++) {
    const gasto = gastosDemo[i];
    const fecha = new Date(ahora);
    fecha.setMonth(fecha.getMonth() - (i % 6));
    fecha.setDate(Math.min(8 + i, 28));
    const categoriaId = mapaCategorias.get(gasto.categoria);
    if (!categoriaId) continue;
    await prisma.gasto.create({
      data: {
        concepto: gasto.concepto,
        categoriaId,
        monto: gasto.monto,
        metodoPago: gasto.metodoPago,
        fecha,
        creadoPorId: admin.id,
        notas: "Registro de demostración.",
      },
    });
    gastosCreados += 1;
  }
  console.log(`Seed: ${gastosCreados} gastos demo creados.`);

  console.log("Seed finalizado.");
}

main()
  .catch((error) => {
    console.error("Error en el seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });