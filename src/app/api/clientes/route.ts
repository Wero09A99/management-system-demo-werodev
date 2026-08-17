import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  respuestaErrorAuth,
  ROLES_EDITORES,
} from "@/lib/auth/requireAuth";
import {
  clienteCreateSchema,
  normalizarClienteInput,
} from "@/modules/clientes/schemas/cliente.schema";

const PAGE_SIZE_DEFAULT = 10;
const PAGE_SIZE_MAX = 100;

type ClienteResumenRow = {
  id: string;
  nombre: string;
  telefono: string | null;
  correo: string | null;
  empresa: string | null;
  fechaRegistro: Date;
  notas: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  ingresos: { monto: { toNumber: () => number } }[];
};

export async function GET(request: Request) {
  try {
    const auth = await requireAuth();
    if (auth.error) return respuestaErrorAuth(auth);
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim();
    const activoParam = url.searchParams.get("activo");
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(
      PAGE_SIZE_MAX,
      Math.max(1, Number(url.searchParams.get("pageSize")) || PAGE_SIZE_DEFAULT),
    );

    const where = {
      ...(search
        ? {
            OR: [
              { nombre: { contains: search, mode: "insensitive" as const } },
              { empresa: { contains: search, mode: "insensitive" as const } },
              { correo: { contains: search, mode: "insensitive" as const } },
              { telefono: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(activoParam !== null ? { activo: activoParam === "true" } : {}),
    };

    const [total, clientes] = await Promise.all([
      prisma.cliente.count({ where }),
      prisma.cliente.findMany({
        where,
        orderBy: [{ activo: "desc" }, { nombre: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { ingresos: { select: { monto: true } } },
      }),
    ]);

    const items: ClienteResumenRow[] = clientes;

    const payload = items.map((cliente) => ({
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
      cantidadIngresos: cliente.ingresos.length,
      totalIngresos: cliente.ingresos.reduce(
        (sum, ingreso) => sum + ingreso.monto.toNumber(),
        0,
      ),
    }));

    return NextResponse.json({
      data: { items: payload, total, page, pageSize },
    });
  } catch (error) {
    console.error("GET /api/clientes:", error);
    return NextResponse.json(
      { error: "No se pudo listar los clientes." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(undefined, ROLES_EDITORES);
    if (auth.error) return respuestaErrorAuth(auth);

    const body = await request.json();
    const parsed = clienteCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
        { status: 400 },
      );
    }

    const cliente = await prisma.cliente.create({
      data: normalizarClienteInput(parsed.data),
    });

    return NextResponse.json({ data: cliente }, { status: 201 });
  } catch (error) {
    console.error("POST /api/clientes:", error);
    return NextResponse.json(
      { error: "No se pudo crear el cliente." },
      { status: 500 },
    );
  }
}
