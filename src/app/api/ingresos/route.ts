import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fechaLocal, finDeDia } from "@/lib/dates";
import { requireAuth, respuestaErrorAuth, ROLES_EDITORES } from "@/lib/auth/requireAuth";
import {
  ingresoCreateSchema,
  normalizarIngresoInput,
} from "@/modules/ingresos/schemas/ingreso.schema";

const PAGE_SIZE_DEFAULT = 10;
const PAGE_SIZE_MAX = 100;

type IngresoRow = {
  id: string;
  clienteId: string | null;
  concepto: string;
  categoriaId: string;
  creadoPorId: string;
  monto: { toNumber: () => number };
  metodoPago: string;
  estado: string;
  fecha: Date;
  notas: string | null;
  origen: string;
  origenId: string | null;
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

export async function GET(request: Request) {
  try {
    const auth = await requireAuth();
    if (auth.error) return respuestaErrorAuth(auth);
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim();
    const categoriaId = url.searchParams.get("categoriaId");
    const estado = url.searchParams.get("estado");
    const clienteId = url.searchParams.get("clienteId");
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
      ...(estado ? { estado: estado as "PENDIENTE" | "ANTICIPO" | "LIQUIDADO" } : {}),
      ...(clienteId ? { clienteId } : {}),
      ...(desde ? { fecha: { gte: fechaLocal(desde) } } : {}),
      ...(hasta ? { fecha: { lte: finDeDia(fechaLocal(hasta)) } } : {}),
    };

    const [total, ingresos] = await Promise.all([
      prisma.ingreso.count({ where }),
      prisma.ingreso.findMany({
        where,
        orderBy: [{ fecha: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          cliente: { select: { id: true, nombre: true, empresa: true } },
          categoria: { select: { id: true, nombre: true, color: true } },
        },
      }),
    ]);

    const items = (ingresos as IngresoRow[]).map(serializarIngreso);

    return NextResponse.json({ data: { items, total, page, pageSize } });
  } catch (error) {
    console.error("GET /api/ingresos:", error);
    return NextResponse.json(
      { error: "No se pudieron listar los ingresos." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(undefined, ROLES_EDITORES);
    if (auth.error) return respuestaErrorAuth(auth);

    const body = await request.json();
    const parsed = ingresoCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
        { status: 400 },
      );
    }

    const data = normalizarIngresoInput(parsed.data);

    const categoria = await prisma.categoria.findUnique({ where: { id: data.categoriaId } });
    if (!categoria) {
      return NextResponse.json(
        { error: "La categoría seleccionada no existe." },
        { status: 400 },
      );
    }
    if (categoria.tipo !== "INGRESO") {
      return NextResponse.json(
        { error: "La categoría seleccionada no es de tipo ingreso." },
        { status: 400 },
      );
    }

    if (data.clienteId) {
      const cliente = await prisma.cliente.findUnique({ where: { id: data.clienteId } });
      if (!cliente) {
        return NextResponse.json(
          { error: "El cliente seleccionado no existe." },
          { status: 400 },
        );
      }
    }

    const ingreso = await prisma.ingreso.create({
      data: {
        concepto: data.concepto,
        categoriaId: data.categoriaId,
        monto: data.monto,
        metodoPago: data.metodoPago,
        estado: data.estado,
        fecha: fechaLocal(data.fecha),
        clienteId: data.clienteId ?? null,
        notas: data.notas ?? null,
        creadoPorId: auth.sesion.sub,
      },
      include: {
        cliente: { select: { id: true, nombre: true, empresa: true } },
        categoria: { select: { id: true, nombre: true, color: true } },
      },
    });

    return NextResponse.json({ data: serializarIngreso(ingreso as IngresoRow) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/ingresos:", error);
    return NextResponse.json(
      { error: "No se pudo registrar el ingreso." },
      { status: 500 },
    );
  }
}
