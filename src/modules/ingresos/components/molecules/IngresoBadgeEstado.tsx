import {
  EstadoIngresoBadge,
  ESTADO_INGRESO_LABEL,
  type EstadoIngresoBadgeProps,
} from "@/design-system/molecules/estado-ingreso-badge";

export { ESTADO_INGRESO_LABEL };
export type { EstadoIngresoBadgeProps as IngresoBadgeEstadoProps };

/**
 * Molécula de dominio: badge del estado de un ingreso.
 * Re-export de la molécula genérica del design-system.
 */
export function IngresoBadgeEstado(props: EstadoIngresoBadgeProps) {
  return <EstadoIngresoBadge {...props} />;
}