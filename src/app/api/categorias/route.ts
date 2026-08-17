import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, respuestaErrorAuth } from "@/lib/auth/requireAuth";
import { categoriaCreateSchema } from "@/modules/categorias/schemas/categoria.schema";

/** Sólo ADMIN gestiona categorías. */
const ROLES_GESTION = ["ADMIN"] as const;

/**
 * GET /api/categorias?tipo=INGRESO|GASTO&activas=true
 * Lista categorías, opcionalmente filtradas por tipo y/o solo activas.
 */
export async function GET(request: Request) {
  try {
    const auth = await requireAuth();
    if (auth.error) return respuestaErrorAuth(auth);

    const url = new URL(request.url);
    const tipo = url.searchParams.get("tipo");
    const soloActivas = url.searchParams.get("activas") === "true";

    if (tipo && tipo !== "INGRESO" && tipo !== "GASTO") {
      return NextResponse.json(
        { error: "El tipo debe ser INGRESO o GASTO." },
        { status: 400 },
      );
    }

    const categorias = await prisma.categoria.findMany({
      where: {
        ...(tipo ? { tipo: tipo as "INGRESO" | "GASTO" } : {}),
        ...(soloActivas ? { activa: true } : {}),
      },
      orderBy: { nombre: "asc" },
    });

    const payload = categorias.map((categoria) => ({
      id: categoria.id,
      nombre: categoria.nombre,
      tipo: categoria.tipo,
      color: categoria.color,
      activa: categoria.activa,
    }));

    return NextResponse.json({ data: payload });
  } catch (error) {
    console.error("GET /api/categorias:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar las categorías." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/categorias
 * Crea una categoría. Solo ADMIN.
 */
export async function POST(request: Request) {
  const auth = await requireAuth(undefined, ROLES_GESTION);
  if (auth.error) return respuestaErrorAuth(auth);

  try {
    const body = await request.json();
    const parsed = categoriaCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
        { status: 400 },
      );
    }

    const existe = await prisma.categoria.findFirst({
      where: {
        nombre: parsed.data.nombre,
        tipo: parsed.data.tipo,
      },
      select: { id: true },
    });

    if (existe) {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese nombre y tipo." },
        { status: 409 },
      );
    }

    const categoria = await prisma.categoria.create({
      data: {
        nombre: parsed.data.nombre,
        tipo: parsed.data.tipo,
        color: parsed.data.color === "" ? null : parsed.data.color,
      },
    });

    return NextResponse.json(
      {
        data: {
          categoria: {
            id: categoria.id,
            nombre: categoria.nombre,
            tipo: categoria.tipo,
            color: categoria.color,
            activa: categoria.activa,
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/categorias:", error);
    return NextResponse.json(
      { error: "No se pudo crear la categoría." },
      { status: 500 },
    );
  }
}
