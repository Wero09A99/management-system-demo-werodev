import { z } from "zod";

/** Schema Zod compartido entre formulario y API del módulo Clientes. */

export const clienteBaseSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(120, "El nombre no puede superar 120 caracteres."),
  telefono: z
    .string()
    .trim()
    .regex(/^[+\d\s()-]{6,20}$/, "Teléfono inválido.")
    .optional()
    .or(z.literal("")),
  correo: z.string().trim().email("Correo inválido.").optional().or(z.literal("")),
  empresa: z
    .string()
    .trim()
    .max(120, "La empresa no puede superar 120 caracteres.")
    .optional()
    .or(z.literal("")),
  notas: z
    .string()
    .trim()
    .max(500, "Las notas no pueden superar 500 caracteres.")
    .optional()
    .or(z.literal("")),
});

export const clienteCreateSchema = clienteBaseSchema.extend({
  activo: z.boolean().optional().default(true),
});

export const clienteUpdateSchema = clienteCreateSchema.partial();

/**
 * Normaliza los campos opcionales: cadena vacía → null antes de ir a la BD.
 */
export function normalizarClienteInput<T extends Record<string, unknown>>(data: T) {
  const vacios = ["telefono", "correo", "empresa", "notas"] as const;
  return Object.fromEntries(
    Object.entries(data).map(([clave, valor]) => [
      clave,
      (vacios as readonly string[]).includes(clave) && valor === "" ? null : valor,
    ]),
  ) as T;
}

/** Tipo derivado para formularios (react-hook-form). */
export type ClienteFormValues = z.infer<typeof clienteBaseSchema>;
export type ClienteCreateInput = z.input<typeof clienteCreateSchema>;
export type ClienteUpdateInput = z.input<typeof clienteUpdateSchema>;