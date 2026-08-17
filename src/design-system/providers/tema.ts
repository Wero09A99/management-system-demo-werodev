import type { NombreTema } from "@/design-system/tokens/themes";

/** Nombre de la cookie donde se persiste el tema. */
export const COOKIE_TEMA = "werodev-tema";

export function esNombreTema(valor: string | undefined): valor is NombreTema {
  return valor === "claro" || valor === "oscuro" || valor === "galaxia";
}

/** Normaliza un valor de cookie a un tema válido (server-safe, sin "use client"). */
export function leerTemaCookie(valor: string | undefined): NombreTema {
  return esNombreTema(valor) ? valor : "claro";
}