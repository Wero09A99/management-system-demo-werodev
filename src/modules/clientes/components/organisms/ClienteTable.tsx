"use client";

import { MoreHorizontal, Users } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/design-system/organisms/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/design-system/atoms/button";
import { Icon } from "@/design-system/atoms/icon";
import { formatMoney } from "@/lib/utils";
import { ClienteAvatarNombre } from "@/modules/clientes/components/molecules/ClienteAvatarNombre";
import { ClienteBadgeEstado } from "@/modules/clientes/components/molecules/ClienteBadgeEstado";
import type { ClienteResumen } from "@/modules/clientes/types/cliente.types";

export type ClienteTableProps = {
  clientes: ClienteResumen[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** Acción mostrada en el estado vacío (p. ej. limpiar filtros). */
  emptyAction?: React.ReactNode;
  onVer: (cliente: ClienteResumen) => void;
  onEditar?: (cliente: ClienteResumen) => void;
  onEliminar?: (cliente: ClienteResumen) => void;
  onCambiarEstado?: (cliente: ClienteResumen) => void;
};

/**
 * Organismo ClienteTable: tabla de clientes con métricas agregadas y acciones.
 */
export function ClienteTable({
  clientes,
  loading,
  error,
  onRetry,
  emptyAction,
  onVer,
  onEditar,
  onEliminar,
  onCambiarEstado,
}: ClienteTableProps) {
  const columns: DataTableColumn<ClienteResumen>[] = [
    {
      key: "nombre",
      header: "Cliente",
      cell: (cliente) => (
        <ClienteAvatarNombre nombre={cliente.nombre} empresa={cliente.empresa} />
      ),
    },
    {
      key: "contacto",
      header: "Contacto",
      cell: (cliente) => (
        <div className="leading-tight">
          {cliente.correo ? (
            <p className="truncate text-sm text-foreground">{cliente.correo}</p>
          ) : null}
          <p className="truncate text-xs text-muted-foreground">
            {cliente.telefono ?? "Sin teléfono"}
          </p>
        </div>
      ),
    },
    {
      key: "cantidadIngresos",
      header: "Ingresos",
      align: "right",
      className: "tabular-nums",
      cell: (cliente) => String(cliente.cantidadIngresos),
    },
    {
      key: "totalIngresos",
      header: "Total ingresos",
      align: "right",
      className: "tabular-nums font-medium",
      cell: (cliente) => formatMoney(cliente.totalIngresos),
    },
    {
      key: "estado",
      header: "Estado",
      align: "center",
      cell: (cliente) => <ClienteBadgeEstado activo={cliente.activo} />,
    },
    {
      key: "acciones",
      header: "",
      align: "right",
      cell: (cliente) => {
        const hayAcciones = Boolean(onEditar || onEliminar || onCambiarEstado);
        if (!hayAcciones) return null;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={`Acciones de ${cliente.nombre}`}
              >
                <Icon icon={MoreHorizontal} className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onVer(cliente)}>Ver detalle</DropdownMenuItem>
              {onEditar ? (
                <DropdownMenuItem onClick={() => onEditar(cliente)}>Editar</DropdownMenuItem>
              ) : null}
              {onCambiarEstado ? (
                <DropdownMenuItem onClick={() => onCambiarEstado(cliente)}>
                  {cliente.activo ? "Desactivar" : "Activar"}
                </DropdownMenuItem>
              ) : null}
              {onEliminar ? (
                <DropdownMenuItem variant="destructive" onClick={() => onEliminar(cliente)}>
                  Eliminar
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
      data={clientes}
      keyField="id"
      loading={loading}
      error={error ?? undefined}
      onRetry={onRetry}
      emptyAction={emptyAction}
      emptyIcon={Users}
      emptyTitle="No hay clientes todavía."
      emptyDescription="Crea tu primer cliente para empezar a registrar sus ingresos."
    />
  );
}