import { z } from "zod";
import { ROLES } from "@/modules/auth/types/auth.types";

/** Schema Zod de creación de usuarios (compartido entre API y formulario). */
export const usuarioCreateSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(120, "El nombre no puede superar 120 caracteres."),
  correo: z.string().trim().email("Correo inválido.").toLowerCase(),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(128, "La contraseña no puede superar 128 caracteres."),
  rol: z.enum([ROLES.ADMIN, ROLES.OPERADOR, ROLES.CONSULTA], {
    message: "Rol inválido.",
  }),
});

/** Tipo derivado para formularios (react-hook-form). */
export type UsuarioCreateInput = z.input<typeof usuarioCreateSchema>;

/** Schema Zod de edición de usuarios (rol y activo). */
export const usuarioUpdateSchema = z.object({
  rol: z.enum([ROLES.ADMIN, ROLES.OPERADOR, ROLES.CONSULTA], {
    message: "Rol inválido.",
  }),
  activo: z.boolean(),
});

/** Tipo derivado para la edición de usuarios. */
export type UsuarioUpdateInput = z.input<typeof usuarioUpdateSchema>;