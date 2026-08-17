import { Badge } from "@/design-system/atoms/badge";

/** Estados de un ingreso (enum de la BD). */
export type EstadoIngreso = "PENDIENTE" | "ANTICIPO" | "LIQUIDADO";

export const ESTADO_INGRESO_LABEL: Record<EstadoIngreso, string> = {
  PENDIENTE: "Pendiente",
  ANTICIPO: "Anticipo",
  LIQUIDADO: "Liquidado",
};

export const ESTADO_INGRESO_OPTIONS: { value: EstadoIngreso; label: string }[] = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "ANTICIPO", label: "Anticipo" },
  { value: "LIQUIDADO", label: "Liquidado" },
];

export type EstadoIngresoBadgeProps = {
  estado: EstadoIngreso;
};

/**
 * Molécula genérica: badge del estado de un ingreso.
 */
export function EstadoIngresoBadge({ estado }: EstadoIngresoBadgeProps) {
  const clases =
    estado === "LIQUIDADO"
      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
      : estado === "ANTICIPO"
        ? "bg-amber-50 text-amber-700 hover:bg-amber-50"
        : "bg-muted text-muted-foreground hover:bg-muted";

  return <Badge className={clases}>{ESTADO_INGRESO_LABEL[estado]}</Badge>;
}