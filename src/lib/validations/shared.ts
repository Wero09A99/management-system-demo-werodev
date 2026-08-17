import { z } from "zod";

/** Validaciones Zod compartidas entre módulos (fechas, montos, ids). */

export const idSchema = z.string().min(1, "El identificador es obligatorio.");

/** Montos: siempre se manejan como string/decimal de 2 dígitos; se validan como número >= 0. */
export const montoSchema = z.coerce
  .number({ error: "Monto inválido." })
  .min(0, "El monto no puede ser negativo.")
  .max(999_999_999_999, "Monto fuera de rango.");

/** Fecha ISO obligatoria. */
export const fechaISO = z.string().datetime({ offset: true }).or(
  z.string().date(),
);

/** Fecha opcional para filtros de rango (desde/hasta). */
export const fechaOpcional = z
  .string()
  .datetime({ offset: true })
  .or(z.string().date())
  .optional();

export const metodoPagoSchema = z.enum([
  "EFECTIVO",
  "TRANSFERENCIA",
  "TARJETA",
  "OTRO",
]);

export const notaSchema = z
  .string()
  .trim()
  .max(500, "La nota no puede superar 500 caracteres.")
  .optional()
  .or(z.literal(""));

/** Rango de fechas para reportes/filtros. */
export const dateRangeSchema = z.object({
  desde: fechaOpcional,
  hasta: fechaOpcional,
});