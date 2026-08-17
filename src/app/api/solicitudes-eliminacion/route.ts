import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  respuestaErrorAuth,
  ROLES_EDITORES,
} from "@/lib/auth/requireAuth";
import { solicitudCreateSchema } from "@/modules/solicitudes/schemas/solicitud.schema";

type SolicitanteRow = {
  id: string;
  nombre: string;
  correo: string;
};

type ResolutorRow = {
  id: string;
  nombre: string;
};

type EntidadDetalle = {
  concepto: string;
  monto: number;
  fecha: string;
  cliente: { id: string; nombre: string; empresa: string | null } | null;
  categoria: { id: string; nombre: string; color: string | null } | null;
};

type SolicitudRow = {
  id: string;
  entidadTipo: "INGRESO" | "GASTO";
  entidadId: string;
  motivo: string;
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA";
  comentario: string | null;
  resueltoEn: Date | null;
  createdAt: Date;
  solicitante: SolicitanteRow;
  resueltoPor: ResolutorRow | null;
};

const PAGE_SIZE_DEFAULT = 10;
const PAGE_SIZE_MAX = 100;

function serializarSolicitud(
  solicitud: SolicitudRow,
  entidadDescripcion: string | null,
  entidadDetalle: EntidadDetalle | null,
) {
  return {
    id: solicitud.id,
    entidadTipo: solicitud.entidadTipo,
    entidadId: solicitud.entidadId,
    motivo: solicitud.motivo,
    estado: solicitud.estado,
    comentario: solicitud.comentario,
    resueltoEn: solicitud.resueltoEn?.toISOString() ?? null,
    createdAt: solicitud.createdAt.toISOString(),
    solicitante: solicitud.solicitante,
    resueltoPor: solicitud.resueltoPor,
    entidadDescripcion,
    entidadDetalle,
  };
}

async function detallarEntidad(
  entidadTipo: "INGRESO" | "GASTO",
  entidadId: string,
): Promise<{ descripcion: string | null; detalle: EntidadDetalle | null }> {
  if (entidadTipo === "INGRESO") {
    const entidad = await prisma.ingreso.findUnique({
      where: { id: entidadId },
      select: {
        concepto: true,
        monto: true,
        fecha: true,
        cliente: { select: { id: true, nombre: true, empresa: true } },
        categoria: { select: { id: true, nombre: true, color: true } },
      },
    });
    if (!entidad) return { descripcion: null, detalle: null };
    return {
      descripcion: entidad.concepto,
      detalle: {
        concepto: entidad.concepto,
        monto: entidad.monto.toNumber(),
        fecha: entidad.fecha.toISOString(),
        cliente: entidad.cliente,
        categoria: entidad.categoria,
      },
    };
  }

  const entidad = await prisma.gasto.findUnique({
    where: { id: entidadId },
    select: {
      concepto: true,
      monto: true,
      fecha: true,
      categoria: { select: { id: true, nombre: true, color: true } },
    },
  });
  if (!entidad) return { descripcion: null, detalle: null };
  return {
    descripcion: entidad.concepto,
    detalle: {
      concepto: entidad.concepto,
      monto: entidad.monto.toNumber(),
      fecha: entidad.fecha.toISOString(),
      cliente: null,
      categoria: entidad.categoria,
    },
  };
}

/** OPERADOR puede crear solicitudes; ADMIN también (por si se prefiere el flujo). */
export async function POST(request: Request) {
  const auth = await requireAuth(undefined, ROLES_EDITORES);
  if (auth.error) return respuestaErrorAuth(auth);

  try {
    const body = await request.json();
    const parsed = solicitudCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
        { status: 400 },
      );
    }

    const { entidadTipo, entidadId, motivo } = parsed.data;

    // Verificar que la entidad exista antes de crear la solicitud.
    const entidadExiste =
      entidadTipo === "INGRESO"
        ? await prisma.ingreso.findUnique({ where: { id: entidadId }, select: { id: true } })
        : await prisma.gasto.findUnique({ where: { id: entidadId }, select: { id: true } });

    if (!entidadExiste) {
      return NextResponse.json(
        { error: "El registro que quieres eliminar ya no existe." },
        { status: 404 },
      );
    }

    const solicitud = await prisma.solicitudEliminacion.create({
      data: {
        entidadTipo,
        entidadId,
        solicitanteId: auth.sesion.sub,
        motivo,
      },
      include: {
        solicitante: { select: { id: true, nombre: true, correo: true } },
      },
    });

    return NextResponse.json(
      {
        data: serializarSolicitud(
          solicitud as unknown as SolicitudRow,
          null,
          null,
        ),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/solicitudes-eliminacion:", error);
    return NextResponse.json(
      { error: "No se pudo crear la solicitud." },
      { status: 500 },
    );
  }
}

/** ADMIN ve todas con detalle completo; OPERADOR solo las propias; CONSULTA no accede. */
export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return respuestaErrorAuth(auth);

  if (auth.sesion.rol === "CONSULTA") {
    return NextResponse.json(
      { error: "No tienes permisos para ver solicitudes." },
      { status: 403 },
    );
  }

  try {
    const url = new URL(request.url);
    const estado = url.searchParams.get("estado");
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(
      PAGE_SIZE_MAX,
      Math.max(1, Number(url.searchParams.get("pageSize")) || PAGE_SIZE_DEFAULT),
    );

    const where = {
      ...(estado ? { estado: estado as "PENDIENTE" | "APROBADA" | "RECHAZADA" } : {}),
      ...(auth.sesion.rol === "OPERADOR" ? { solicitanteId: auth.sesion.sub } : {}),
    };

    const [total, solicitudes] = await Promise.all([
      prisma.solicitudEliminacion.count({ where }),
      prisma.solicitudEliminacion.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          solicitante: { select: { id: true, nombre: true, correo: true } },
          resueltoPor: { select: { id: true, nombre: true } },
        },
      }),
    ]);

    const items = await Promise.all(
      (solicitudes as unknown as SolicitudRow[]).map(async (s) => {
        const detalle = await detallarEntidad(s.entidadTipo, s.entidadId);
        return serializarSolicitud(s, detalle.descripcion, detalle.detalle);
      }),
    );

    return NextResponse.json({ data: { items, total, page, pageSize } });
  } catch (error) {
    console.error("GET /api/solicitudes-eliminacion:", error);
    return NextResponse.json(
      { error: "No se pudieron listar las solicitudes." },
      { status: 500 },
    );
  }
}