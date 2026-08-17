import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, respuestaErrorAuth } from "@/lib/auth/requireAuth";
import { hashPassword } from "@/lib/auth/bcrypt";
import { serializarUsuario } from "@/lib/auth/usuario-dto";
import { usuarioCreateSchema } from "@/modules/usuarios/schemas/usuario.schema";

/** Sólo ADMIN gestiona usuarios. */
const ROLES_GESTION = ["ADMIN"] as const;

export async function GET(request: Request) {
  const auth = await requireAuth(undefined, ROLES_GESTION);
  if (auth.error) return respuestaErrorAuth(auth);

  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim();

    const usuarios = await prisma.usuario.findMany({
      where: search
        ? {
            OR: [
              { nombre: { contains: search, mode: "insensitive" as const } },
              { correo: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : undefined,
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json({
      data: { items: usuarios.map(serializarUsuario) },
    });
  } catch (error) {
    console.error("GET /api/usuarios:", error);
    return NextResponse.json(
      { error: "No se pudieron listar los usuarios." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(undefined, ROLES_GESTION);
  if (auth.error) return respuestaErrorAuth(auth);

  try {
    const body = await request.json();
    const parsed = usuarioCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
        { status: 400 },
      );
    }

    const existe = await prisma.usuario.findUnique({
      where: { correo: parsed.data.correo },
      select: { id: true },
    });

    if (existe) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese correo." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const usuario = await prisma.usuario.create({
      data: {
        nombre: parsed.data.nombre,
        correo: parsed.data.correo,
        passwordHash,
        rol: parsed.data.rol,
      },
    });

    return NextResponse.json(
      { data: { usuario: serializarUsuario(usuario) } },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/usuarios:", error);
    return NextResponse.json(
      { error: "No se pudo crear el usuario." },
      { status: 500 },
    );
  }
}
