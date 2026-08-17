"use client";

import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/design-system/organisms/empty-state";
import { Button } from "@/design-system/atoms/button";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  /** Clave única de la columna (para key de React). */
  key: string;
  header: string;
  /** Alineación del header y las celdas. */
  align?: "left" | "right" | "center";
  /** Clases adicionales para las celdas de esta columna. */
  className?: string;
  /** Render de la celda. */
  cell: (item: T) => ReactNode;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  keyField?: keyof T;
  loading?: boolean;
  /** Estado vacío. */
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  /** Estado de error (con mensaje de qué pasó y qué hacer). */
  error?: string;
  onRetry?: () => void;
  className?: string;
};

/**
 * Organismo DataTable genérico y tipado.
 * Responsable de estados de carga, vacío y error.
 */
export function DataTable<T>({
  columns,
  data,
  keyField,
  loading,
  emptyIcon,
  emptyTitle = "No hay registros todavía.",
  emptyDescription,
  emptyAction,
  error,
  onRetry,
  className,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={cn("space-y-3", className)} aria-busy="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No se pudo cargar la información."
        description={error}
        className={className}
        action={
          onRetry ? (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Reintentar
            </Button>
          ) : null
        }
      />
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        className={className}
      />
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => {
            const id = keyField ? String(item[keyField] ?? index) : index;
            return (
              <TableRow key={id}>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.className,
                    )}
                  >
                    {col.cell(item)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}