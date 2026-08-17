export type { UsuarioDto as UsuarioResumen } from "@/lib/auth/usuario-dto";

/** Etiquetas legibles para cada rol. */
export const ROL_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  OPERADOR: "Operador",
  CONSULTA: "Consulta",
};