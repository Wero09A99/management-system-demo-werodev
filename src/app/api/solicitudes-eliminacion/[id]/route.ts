import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  respuestaErrorAuth,
  ROLES_GESTION,
} from "@/lib/auth/requireAuth";
import { solicitudResolucionSchema } from "@/modules/solicitudes/schemas/solicitud.schema";

/**
 * PATCH /api/solicitudes-eliminacion/[id]
 * Aprobar elimina el registro objetivo; rechazar lo conserva.
 * Rechazar exige un comentario obligatorio.
 * Solo ADMIN resuelve solicitudes.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(undefined, ROLES_GESTION);
  if (auth.error) return respuestaErrorAuth(auth);

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = solicitudResolucionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
        { status: 400 },
      );
    }

    const solicitud = await prisma.solicitudEliminacion.findUnique({
      where: { id },
      include: { solicitante: { select: { id: true, nombre: true, correo: true } } },
    });

    if (!solicitud) {
      return NextResponse.json(
        { error: "La solicitud no existe." },
        { status: 404 },
      );
    }

    if (solicitud.estado !== "PENDIENTE") {
      return NextResponse.json(
        { error: "Esta solicitud ya fue resuelta." },
        { status: 409 },
      );
    }

    const { accion, comentario } = parsed.data;

    if (accion === "APROBAR") {
      // Verificar que la entidad siga existiendo antes de aprobar.
      const entidadExiste =
        solicitud.entidadTipo === "INGRESO"
          ? await prisma.ingreso.findUnique({ where: { id: solicitud.entidadId }, select: { id: true } })
          : await prisma.gasto.findUnique({ where: { id: solicitud.entidadId }, select: { id: true } });

      if (!entidadExiste) {
        return NextResponse.json(
          { error: "El registro a eliminar ya no existe." },
          { status: 409 },
        );
      }
    }

    // Transacción: resolver solicitud + eliminar el registro objetivo si se aprueba.
    const resultado = await prisma.$transaction(async (tx) => {
      const actualizada = await tx.solicitudEliminacion.update({
        where: { id },
        data: {
          estado: accion === "APROBAR" ? "APROBADA" : "RECHAZADA",
          resueltoPorId: auth.sesion.sub,
          comentario: accion === "APROBAR" ? null : comentario,
          resueltoEn: new Date(),
        },
        include: { solicitante: { select: { id: true, nombre: true, correo: true } } },
      });

      if (accion === "APROBAR") {
        if (actualizada.entidadTipo === "INGRESO") {
          await tx.ingreso.delete({ where: { id: actualizada.entidadId } });
        } else {
          await tx.gasto.delete({ where: { id: actualizada.entidadId } });
        }
      }

      return actualizada;
    });

    return NextResponse.json({
      data: {
        id: resultado.id,
        entidadTipo: resultado.entidadTipo,
        entidadId: resultado.entidadId,
        motivo: resultado.motivo,
        estado: resultado.estado,
        comentario: resultado.comentario,
        resueltoEn: resultado.resueltoEn?.toISOString() ?? null,
        createdAt: resultado.createdAt.toISOString(),
        solicitante: resultado.solicitante,
        resueltoPor: { id: auth.sesion.sub, nombre: auth.sesion.nombre },
        entidadDescripcion: null,
        entidadDetalle: null,
      },
    });
  } catch (error) {
    console.error(`PATCH /api/solicitudes-eliminacion/[id]:`, error);
    return NextResponse.json(
      { error: "No se pudo resolver la solicitud." },
      { status: 500 },
    );
  }
}