import { z } from "zod";

/** Schema del formulario de login (compartido con la API). */
export const loginSchema = z.object({
  correo: z.string().trim().email("Correo inválido.").toLowerCase(),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

export type LoginInput = z.infer<typeof loginSchema>;
