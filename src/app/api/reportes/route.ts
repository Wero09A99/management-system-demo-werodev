import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { fechaLocal, finDeDia } from "@/lib/dates";
import { requireAuth, respuestaErrorAuth } from "@/lib/auth/requireAuth";

/**
 * GET /api/reportes
 * Reporte financiero de un período: resumen, totales por categoría
 * y movimientos. Los agregados se calculan por query, nunca se guardan.
 */
export async function GET(request: Request) {
  try {
    const auth = await requireAuth();
    if (auth.error) return respuestaErrorAuth(auth);

    const url = new URL(request.url);
    const desde = url.searchParams.get("desde");
    const hasta = url.searchParams.get("hasta");

    const filtroFecha: { gte?: Date; lte?: Date } = {
      ...(desde ? { gte: fechaLocal(desde) } : {}),
      ...(hasta ? { lte: finDeDia(fechaLocal(hasta)) } : {}),
    };
    const whereIngresos: Prisma.IngresoWhereInput = Object.keys(filtroFecha).length
      ? { fecha: filtroFecha }
      : {};
    const whereGastos: Prisma.GastoWhereInput = Object.keys(filtroFecha).length
      ? { fecha: filtroFecha }
      : {};

    const [
      ingresosPeriodo,
      gastosPeriodo,
      resumenIngresos,
      resumenGastos,
      totalesPorCategoriaIngreso,
      totalesPorCategoriaGasto,
    ] = await Promise.all([
      prisma.ingreso.findMany({
        where: whereIngresos,
        orderBy: { fecha: "desc" },
        select: {
          id: true,
          concepto: true,
          monto: true,
          metodoPago: true,
          fecha: true,
          categoria: { select: { nombre: true } },
        },
      }),
      prisma.gasto.findMany({
        where: whereGastos,
        orderBy: { fecha: "desc" },
        select: {
          id: true,
          concepto: true,
          monto: true,
          metodoPago: true,
          fecha: true,
          categoria: { select: { nombre: true } },
        },
      }),
      prisma.ingreso.aggregate({ where: whereIngresos, _sum: { monto: true }, _count: true }),
      prisma.gasto.aggregate({ where: whereGastos, _sum: { monto: true }, _count: true }),
      prisma.ingreso.groupBy({
        by: ["categoriaId"],
        where: whereIngresos,
        _sum: { monto: true },
        _count: { categoriaId: true },
      }),
      prisma.gasto.groupBy({
        by: ["categoriaId"],
        where: whereGastos,
        _sum: { monto: true },
        _count: { categoriaId: true },
      }),
    ]);

    const ingresos = resumenIngresos._sum?.monto?.toNumber() ?? 0;
    const gastos = resumenGastos._sum?.monto?.toNumber() ?? 0;
    const utilidad = ingresos - gastos;

    const categoriaIds = Array.from(
      new Set([
        ...totalesPorCategoriaIngreso.map((g) => g.categoriaId),
        ...totalesPorCategoriaGasto.map((g) => g.categoriaId),
      ]),
    );

    const categorias = await prisma.categoria.findMany({
      where: { id: { in: categoriaIds } },
      select: { id: true, nombre: true, color: true },
    });
    const mapaCategorias = new Map(categorias.map((c) => [c.id, c]));

    type FilaTotales = { categoriaId: string; total: number; cantidad: number };
    type FilaGroupBy = {
      categoriaId: string;
      _sum?: { monto?: { toNumber: () => number } | null } | null;
      _count?: { categoriaId?: number } | null;
    };

    const totalesPorCategoria = (rows: FilaGroupBy[]): FilaTotales[] =>
      rows
        .map((row) => {
          const categoria = mapaCategorias.get(row.categoriaId);
          return {
            categoriaId: row.categoriaId,
            categoria: categoria?.nombre ?? "Sin categoría",
            color: categoria?.color ?? null,
            total: row._sum?.monto?.toNumber() ?? 0,
            cantidad: row._count?.categoriaId ?? 0,
          };
        })
        .sort((a, b) => b.total - a.total);

    const movimientos = [
      ...ingresosPeriodo.map((m) => ({
        id: m.id,
        tipo: "INGRESO" as const,
        concepto: m.concepto,
        categoria: m.categoria.nombre,
        monto: m.monto.toNumber(),
        metodoPago: m.metodoPago,
        fecha: m.fecha.toISOString(),
      })),
      ...gastosPeriodo.map((m) => ({
        id: m.id,
        tipo: "GASTO" as const,
        concepto: m.concepto,
        categoria: m.categoria.nombre,
        monto: m.monto.toNumber(),
        metodoPago: m.metodoPago,
        fecha: m.fecha.toISOString(),
      })),
    ].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

    return NextResponse.json({
      data: {
        resumen: {
          ingresos,
          gastos,
          utilidad,
          margen: ingresos > 0 ? (utilidad / ingresos) * 100 : null,
          totalMovimientos: movimientos.length,
        },
        ingresosPorCategoria: totalesPorCategoria(totalesPorCategoriaIngreso),
        gastosPorCategoria: totalesPorCategoria(totalesPorCategoriaGasto),
        movimientos,
      },
    });
  } catch (error) {
    console.error("GET /api/reportes:", error);
    return NextResponse.json(
      { error: "No se pudo generar el reporte." },
      { status: 500 },
    );
  }
}
