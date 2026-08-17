import { z } from "zod";

/** Schema Zod para crear una solicitud de eliminación. */
export const solicitudCreateSchema = z.object({
  entidadTipo: z.enum(["INGRESO", "GASTO"], { message: "Entidad inválida." }),
  entidadId: z.string().min(1, "Falta el identificador de la entidad."),
  motivo: z
    .string()
    .trim()
    .min(10, "El motivo debe tener al menos 10 caracteres.")
    .max(600, "El motivo no puede superar 600 caracteres."),
});

export type SolicitudCreateInput = z.input<typeof solicitudCreateSchema>;

/** Schema Zod para resolver (aprobar/rechazar) una solicitud. */
export const solicitudResolucionSchema = z
  .object({
    accion: z.enum(["APROBAR", "RECHAZAR"], { message: "Acción inválida." }),
    comentario: z
      .string()
      .trim()
      .max(600, "El comentario no puede superar 600 caracteres.")
      .optional(),
  })
  .superRefine((datos, ctx) => {
    if (datos.accion === "RECHAZAR") {
      if (!datos.comentario) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["comentario"],
          message: "Para rechazar debes indicar un comentario.",
        });
      }
    }
  });

export type SolicitudResolucionInput = z.input<typeof solicitudResolucionSchema>;