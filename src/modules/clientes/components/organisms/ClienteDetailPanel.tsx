"use client";

import {
  Building2,
  CalendarDays,
  Mail,
  Pencil,
  Phone,
  Power,
  StickyNote,
  Trash2,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/design-system/atoms/button";
import { Icon } from "@/design-system/atoms/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { StatPill } from "@/design-system/molecules/stat-pill";
import { formatDate, formatMoney } from "@/lib/utils";
import { ClienteAvatarNombre } from "@/modules/clientes/components/molecules/ClienteAvatarNombre";
import { ClienteBadgeEstado } from "@/modules/clientes/components/molecules/ClienteBadgeEstado";
import { ClienteHistorialIngresos } from "@/modules/clientes/components/organisms/ClienteHistorialIngresos";
import type { ClienteDetalle } from "@/modules/clientes/types/cliente.types";

export type ClienteDetailPanelProps = {
  cliente: ClienteDetalle | null;
  loading?: boolean;
  onEditar?: () => void;
  onCambiarEstado?: () => void;
  onEliminar?: () => void;
};

/**
 * Organismo ClienteDetailPanel: detalle completo del cliente con métricas
 * calculadas (total de ingresos) e historial.
 */
export function ClienteDetailPanel({
  cliente,
  loading,
  onEditar,
  onCambiarEstado,
  onEliminar,
}: ClienteDetailPanelProps) {
  if (loading || !cliente) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <ClienteAvatarNombre nombre={cliente.nombre} empresa={cliente.empresa} />
          <ClienteBadgeEstado activo={cliente.activo} />
        </div>
        <div className="flex flex-wrap gap-2">
          {onEditar ? (
            <Button variant="outline" size="sm" onClick={onEditar}>
              <Icon icon={Pencil} className="text-muted-foreground" />
              Editar
            </Button>
          ) : null}
          {onCambiarEstado ? (
            <Button variant="outline" size="sm" onClick={onCambiarEstado}>
              <Icon icon={Power} className="text-muted-foreground" />
              {cliente.activo ? "Desactivar" : "Activar"}
            </Button>
          ) : null}
          {onEliminar ? (
            <Button variant="outline" size="sm" onClick={onEliminar}>
              <Icon icon={Trash2} className="text-destructive" />
              Eliminar
            </Button>
          ) : null}
        </div>
      </div>

      {/* Métricas calculadas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatPill
          label="Total en ingresos"
          value={formatMoney(cliente.totalIngresos)}
          icon={<Icon icon={Wallet} size={18} />}
        />
        <StatPill
          label="Ingresos registrados"
          value={String(cliente.cantidadIngresos)}
          icon={<Icon icon={CalendarDays} size={18} />}
        />
        <StatPill label="Cliente desde" value={formatDate(cliente.fechaRegistro)} />
      </div>

      {/* Información de contacto */}
      <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
        <ContactRow icon={Mail} label="Correo" value={cliente.correo ?? "—"} />
        <ContactRow icon={Phone} label="Teléfono" value={cliente.telefono ?? "—"} />
        <ContactRow icon={Building2} label="Empresa" value={cliente.empresa ?? "—"} />
        <ContactRow
          icon={StickyNote}
          label="Notas"
          value={cliente.notas ?? "Sin notas"}
        />
      </div>

      {/* Historial de ingresos */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Historial de ingresos</h2>
        <ClienteHistorialIngresos ingresos={cliente.ingresos} />
      </div>
    </div>
  );
}

function ContactRow({
  icon: IconComponent,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon icon={IconComponent} size={15} />
      </div>
      <div className="min-w-0 leading-tight">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="truncate text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}