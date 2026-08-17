import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fechaLocal, finDeDia } from "@/lib/dates";
import { requireAuth, respuestaErrorAuth, ROLES_EDITORES } from "@/lib/auth/requireAuth";
import {
  gastoCreateSchema,
  normalizarGastoInput,
} from "@/modules/gastos/schemas/gasto.schema";

const PAGE_SIZE_DEFAULT = 10;
const PAGE_SIZE_MAX = 100;

type GastoRow = {
  id: string;
  concepto: string;
  categoriaId: string;
  creadoPorId: string;
  monto: { toNumber: () => number };
  metodoPago: string;
  fecha: Date;
  notas: string | null;
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
    createdAt: gasto.createdAt.toISOString(),
    updatedAt: gasto.updatedAt.toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuth();
    if (auth.error) return respuestaErrorAuth(auth);
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim();
    const categoriaId = url.searchParams.get("categoriaId");
    const desde = url.searchParams.get("desde");
    const hasta = url.searchParams.get("hasta");
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(
      PAGE_SIZE_MAX,
      Math.max(1, Number(url.searchParams.get("pageSize")) || PAGE_SIZE_DEFAULT),
    );

    const where = {
      ...(search
        ? { concepto: { contains: search, mode: "insensitive" as const } }
        : {}),
      ...(categoriaId ? { categoriaId } : {}),
      ...(desde ? { fecha: { gte: fechaLocal(desde) } } : {}),
      ...(hasta ? { fecha: { lte: finDeDia(fechaLocal(hasta)) } } : {}),
    };

    const [total, gastos] = await Promise.all([
      prisma.gasto.count({ where }),
      prisma.gasto.findMany({
        where,
        orderBy: [{ fecha: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          categoria: { select: { id: true, nombre: true, color: true } },
        },
      }),
    ]);

    const items = (gastos as GastoRow[]).map(serializarGasto);

    return NextResponse.json({ data: { items, total, page, pageSize } });
  } catch (error) {
    console.error("GET /api/gastos:", error);
    return NextResponse.json(
      { error: "No se pudieron listar los gastos." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(undefined, ROLES_EDITORES);
    if (auth.error) return respuestaErrorAuth(auth);

    const body = await request.json();
    const parsed = gastoCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
        { status: 400 },
      );
    }

    const data = normalizarGastoInput(parsed.data);

    const categoria = await prisma.categoria.findUnique({ where: { id: data.categoriaId } });
    if (!categoria) {
      return NextResponse.json(
        { error: "La categoría seleccionada no existe." },
        { status: 400 },
      );
    }
    if (categoria.tipo !== "GASTO") {
      return NextResponse.json(
        { error: "La categoría seleccionada no es de tipo gasto." },
        { status: 400 },
      );
    }

    const gasto = await prisma.gasto.create({
      data: {
        concepto: data.concepto,
        categoriaId: data.categoriaId,
        monto: data.monto,
        metodoPago: data.metodoPago,
        fecha: fechaLocal(data.fecha),
        notas: data.notas ?? null,
        creadoPorId: auth.sesion.sub,
      },
      include: {
        categoria: { select: { id: true, nombre: true, color: true } },
      },
    });

    return NextResponse.json({ data: serializarGasto(gasto as GastoRow) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/gastos:", error);
    return NextResponse.json(
      { error: "No se pudo registrar el gasto." },
      { status: 500 },
    );
  }
}
