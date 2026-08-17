"use client";

import { MoreHorizontal, Pencil, Users } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/design-system/organisms/data-table";
import { Badge } from "@/design-system/atoms/badge";
import { Button } from "@/design-system/atoms/button";
import { Icon } from "@/design-system/atoms/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UsuarioResumen } from "../../types/usuario.types";
import { ROL_LABELS } from "../../types/usuario.types";

export type UsuarioTableProps = {
  usuarios: UsuarioResumen[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onEditar?: (usuario: UsuarioResumen) => void;
  usuarioActualId?: string;
};

/**
 * Organismo UsuarioTable: tabla de usuarios con acciones de edición.
 */
export function UsuarioTable({
  usuarios,
  loading,
  error,
  onRetry,
  onEditar,
  usuarioActualId,
}: UsuarioTableProps) {
  const columns: DataTableColumn<UsuarioResumen>[] = [
    {
      key: "nombre",
      header: "Nombre",
      cell: (usuario) => <span className="font-medium">{usuario.nombre}</span>,
    },
    {
      key: "correo",
      header: "Correo",
      cell: (usuario) => usuario.correo,
    },
    {
      key: "rol",
      header: "Rol",
      cell: (usuario) => <Badge variant="secondary">{ROL_LABELS[usuario.rol] ?? usuario.rol}</Badge>,
    },
    {
      key: "activo",
      header: "Estado",
      cell: (usuario) =>
        usuario.activo ? (
          <Badge variant="default">Activo</Badge>
        ) : (
          <Badge variant="destructive">Inactivo</Badge>
        ),
    },
    {
      key: "ultimoLogin",
      header: "Último acceso",
      cell: (usuario) => (usuario.ultimoLogin ? new Date(usuario.ultimoLogin).toLocaleDateString("es-MX") : "—"),
    },
    {
      key: "acciones",
      header: "",
      align: "right",
      cell: (usuario) => {
        if (!onEditar) return null;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={`Acciones de ${usuario.nombre}`}
              >
                <Icon icon={MoreHorizontal} className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditar(usuario)} disabled={usuario.id === usuarioActualId}>
                <Icon icon={Pencil} />
                Editar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={usuarios}
      keyField="id"
      loading={loading}
      error={error ?? undefined}
      onRetry={onRetry}
      emptyIcon={Users}
      emptyTitle="No hay usuarios todavía."
      emptyDescription="Crea el primer usuario para empezar a gestionar accesos."
    />
  );
}