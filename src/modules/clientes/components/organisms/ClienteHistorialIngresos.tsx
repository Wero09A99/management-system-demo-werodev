"use client";

import { Receipt } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/design-system/organisms/data-table";
import { EstadoIngresoBadge } from "@/design-system/molecules/estado-ingreso-badge";
import { formatDate, formatMoney } from "@/lib/utils";
import type { IngresoDeCliente } from "@/modules/clientes/types/cliente.types";

export type ClienteHistorialIngresosProps = {
  ingresos: IngresoDeCliente[];
  loading?: boolean;
};

/**
 * Organismo ClienteHistorialIngresos: historial de ingresos de un cliente.
 */
export function ClienteHistorialIngresos({ ingresos, loading }: ClienteHistorialIngresosProps) {
  const columns: DataTableColumn<IngresoDeCliente>[] = [
    {
      key: "concepto",
      header: "Concepto",
      cell: (ingreso) => <span className="font-medium text-foreground">{ingreso.concepto}</span>,
    },
    {
      key: "categoria",
      header: "Categoría",
      cell: (ingreso) => <span className="text-sm text-muted-foreground">{ingreso.categoria.nombre}</span>,
    },
    {
      key: "fecha",
      header: "Fecha",
      cell: (ingreso) => <span className="text-sm text-muted-foreground">{formatDate(ingreso.fecha)}</span>,
    },
    {
      key: "estado",
      header: "Estado",
      align: "center",
      cell: (ingreso) => <EstadoIngresoBadge estado={ingreso.estado} />,
    },
    {
      key: "monto",
      header: "Monto",
      align: "right",
      className: "tabular-nums font-medium",
      cell: (ingreso) => formatMoney(ingreso.monto),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={ingresos}
      keyField="id"
      loading={loading}
      emptyIcon={Receipt}
      emptyTitle="Este cliente aún no tiene ingresos."
      emptyDescription="Los ingresos que registres para este cliente aparecerán aquí."
    />
  );
}