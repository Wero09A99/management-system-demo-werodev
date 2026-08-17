import type { UsuarioDto } from "@/lib/auth/usuario-dto";

/**
 * Tipos del módulo auth: el usuario logueado y su rol.
 * `rol` se tipa como string para tolerar nuevos roles sin romper.
 */
export type UsuarioLogueado = UsuarioDto;

/** Roles disponibles en el sistema. */
export const ROLES = {
  ADMIN: "ADMIN",
  OPERADOR: "OPERADOR",
  CONSULTA: "CONSULTA",
} as const;

export type Rol = (typeof ROLES)[keyof typeof ROLES];
