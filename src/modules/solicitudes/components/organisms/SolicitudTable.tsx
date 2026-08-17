"use client";

import { CheckCircle2, ClipboardList, MoreHorizontal, XCircle } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/design-system/organisms/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/design-system/atoms/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/design-system/atoms/icon";
import { formatDate } from "@/lib/utils";
import type { EstadoSolicitud, Solicitud } from "@/modules/solicitudes/types/solicitud.types";

export type SolicitudTableProps = {
  solicitudes: Solicitud[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onAprobar?: (solicitud: Solicitud) => void;
  onRechazar?: (solicitud: Solicitud) => void;
};

const LABEL_ESTADO: Record<EstadoSolicitud, string> = {
  PENDIENTE: "Pendiente",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
};

function BadgeEstado({ estado }: { estado: EstadoSolicitud }) {
  const className =
    estado === "PENDIENTE"
      ? "bg-amber-100 text-amber-700"
      : estado === "APROBADA"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-destructive/10 text-destructive";
  return <Badge variant="outline" className={className}>{LABEL_ESTADO[estado]}</Badge>;
}

/**
 * Organismo SolicitudTable: tabla de solicitudes de eliminación.
 * ADMIN ve acciones de aprobar/rechazar en las pendientes.
 */
export function SolicitudTable({
  solicitudes,
  loading,
  error,
  onRetry,
  onAprobar,
  onRechazar,
}: SolicitudTableProps) {
  const columns: DataTableColumn<Solicitud>[] = [
    {
      key: "entidad",
      header: "Solicita eliminar",
      cell: (s) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {s.entidadDescripcion ?? "Sin concepto"}
          </p>
          <p className="text-xs text-muted-foreground">
            {s.entidadTipo.toLowerCase()}
            {s.entidadDetalle
              ? ` · $${new Intl.NumberFormat("es-MX", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(s.entidadDetalle.monto)}`
              : ""}
          </p>
          {s.entidadDetalle?.cliente ? (
            <p className="text-xs text-muted-foreground">
              Cliente: {s.entidadDetalle.cliente.nombre}
            </p>
          ) : null}
          {s.entidadDetalle?.categoria ? (
            <p className="text-xs text-muted-foreground">
              Categoría: {s.entidadDetalle.categoria.nombre}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "solicitante",
      header: "Solicitante",
      cell: (s) => (
        <div className="leading-tight">
          <p className="text-sm text-foreground">{s.solicitante.nombre}</p>
          <p className="text-xs text-muted-foreground">{s.solicitante.correo}</p>
        </div>
      ),
    },
    {
      key: "motivo",
      header: "Motivo",
      cell: (s) => <span className="line-clamp-2 max-w-64 text-sm text-muted-foreground">{s.motivo}</span>,
    },
    {
      key: "fecha",
      header: "Fecha",
      cell: (s) => <span className="text-sm text-muted-foreground">{formatDate(s.createdAt)}</span>,
    },
    {
      key: "estado",
      header: "Estado",
      align: "center",
      cell: (s) => <BadgeEstado estado={s.estado} />,
    },
    {
      key: "acciones",
      header: "",
      align: "right",
      cell: (s) => {
        const pendiente = s.estado === "PENDIENTE";
        const hayAcciones = pendiente && (Boolean(onAprobar) || Boolean(onRechazar));
        if (!hayAcciones) return null;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" aria-label={`Acciones de solicitud`}>
                <Icon icon={MoreHorizontal} className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onAprobar ? (
                <DropdownMenuItem onClick={() => onAprobar(s)}>
                  <Icon icon={CheckCircle2} className="text-emerald-600" />
                  Aprobar
                </DropdownMenuItem>
              ) : null}
              {onRechazar ? (
                <DropdownMenuItem variant="destructive" onClick={() => onRechazar(s)}>
                  <Icon icon={XCircle} />
                  Rechazar
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={solicitudes}
      keyField="id"
      loading={loading}
      error={error ?? undefined}
      onRetry={onRetry}
      emptyIcon={ClipboardList}
      emptyTitle="No hay solicitudes registradas."
      emptyDescription="Cuando un operador pida eliminar un registro ajeno, aparecerá aquí."
    />
  );
}