import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fechaLocal } from "@/lib/dates";
import {
  requireAuth,
  respuestaErrorAuth,
  ROLES,
  ROLES_EDITORES,
} from "@/lib/auth/requireAuth";
import {
  gastoUpdateSchema,
  normalizarGastoInput,
} from "@/modules/gastos/schemas/gasto.schema";

type GastoRow = {
  id: string;
  concepto: string;
  categoriaId: string;
  monto: { toNumber: () => number };
  metodoPago: string;
  fecha: Date;
  notas: string | null;
  creadoPorId: string;
  createdAt: Date;
  updatedAt: Date;
  categoria: { id: string; nombre: string; color: string | null };
};

function serializarGasto(gasto: GastoRow) {
  return {
    id: gasto.id,
    concepto: gasto.concepto,
    categoriaId: gasto.categoriaId,
    categoria: gasto.categoria,
    monto: gasto.monto.toNumber(),
    metodoPago: gasto.metodoPago,
    fecha: gasto.fecha.toISOString(),
    notas: gasto.notas,
    creadoPorId: gasto.creadoPorId,
    createdAt: gasto.createdAt.toISOString(),
    updatedAt: gasto.updatedAt.toISOString(),
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(undefined, ROLES_EDITORES);
    if (auth.error) return respuestaErrorAuth(auth);

    const { id } = await params;
    const body = await request.json();
    const parsed = gastoUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
        { status: 400 },
      );
    }

    const existe = await prisma.gasto.findUnique({ where: { id } });
    if (!existe) {
      return NextResponse.json(
        { error: "El gasto no existe." },
        { status: 404 },
      );
    }

    const data = normalizarGastoInput(parsed.data);

    if (data.categoriaId && data.categoriaId !== existe.categoriaId) {
      const categoria = await prisma.categoria.findUnique({ where: { id: data.categoriaId } });
      if (!categoria || categoria.tipo !== "GASTO") {
        return NextResponse.json(
          { error: "La categoría seleccionada no es de tipo gasto." },
          { status: 400 },
        );
      }
    }

    const gasto = await prisma.gasto.update({
      where: { id },
      data: {
        ...(data.concepto !== undefined ? { concepto: data.concepto } : {}),
        ...(data.categoriaId !== undefined ? { categoriaId: data.categoriaId } : {}),
        ...(data.monto !== undefined ? { monto: data.monto } : {}),
        ...(data.metodoPago !== undefined ? { metodoPago: data.metodoPago } : {}),
        ...(data.fecha !== undefined ? { fecha: fechaLocal(data.fecha) } : {}),
        ...(data.notas !== undefined ? { notas: data.notas } : {}),
      },
      include: {
        categoria: { select: { id: true, nombre: true, color: true } },
      },
    });

    return NextResponse.json({ data: serializarGasto(gasto as GastoRow) });
  } catch (error) {
    console.error(`PATCH /api/gastos/[id]:`, error);
    return NextResponse.json(
      { error: "No se pudo actualizar el gasto." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth();
    if (auth.error) return respuestaErrorAuth(auth);

    const { id } = await params;

    const existe = await prisma.gasto.findUnique({
      where: { id },
      select: { id: true, creadoPorId: true },
    });
    if (!existe) {
      return NextResponse.json(
        { error: "El gasto no existe." },
        { status: 404 },
      );
    }

    // ADMIN elimina cualquier gasto. OPERADOR/CONSULTA solo los propios.
    const esAdmin = auth.sesion.rol === ROLES.ADMIN;
    const esPropietario = existe.creadoPorId === auth.sesion.sub;

    if (!esAdmin && !esPropietario) {
      return NextResponse.json(
        {
          error:
            "No puedes eliminar un gasto registrado por otro usuario. Solicita su eliminación a un administrador.",
        },
        { status: 403 },
      );
    }

    await prisma.gasto.delete({ where: { id } });

    return NextResponse.json({ data: { ok: true } });
  } catch (error) {
    console.error(`DELETE /api/gastos/[id]:`, error);
    return NextResponse.json(
      { error: "No se pudo eliminar el gasto." },
      { status: 500 },
    );
  }
}
