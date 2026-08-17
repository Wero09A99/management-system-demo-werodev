import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, respuestaErrorAuth } from "@/lib/auth/requireAuth";
import { serializarUsuario } from "@/lib/auth/usuario-dto";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return respuestaErrorAuth(auth);

  const usuario = await prisma.usuario.findUnique({
    where: { id: auth.sesion.sub },
  });

  if (!usuario || !usuario.activo) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 401 });
  }

  return NextResponse.json({ data: { usuario: serializarUsuario(usuario) } });
}