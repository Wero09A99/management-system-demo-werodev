"use client";

import { MoreHorizontal, Pencil, Tags } from "lucide-react";
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
import type { CategoriaResumen } from "../../types/categoria.types";
import { TIPO_CATEGORIA_LABELS } from "../../types/categoria.types";

export type CategoriaTableProps = {
  categorias: CategoriaResumen[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onEditar?: (categoria: CategoriaResumen) => void;
};

/**
 * Organismo CategoriaTable: tabla de categorías con acciones de edición.
 */
export function CategoriaTable({
  categorias,
  loading,
  error,
  onRetry,
  onEditar,
}: CategoriaTableProps) {
  const columns: DataTableColumn<CategoriaResumen>[] = [
    {
      key: "nombre",
      header: "Nombre",
      cell: (categoria) => (
        <span className="flex items-center gap-2 font-medium">
          {categoria.color ? (
            <span
              className="inline-block size-3 rounded-full border border-border"
              style={{ backgroundColor: categoria.color }}
              aria-hidden="true"
            />
          ) : null}
          {categoria.nombre}
        </span>
      ),
    },
    {
      key: "tipo",
      header: "Tipo",
      cell: (categoria) => (
        <Badge variant={categoria.tipo === "INGRESO" ? "default" : "secondary"}>
          {TIPO_CATEGORIA_LABELS[categoria.tipo]}
        </Badge>
      ),
    },
    {
      key: "activa",
      header: "Estado",
      cell: (categoria) =>
        categoria.activa ? (
          <Badge variant="default">Activa</Badge>
        ) : (
          <Badge variant="destructive">Inactiva</Badge>
        ),
    },
    {
      key: "acciones",
      header: "",
      align: "right",
      cell: (categoria) => {
        if (!onEditar) return null;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={`Acciones de ${categoria.nombre}`}
              >
                <Icon icon={MoreHorizontal} className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditar(categoria)}>
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
      data={categorias}
      keyField="id"
      loading={loading}
      error={error ?? undefined}
      onRetry={onRetry}
      emptyIcon={Tags}
      emptyTitle="No hay categorías todavía."
      emptyDescription="Crea la primera categoría para clasificar ingresos y gastos."
    />
  );
}