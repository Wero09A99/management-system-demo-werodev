import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, respuestaErrorAuth } from "@/lib/auth/requireAuth";
import { categoriaUpdateSchema } from "@/modules/categorias/schemas/categoria.schema";

/** Sólo ADMIN gestiona categorías. */
const ROLES_GESTION = ["ADMIN"] as const;

/**
 * PATCH /api/categorias/[id]
 * Edita nombre, tipo, color y estado activo de una categoría. Solo ADMIN.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(undefined, ROLES_GESTION);
  if (auth.error) return respuestaErrorAuth(auth);

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = categoriaUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
        { status: 400 },
      );
    }

    const existe = await prisma.categoria.findUnique({ where: { id }, select: { id: true } });
    if (!existe) {
      return NextResponse.json(
        { error: "La categoría no existe." },
        { status: 404 },
      );
    }

    const duplicada = await prisma.categoria.findFirst({
      where: {
        id: { not: id },
        nombre: parsed.data.nombre,
        tipo: parsed.data.tipo,
      },
      select: { id: true },
    });

    if (duplicada) {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese nombre y tipo." },
        { status: 409 },
      );
    }

    const categoria = await prisma.categoria.update({
      where: { id },
      data: {
        nombre: parsed.data.nombre,
        tipo: parsed.data.tipo,
        color: parsed.data.color === "" ? null : parsed.data.color,
        activa: parsed.data.activa,
      },
    });

    return NextResponse.json({
      data: {
        categoria: {
          id: categoria.id,
          nombre: categoria.nombre,
          tipo: categoria.tipo,
          color: categoria.color,
          activa: categoria.activa,
        },
      },
    });
  } catch (error) {
    console.error(`PATCH /api/categorias/${id}:`, error);
    return NextResponse.json(
      { error: "No se pudo actualizar la categoría." },
      { status: 500 },
    );
  }
}