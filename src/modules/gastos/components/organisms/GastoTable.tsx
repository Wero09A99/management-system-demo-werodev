"use client";

import { useState } from "react";
import { ArrowUpCircle, FileWarning, MoreHorizontal } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/design-system/organisms/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/design-system/atoms/button";
import { Textarea } from "@/design-system/atoms/textarea";
import { Label } from "@/design-system/atoms/label";
import { Modal } from "@/design-system/organisms/modal";
import { Icon } from "@/design-system/atoms/icon";
import { formatDate, formatMoney } from "@/lib/utils";
import { MetodoPagoBadge } from "@/design-system/molecules/metodo-pago-badge";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
  puedeEditarRegistros,
  puedeEliminarMovimiento,
} from "@/modules/auth/utils/permisos";
import { useCrearSolicitud } from "@/modules/solicitudes/hooks/useCrearSolicitud";
import type { Gasto } from "@/modules/gastos/types/gasto.types";

export type GastoTableProps = {
  gastos: Gasto[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyAction?: React.ReactNode;
  onEditar?: (gasto: Gasto) => void;
  onEliminar?: (gasto: Gasto) => void;
};

/**
 * Organismo GastoTable: tabla de gastos con acciones por fila.
 * Única importación cruzada: useCrearSolicitud (para registros ajenos).
 */
export function GastoTable({
  gastos,
  loading,
  error,
  onRetry,
  emptyAction,
  onEditar,
  onEliminar,
}: GastoTableProps) {
  const { rol, usuario } = useAuth();
  const { crear, pending } = useCrearSolicitud();
  const [solicitando, setSolicitando] = useState<Gasto | null>(null);
  const [motivo, setMotivo] = useState("");

  const puedeEditar = puedeEditarRegistros(rol);

  async function enviarSolicitud() {
    if (!solicitando || motivo.trim().length < 10) return;
    try {
      await crear({
        entidadTipo: "GASTO",
        entidadId: solicitando.id,
        motivo: motivo.trim(),
      });
      setSolicitando(null);
      setMotivo("");
    } catch {
      // El hook ya muestra el toast de error.
    }
  }

  const columns: DataTableColumn<Gasto>[] = [
    {
      key: "concepto",
      header: "Concepto",
      cell: (gasto) => (
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: gasto.categoria.color ?? undefined }}
            aria-hidden="true"
          />
          <span className="font-medium text-foreground">{gasto.concepto}</span>
        </div>
      ),
    },
    {
      key: "categoria",
      header: "Categoría",
      cell: (gasto) => (
        <span className="text-sm text-muted-foreground">{gasto.categoria.nombre}</span>
      ),
    },
    {
      key: "fecha",
      header: "Fecha",
      cell: (gasto) => <span className="text-sm text-muted-foreground">{formatDate(gasto.fecha)}</span>,
    },
    {
      key: "metodoPago",
      header: "Método",
      cell: (gasto) => <MetodoPagoBadge metodo={gasto.metodoPago} />,
    },
    {
      key: "monto",
      header: "Monto",
      align: "right",
      className: "tabular-nums font-medium",
      cell: (gasto) => formatMoney(gasto.monto),
    },
    {
      key: "acciones",
      header: "",
      align: "right",
      cell: (gasto) => {
        const esPropietario = puedeEliminarMovimiento(rol, gasto.creadoPorId, usuario?.id);
        const hayAcciones = Boolean(onEditar || onEliminar);
        if (!hayAcciones) return null;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={`Acciones de ${gasto.concepto}`}
              >
                <Icon icon={MoreHorizontal} className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEditar ? (
                <DropdownMenuItem onClick={() => onEditar(gasto)}>Editar</DropdownMenuItem>
              ) : null}
              {esPropietario && onEliminar ? (
                <DropdownMenuItem variant="destructive" onClick={() => onEliminar(gasto)}>
                  Eliminar
                </DropdownMenuItem>
              ) : puedeEditar && !esPropietario ? (
                <DropdownMenuItem onClick={() => setSolicitando(gasto)}>
                  Solicitar eliminación
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={gastos}
        keyField="id"
        loading={loading}
        error={error ?? undefined}
        onRetry={onRetry}
        emptyAction={emptyAction}
        emptyIcon={ArrowUpCircle}
        emptyTitle="No hay gastos registrados."
        emptyDescription="Registra tu primer gasto para empezar a llevar el control."
      />

      <Modal
        open={solicitando !== null}
        onOpenChange={(open) => !open && setSolicitando(null)}
        title="Solicitar eliminación"
        description={`Pide a un administrador eliminar el gasto "${solicitando?.concepto}".`}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground">
            <Icon icon={FileWarning} className="mt-0.5 shrink-0 text-muted-foreground" />
            <p>
              Solo puedes eliminar directamente los registros que tú creaste. Para este registro
              deberás enviar una solicitud y esperar la aprobación del administrador.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo</Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Explica por qué debe eliminarse (mínimo 10 caracteres)."
              rows={4}
              maxLength={600}
            />
            <p className="text-xs text-muted-foreground">
              {motivo.trim().length < 10
                ? `Faltan ${10 - motivo.trim().length} caracteres.`
                : "El motivo es válido."}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSolicitando(null)} disabled={pending}>
              Cancelar
            </Button>
            <Button onClick={() => void enviarSolicitud()} disabled={pending || motivo.trim().length < 10}>
              {pending ? "Enviando…" : "Enviar solicitud"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}