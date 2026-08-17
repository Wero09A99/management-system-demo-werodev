import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { leerCookieAccess } from "./cookies";
import { verificarAccessToken, type AccessTokenPayload } from "./jwt";

/** Roles del sistema (fuente de verdad de la matriz de permisos). */
export const ROLES = {
  ADMIN: "ADMIN",
  OPERADOR: "OPERADOR",
  CONSULTA: "CONSULTA",
} as const;

/** Crean/editan clientes, ingresos y gastos. */
export const ROLES_EDITORES = [ROLES.ADMIN, ROLES.OPERADOR] as const;

/** Gestionan usuarios y categorías. */
export const ROLES_GESTION = [ROLES.ADMIN] as const;

export type Sesion = AccessTokenPayload;

export type AuthResult =
  | { sesion: Sesion; error: null }
  | { sesion: null; error: { status: number; mensaje: string } };

/**
 * Verifica el access token de la request y opcionalmente restringe a un set de roles.
 * Uso en API routes: `const auth = await requireAuth(req, ["ADMIN"]);`
 * Si `auth.error` existe, devolver ese error; en otro caso usar `auth.sesion`.
 * El token se lee de las cookies httpOnly de la request actual (next/headers).
 */
export async function requireAuth(
  _request?: NextRequest,
  roles?: readonly string[],
): Promise<AuthResult> {
  const token = await leerCookieAccess();

  if (!token) {
    return { sesion: null, error: { status: 401, mensaje: "No autenticado." } };
  }

  const resultado = await verificarAccessToken(token);
  if (resultado.estado !== "valido") {
    const mensaje =
      resultado.estado === "expirado" ? "Sesión expirada." : "Sesión inválida.";
    return { sesion: null, error: { status: 401, mensaje } };
  }

  if (roles && roles.length > 0 && !roles.includes(resultado.payload.rol)) {
    return { sesion: null, error: { status: 403, mensaje: "No tienes permisos para esta acción." } };
  }

  return { sesion: resultado.payload, error: null };
}

export function respuestaErrorAuth(auth: { error: { status: number; mensaje: string } }) {
  return NextResponse.json({ error: auth.error.mensaje }, { status: auth.error.status });
}