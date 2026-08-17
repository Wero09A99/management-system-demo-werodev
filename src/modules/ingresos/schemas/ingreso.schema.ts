import { z } from "zod";
import { montoSchema } from "@/lib/validations/shared";

/** Schema Zod compartido entre formulario y API del módulo Ingresos. */

export const ingresoBaseSchema = z.object({
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
  estado: z.enum(["PENDIENTE", "ANTICIPO", "LIQUIDADO"], {
    error: "Selecciona un estado.",
  }),
  fecha: z.string().date("La fecha es inválida."),
  clienteId: z.string().min(1, "Cliente inválido.").optional().or(z.literal("")),
  notas: z
    .string()
    .trim()
    .max(500, "Las notas no pueden superar 500 caracteres.")
    .optional()
    .or(z.literal("")),
});

export const ingresoCreateSchema = ingresoBaseSchema.extend({
  estado: z
    .enum(["PENDIENTE", "ANTICIPO", "LIQUIDADO"])
    .optional()
    .default("LIQUIDADO"),
});

export const ingresoUpdateSchema = ingresoCreateSchema.partial();

/**
 * Normaliza los campos opcionales: cadena vacía → null antes de ir a la BD.
 */
export function normalizarIngresoInput<T extends Record<string, unknown>>(data: T) {
  const vacios = ["clienteId", "notas"] as const;
  return Object.fromEntries(
    Object.entries(data).map(([clave, valor]) => [
      clave,
      (vacios as readonly string[]).includes(clave) && valor === "" ? null : valor,
    ]),
  ) as T;
}

/** Tipos derivados para formularios (react-hook-form).
 * `IngresoFormInput` es lo que escribe el usuario (monto como string/unknown);
 * `IngresoFormValues` es lo validado por Zod (monto como number). */
export type IngresoFormInput = z.input<typeof ingresoBaseSchema>;
export type IngresoFormValues = z.infer<typeof ingresoBaseSchema>;
export type IngresoCreateInput = z.input<typeof ingresoCreateSchema>;
export type IngresoUpdateInput = z.input<typeof ingresoUpdateSchema>;