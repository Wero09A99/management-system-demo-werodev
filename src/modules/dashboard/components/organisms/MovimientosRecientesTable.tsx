"use client";

import { ArrowDownCircle, ArrowUpCircle, History } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/design-system/atoms/badge";
import { Icon } from "@/design-system/atoms/icon";
import { EmptyState } from "@/design-system/organisms/empty-state";
import { formatDate, formatMoney } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { MovimientoReciente } from "@/modules/dashboard/types/dashboard.types";

export type MovimientosRecientesTableProps = {
  movimientos?: MovimientoReciente[];
  loading?: boolean;
};

/**
 * Organismo MovimientosRecientesTable: últimos movimientos del negocio.
 */
export function MovimientosRecientesTable({ movimientos, loading }: MovimientosRecientesTableProps) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Movimientos recientes</CardTitle>
        <CardDescription>Últimos ingresos y gastos registrados</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : movimientos && movimientos.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead className="hidden sm:table-cell">Categoría</TableHead>
                <TableHead className="hidden md:table-cell">Fecha</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimientos.map((movimiento) => {
                const esIngreso = movimiento.tipo === "INGRESO";
                return (
                  <TableRow key={`${movimiento.tipo}-${movimiento.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon
                          icon={esIngreso ? ArrowDownCircle : ArrowUpCircle}
                          className={cn(
                            "size-4",
                            esIngreso ? "text-emerald-600" : "text-red-600",
                          )}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {movimiento.concepto}
                          </p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {formatDate(movimiento.fecha)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: movimiento.categoriaColor ?? undefined }}
                          aria-hidden="true"
                        />
                        <span className="text-sm text-muted-foreground">
                          {movimiento.categoriaNombre}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {formatDate(movimiento.fecha)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          "tabular-nums",
                          esIngreso
                            ? "border-emerald-600/30 text-emerald-700"
                            : "border-red-600/30 text-red-700",
                        )}
                      >
                        {esIngreso ? "+" : "−"}
                        {formatMoney(movimiento.monto)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            icon={History}
            title="Aún no hay movimientos."
            description="Registra tu primer ingreso o gasto para verlos aquí."
            className="m-4 border-0 bg-muted/30 py-8"
          />
        )}
      </CardContent>
    </Card>
  );
}