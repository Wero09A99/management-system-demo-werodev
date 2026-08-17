import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, respuestaErrorAuth } from "@/lib/auth/requireAuth";
import { serializarUsuario } from "@/lib/auth/usuario-dto";
import { usuarioUpdateSchema } from "@/modules/usuarios/schemas/usuario.schema";

/** Sólo ADMIN gestiona usuarios. */
const ROLES_GESTION = ["ADMIN"] as const;

/**
 * PATCH /api/usuarios/[id]
 * Edita rol y activo de un usuario. No se permite desactivar a sí mismo.
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
    const parsed = usuarioUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
        { status: 400 },
      );
    }

    if (id === auth.sesion.sub && !parsed.data.activo) {
      return NextResponse.json(
        { error: "No puedes desactivar tu propia cuenta." },
        { status: 400 },
      );
    }

    const existe = await prisma.usuario.findUnique({ where: { id }, select: { id: true } });
    if (!existe) {
      return NextResponse.json(
        { error: "El usuario no existe." },
        { status: 404 },
      );
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: {
        rol: parsed.data.rol,
        activo: parsed.data.activo,
      },
    });

    return NextResponse.json({ data: { usuario: serializarUsuario(usuario) } });
  } catch (error) {
    console.error(`PATCH /api/usuarios/${id}:`, error);
    return NextResponse.json(
      { error: "No se pudo actualizar el usuario." },
      { status: 500 },
    );
  }
}