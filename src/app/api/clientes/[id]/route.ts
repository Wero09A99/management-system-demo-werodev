import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  respuestaErrorAuth,
  ROLES_EDITORES,
  ROLES_GESTION,
} from "@/lib/auth/requireAuth";
import {
  clienteUpdateSchema,
  normalizarClienteInput,
} from "@/modules/clientes/schemas/cliente.schema";

type IngresoRow = {
  id: string;
  concepto: string;
  monto: { toNumber: () => number };
  metodoPago: string;
  estado: string;
  fecha: Date;
  categoria: { nombre: string };
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth();
    if (auth.error) return respuestaErrorAuth(auth);

    const { id } = await params;

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        ingresos: {
          orderBy: { fecha: "desc" },
          select: {
            id: true,
            concepto: true,
            monto: true,
            metodoPago: true,
            estado: true,
            fecha: true,
            categoria: { select: { nombre: true } },
          },
        },
      },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "El cliente no existe." },
        { status: 404 },
      );
    }

    const ingresos: IngresoRow[] = cliente.ingresos;

    const payload = {
      id: cliente.id,
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      correo: cliente.correo,
      empresa: cliente.empresa,
      fechaRegistro: cliente.fechaRegistro.toISOString(),
      notas: cliente.notas,
      activo: cliente.activo,
      createdAt: cliente.createdAt.toISOString(),
      updatedAt: cliente.updatedAt.toISOString(),
      cantidadIngresos: ingresos.length,
      totalIngresos: ingresos.reduce((sum, ingreso) => sum + ingreso.monto.toNumber(), 0),
      ingresos: ingresos.map((ingreso) => ({
        id: ingreso.id,
        concepto: ingreso.concepto,
        categoria: { nombre: ingreso.categoria.nombre },
        monto: ingreso.monto.toNumber(),
        metodoPago: ingreso.metodoPago,
        estado: ingreso.estado,
        fecha: ingreso.fecha.toISOString(),
      })),
    };

    return NextResponse.json({ data: payload });
  } catch (error) {
    console.error(`GET /api/clientes/[id]:`, error);
    return NextResponse.json(
      { error: "No se pudo cargar el cliente." },
      { status: 500 },
    );
  }
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
    const parsed = clienteUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
        { status: 400 },
      );
    }

    const existe = await prisma.cliente.findUnique({ where: { id } });
    if (!existe) {
      return NextResponse.json(
        { error: "El cliente no existe." },
        { status: 404 },
      );
    }

    const cliente = await prisma.cliente.update({
      where: { id },
      data: normalizarClienteInput(parsed.data),
    });

    return NextResponse.json({ data: cliente });
  } catch (error) {
    console.error(`PATCH /api/clientes/[id]:`, error);
    return NextResponse.json(
      { error: "No se pudo actualizar el cliente." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(undefined, ROLES_GESTION);
    if (auth.error) return respuestaErrorAuth(auth);

    const { id } = await params;

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: { _count: { select: { ingresos: true } } },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "El cliente no existe." },
        { status: 404 },
      );
    }

    if (cliente._count.ingresos > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar un cliente con ingresos asociados. Desactívalo en su lugar.",
        },
        { status: 409 },
      );
    }

    await prisma.cliente.delete({ where: { id } });

    return NextResponse.json({ data: { ok: true } });
  } catch (error) {
    console.error(`DELETE /api/clientes/[id]:`, error);
    return NextResponse.json(
      { error: "No se pudo eliminar el cliente." },
      { status: 500 },
    );
  }
}
