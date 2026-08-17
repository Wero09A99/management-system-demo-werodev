import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un monto (Decimal de Prisma llega como string/number) a moneda.
 */
export function formatMoney(
  value: number | string | null | undefined,
  currency = "MXN",
  locale = "es-MX",
): string {
  if (value === null || value === undefined || value === "") return "—";
  const amount = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea una fecha ISO (string o Date) a formato corto: 03 ago 2026.
 */
export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "d MMM yyyy", { locale: es });
}

/**
 * Formatea fecha + hora.
 */
export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "d MMM yyyy, HH:mm", { locale: es });
}