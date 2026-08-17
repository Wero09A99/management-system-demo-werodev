import { NextResponse } from "next/server";
import { format, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { requireAuth, respuestaErrorAuth } from "@/lib/auth/requireAuth";

/**
 * GET /api/dashboard
 * Devuelve resumen financiero, serie mensual (últimos 6 meses) y
 * movimientos recientes. Los agregados se calculan por query, nunca se guardan.
 */
export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return respuestaErrorAuth(auth);

    const hoy = new Date();
    const desdeMeses = subMonths(hoy, 5);
    const inicioMes = new Date(desdeMeses.getFullYear(), desdeMeses.getMonth(), 1);
    const finHoy = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);

    // Series mensuales (ingresos y gastos de los últimos 6 meses).
    const [ingresosPeriodo, gastosPeriodo] = await Promise.all([
      prisma.ingreso.findMany({
        where: { fecha: { gte: inicioMes, lte: finHoy } },
        select: { monto: true, fecha: true },
      }),
      prisma.gasto.findMany({
        where: { fecha: { gte: inicioMes, lte: finHoy } },
        select: { monto: true, fecha: true },
      }),
    ]);

    const mapaMensual = new Map<
      string,
      { ingresos: number; gastos: number }
    >();

    for (let i = 5; i >= 0; i--) {
      const fecha = subMonths(hoy, i);
      const clave = format(fecha, "yyyy-MM");
      mapaMensual.set(clave, { ingresos: 0, gastos: 0 });
    }

    for (const ingreso of ingresosPeriodo) {
      const clave = format(ingreso.fecha, "yyyy-MM");
      const bucket = mapaMensual.get(clave);
      if (bucket) bucket.ingresos += ingreso.monto.toNumber();
    }

    for (const gasto of gastosPeriodo) {
      const clave = format(gasto.fecha, "yyyy-MM");
      const bucket = mapaMensual.get(clave);
      if (bucket) bucket.gastos += gasto.monto.toNumber();
    }

    const mensual = Array.from(mapaMensual.entries()).map(([mes, valores]) => {
      const [anio, mesNumero] = mes.split("-").map(Number);
      const fechaLocal = new Date(anio, mesNumero - 1, 1);
      return {
        mes,
        etiqueta: format(fechaLocal, "MMM", { locale: es }),
        ...valores,
      };
    });

    // Totales globales.
    const [sumaIngresos, sumaGastos] = await Promise.all([
      prisma.ingreso.aggregate({ _sum: { monto: true } }),
      prisma.gasto.aggregate({ _sum: { monto: true } }),
    ]);

    const ingresosTotales = sumaIngresos._sum.monto?.toNumber() ?? 0;
    const gastosTotales = sumaGastos._sum.monto?.toNumber() ?? 0;

    // Ingresos/gastos del mes actual.
    const mesActual = format(hoy, "yyyy-MM");
    const bucketActual = mapaMensual.get(mesActual);

    // Movimientos recientes (últimos 8, mezclando ambos tipos).
    const [recientesIngresos, recientesGastos] = await Promise.all([
      prisma.ingreso.findMany({
        orderBy: { fecha: "desc" },
        take: 8,
        select: {
          id: true,
          concepto: true,
          monto: true,
          fecha: true,
          categoria: { select: { nombre: true, color: true } },
        },
      }),
      prisma.gasto.findMany({
        orderBy: { fecha: "desc" },
        take: 8,
        select: {
          id: true,
          concepto: true,
          monto: true,
          fecha: true,
          categoria: { select: { nombre: true, color: true } },
        },
      }),
    ]);

    const movimientos = [
      ...recientesIngresos.map((m) => ({
        id: m.id,
        tipo: "INGRESO" as const,
        concepto: m.concepto,
        categoriaNombre: m.categoria.nombre,
        categoriaColor: m.categoria.color,
        monto: m.monto.toNumber(),
        fecha: m.fecha.toISOString(),
      })),
      ...recientesGastos.map((m) => ({
        id: m.id,
        tipo: "GASTO" as const,
        concepto: m.concepto,
        categoriaNombre: m.categoria.nombre,
        categoriaColor: m.categoria.color,
        monto: m.monto.toNumber(),
        fecha: m.fecha.toISOString(),
      })),
    ]
      .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
      .slice(0, 8);

    return NextResponse.json({
      data: {
        resumen: {
          saldoTotal: ingresosTotales - gastosTotales,
          ingresosTotales,
          gastosTotales,
          ingresosMes: bucketActual?.ingresos ?? 0,
          gastosMes: bucketActual?.gastos ?? 0,
        },
        mensual,
        movimientos,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los datos del dashboard." },
      { status: 500 },
    );
  }
}
