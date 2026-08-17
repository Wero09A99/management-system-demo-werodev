import { z } from "zod";
import { montoSchema } from "@/lib/validations/shared";

/** Schema Zod compartido entre formulario y API del módulo Gastos. */

export const gastoBaseSchema = z.object({
  concepto: z
    .string()
    .trim()
    .min(2, "El concepto debe tener al menos 2 caracteres.")
    .max(200, "El concepto no puede superar 200 caracteres."),
  categoriaId: z.string().min(1, "Selecciona una categoría."),
  monto: montoSchema,
  metodoPago: z.enum(["EFECTIVO", "TRANSFERENCIA", "TARJETA", "OTRO"], {
    error: "Selecciona un método de pago.",
  }),
  fecha: z.string().date("La fecha es inválida."),
  notas: z
    .string()
    .trim()
    .max(500, "Las notas no pueden superar 500 caracteres.")
    .optional()
    .or(z.literal("")),
});

export const gastoCreateSchema = gastoBaseSchema;
export const gastoUpdateSchema = gastoBaseSchema.partial();

/**
 * Normaliza los campos opcionales: cadena vacía → null antes de ir a la BD.
 */
export function normalizarGastoInput<T extends Record<string, unknown>>(data: T) {
  const vacios = ["notas"] as const;
  return Object.fromEntries(
    Object.entries(data).map(([clave, valor]) => [
      clave,
      (vacios as readonly string[]).includes(clave) && valor === "" ? null : valor,
    ]),
  ) as T;
}

/** Tipos derivados para formularios (react-hook-form).
 * `GastoFormInput` es lo que escribe el usuario; `GastoFormValues` lo validado. */
export type GastoFormInput = z.input<typeof gastoBaseSchema>;
export type GastoFormValues = z.infer<typeof gastoBaseSchema>;
export type GastoCreateInput = z.input<typeof gastoCreateSchema>;
export type GastoUpdateInput = z.input<typeof gastoUpdateSchema>;