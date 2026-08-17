import { z } from "zod";

/** Color hex opcional; vacío significa "sin color" (la API lo guarda como null). */
const colorSchema = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(v),
    "El color debe ser un hex válido (#RRGGBB).",
  );

/** Schema Zod de creación de categorías (compartido entre API y formulario). */
export const categoriaCreateSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(80, "El nombre no puede superar 80 caracteres."),
  tipo: z.enum(["INGRESO", "GASTO"], { message: "El tipo debe ser INGRESO o GASTO." }),
  color: colorSchema,
});

export type CategoriaCreateInput = z.input<typeof categoriaCreateSchema>;

/** Schema Zod de edición de categorías (nombre, tipo, color y estado activo). */
export const categoriaUpdateSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(80, "El nombre no puede superar 80 caracteres."),
  tipo: z.enum(["INGRESO", "GASTO"], { message: "El tipo debe ser INGRESO o GASTO." }),
  color: colorSchema,
  activa: z.boolean(),
});

export type CategoriaUpdateInput = z.input<typeof categoriaUpdateSchema>;