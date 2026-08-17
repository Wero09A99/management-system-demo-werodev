import { ROLES, type Rol } from "../types/auth.types";

/** Crean/editan clientes, ingresos y gastos. */
export function puedeEditarRegistros(rol: Rol | null): boolean {
  return rol === ROLES.ADMIN || rol === ROLES.OPERADOR;
}

/** Gestionan usuarios y categorías. */
export function puedeGestionar(rol: Rol | null): boolean {
  return rol === ROLES.ADMIN;
}

/** Eliminan clientes. */
export function puedeEliminarCliente(rol: Rol | null): boolean {
  return rol === ROLES.ADMIN;
}

/**
 * Eliminan ingresos/gastos: ADMIN siempre; OPERADOR solo los propios.
 * (Los registros ajenos se gestionan vía solicitud en la Fase E.)
 */
export function puedeEliminarMovimiento(
  rol: Rol | null,
  creadoPorId: string,
  usuarioId: string | undefined,
): boolean {
  if (rol === ROLES.ADMIN) return true;
  if (rol === ROLES.OPERADOR && usuarioId) return creadoPorId === usuarioId;
  return false;
}
