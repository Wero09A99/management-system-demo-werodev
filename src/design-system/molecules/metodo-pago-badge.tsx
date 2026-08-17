import { Badge } from "@/design-system/atoms/badge";

/** Métodos de pago compartidos (enums de la BD). */
export type MetodoPago = "EFECTIVO" | "TRANSFERENCIA" | "TARJETA" | "OTRO";

export const METODO_PAGO_LABEL: Record<MetodoPago, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
  OTRO: "Otro",
};

export const METODO_PAGO_OPTIONS: { value: MetodoPago; label: string }[] = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "TARJETA", label: "Tarjeta" },
  { value: "OTRO", label: "Otro" },
];

export type MetodoPagoBadgeProps = {
  metodo: MetodoPago;
};

/**
 * Molécula genérica: badge del método de pago.
 */
export function MetodoPagoBadge({ metodo }: MetodoPagoBadgeProps) {
  return (
    <Badge variant="secondary" className="bg-muted/60 font-normal text-muted-foreground">
      {METODO_PAGO_LABEL[metodo]}
    </Badge>
  );
}