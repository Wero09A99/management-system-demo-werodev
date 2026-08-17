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
  ingresoUpdateSchema,
  normalizarIngresoInput,
} from "@/modules/ingresos/schemas/ingreso.schema";

type IngresoRow = {
  id: string;
  clienteId: string | null;
  concepto: string;
  categoriaId: string;
  monto: { toNumber: () => number };
  metodoPago: string;
  estado: string;
  fecha: Date;
  notas: string | null;
  origen: string;
  origenId: string | null;
  creadoPorId: string;
  createdAt: Date;
  updatedAt: Date;
  cliente: { id: string; nombre: string; empresa: string | null } | null;
  categoria: { id: string; nombre: string; color: string | null };
};

function serializarIngreso(ingreso: IngresoRow) {
  return {
    id: ingreso.id,
    clienteId: ingreso.clienteId,
    cliente: ingreso.cliente,
    concepto: ingreso.concepto,
    categoriaId: ingreso.categoriaId,
    categoria: ingreso.categoria,
    monto: ingreso.monto.toNumber(),
    metodoPago: ingreso.metodoPago,
    estado: ingreso.estado,
    fecha: ingreso.fecha.toISOString(),
    notas: ingreso.notas,
    origen: ingreso.origen,
    origenId: ingreso.origenId,
    creadoPorId: ingreso.creadoPorId,
    createdAt: ingreso.createdAt.toISOString(),
    updatedAt: ingreso.updatedAt.toISOString(),
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
    const parsed = ingresoUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
        { status: 400 },
      );
    }

    const existe = await prisma.ingreso.findUnique({ where: { id } });
    if (!existe) {
      return NextResponse.json(
        { error: "El ingreso no existe." },
        { status: 404 },
      );
    }

    const data = normalizarIngresoInput(parsed.data);

    if (data.categoriaId && data.categoriaId !== existe.categoriaId) {
      const categoria = await prisma.categoria.findUnique({ where: { id: data.categoriaId } });
      if (!categoria || categoria.tipo !== "INGRESO") {
        return NextResponse.json(
          { error: "La categoría seleccionada no es de tipo ingreso." },
          { status: 400 },
        );
      }
    }

    if (data.clienteId && data.clienteId !== existe.clienteId) {
      const cliente = await prisma.cliente.findUnique({ where: { id: data.clienteId } });
      if (!cliente) {
        return NextResponse.json(
          { error: "El cliente seleccionado no existe." },
          { status: 400 },
        );
      }
    }

    const ingreso = await prisma.ingreso.update({
      where: { id },
      data: {
        ...(data.concepto !== undefined ? { concepto: data.concepto } : {}),
        ...(data.categoriaId !== undefined ? { categoriaId: data.categoriaId } : {}),
        ...(data.monto !== undefined ? { monto: data.monto } : {}),
        ...(data.metodoPago !== undefined ? { metodoPago: data.metodoPago } : {}),
        ...(data.estado !== undefined ? { estado: data.estado } : {}),
        ...(data.fecha !== undefined ? { fecha: fechaLocal(data.fecha) } : {}),
        ...(data.clienteId !== undefined ? { clienteId: data.clienteId } : {}),
        ...(data.notas !== undefined ? { notas: data.notas } : {}),
      },
      include: {
        cliente: { select: { id: true, nombre: true, empresa: true } },
        categoria: { select: { id: true, nombre: true, color: true } },
      },
    });

    return NextResponse.json({ data: serializarIngreso(ingreso as IngresoRow) });
  } catch (error) {
    console.error(`PATCH /api/ingresos/[id]:`, error);
    return NextResponse.json(
      { error: "No se pudo actualizar el ingreso." },
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

    const existe = await prisma.ingreso.findUnique({
      where: { id },
      select: { id: true, creadoPorId: true },
    });
    if (!existe) {
      return NextResponse.json(
        { error: "El ingreso no existe." },
        { status: 404 },
      );
    }

    // ADMIN elimina cualquier ingreso. OPERADOR/CONSULTA solo los propios.
    const esAdmin = auth.sesion.rol === ROLES.ADMIN;
    const esPropietario = existe.creadoPorId === auth.sesion.sub;

    if (!esAdmin && !esPropietario) {
      return NextResponse.json(
        {
          error:
            "No puedes eliminar un ingreso registrado por otro usuario. Solicita su eliminación a un administrador.",
        },
        { status: 403 },
      );
    }

    await prisma.ingreso.delete({ where: { id } });

    return NextResponse.json({ data: { ok: true } });
  } catch (error) {
    console.error(`DELETE /api/ingresos/[id]:`, error);
    return NextResponse.json(
      { error: "No se pudo eliminar el ingreso." },
      { status: 500 },
    );
  }
}
