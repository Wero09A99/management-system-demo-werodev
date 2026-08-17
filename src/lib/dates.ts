/**
 * Helpers de fechas locales.
 *
 * Los valores `YYYY-MM-DD` (input type="date" y query params) no deben
 * parsearse con `new Date("YYYY-MM-DD")` porque JS los interpreta como
 * medianoche UTC y en husos negativos se desplazan un día.
 */

/** Crea un Date LOCAL a partir de una cadena `YYYY-MM-DD` (o un Date). */
export function fechaLocal(value: string | Date): Date {
  if (value instanceof Date) return value;
  const [anio, mes, dia] = value.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

/** Devuelve el último instante del día local (23:59:59.999) para filtros `hasta`. */
export function finDeDia(fecha: Date): Date {
  const fin = new Date(fecha);
  fin.setHours(23, 59, 59, 999);
  return fin;
}

/** Convierte un Date a cadena local `YYYY-MM-DD` para inputs date. */
export function toDateInputValue(value: Date | string | null | undefined): string {
  if (!value) return "";
  const fecha = value instanceof Date ? value : fechaLocal(value);
  if (Number.isNaN(fecha.getTime())) return "";
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/** Clave de mes local `YYYY-MM` a partir de un Date. */
export function mesLocalClave(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}`;
}
