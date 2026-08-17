import { Badge } from "@/design-system/atoms/badge";

export type ClienteBadgeEstadoProps = {
  activo: boolean;
};

/**
 * Molécula de dominio: badge de estado activo/inactivo del cliente.
 */
export function ClienteBadgeEstado({ activo }: ClienteBadgeEstadoProps) {
  if (activo) {
    return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Activo</Badge>;
  }
  return <Badge className="bg-muted text-muted-foreground hover:bg-muted">Inactivo</Badge>;
}