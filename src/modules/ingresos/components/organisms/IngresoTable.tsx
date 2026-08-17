"use client";

import { useState } from "react";
import { ArrowDownCircle, FileWarning, MoreHorizontal } from "lucide-react";
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
import { IngresoBadgeEstado } from "@/modules/ingresos/components/molecules/IngresoBadgeEstado";
import { MetodoPagoBadge } from "@/design-system/molecules/metodo-pago-badge";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
  puedeEditarRegistros,
  puedeEliminarMovimiento,
} from "@/modules/auth/utils/permisos";
import { useCrearSolicitud } from "@/modules/solicitudes/hooks/useCrearSolicitud";
import type { Ingreso } from "@/modules/ingresos/types/ingreso.types";

export type IngresoTableProps = {
  ingresos: Ingreso[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyAction?: React.ReactNode;
  onEditar?: (ingreso: Ingreso) => void;
  onEliminar?: (ingreso: Ingreso) => void;
};

/**
 * Organismo IngresoTable: tabla de ingresos con filtros visuales de estado.
 * Única importación cruzada: useCrearSolicitud (para registros ajenos).
 */
export function IngresoTable({
  ingresos,
  loading,
  error,
  onRetry,
  emptyAction,
  onEditar,
  onEliminar,
}: IngresoTableProps) {
  const { rol, usuario } = useAuth();
  const { crear, pending } = useCrearSolicitud();
  const [solicitando, setSolicitando] = useState<Ingreso | null>(null);
  const [motivo, setMotivo] = useState("");

  const puedeEditar = puedeEditarRegistros(rol);

  async function enviarSolicitud() {
    if (!solicitando || motivo.trim().length < 10) return;
    try {
      await crear({
        entidadTipo: "INGRESO",
        entidadId: solicitando.id,
        motivo: motivo.trim(),
      });
      setSolicitando(null);
      setMotivo("");
    } catch {
      // El hook ya muestra el toast de error.
    }
  }

  const columns: DataTableColumn<Ingreso>[] = [
    {
      key: "concepto",
      header: "Concepto",
      cell: (ingreso) => (
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: ingreso.categoria.color ?? undefined }}
            aria-hidden="true"
          />
          <span className="font-medium text-foreground">{ingreso.concepto}</span>
        </div>
      ),
    },
    {
      key: "cliente",
      header: "Cliente",
      cell: (ingreso) =>
        ingreso.cliente ? (
          <div className="leading-tight">
            <p className="text-sm text-foreground">{ingreso.cliente.nombre}</p>
            {ingreso.cliente.empresa ? (
              <p className="text-xs text-muted-foreground">{ingreso.cliente.empresa}</p>
            ) : null}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
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
      cell: (ingreso) => <IngresoBadgeEstado estado={ingreso.estado} />,
    },
    {
      key: "metodoPago",
      header: "Método",
      cell: (ingreso) => <MetodoPagoBadge metodo={ingreso.metodoPago} />,
    },
    {
      key: "monto",
      header: "Monto",
      align: "right",
      className: "tabular-nums font-medium",
      cell: (ingreso) => formatMoney(ingreso.monto),
    },
    {
      key: "acciones",
      header: "",
      align: "right",
      cell: (ingreso) => {
        const esPropietario = puedeEliminarMovimiento(rol, ingreso.creadoPorId, usuario?.id);
        const hayAcciones = Boolean(onEditar || onEliminar);
        if (!hayAcciones) return null;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={`Acciones de ${ingreso.concepto}`}
              >
                <Icon icon={MoreHorizontal} className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEditar ? (
                <DropdownMenuItem onClick={() => onEditar(ingreso)}>Editar</DropdownMenuItem>
              ) : null}
              {esPropietario && onEliminar ? (
                <DropdownMenuItem variant="destructive" onClick={() => onEliminar(ingreso)}>
                  Eliminar
                </DropdownMenuItem>
              ) : puedeEditar && !esPropietario ? (
                <DropdownMenuItem onClick={() => setSolicitando(ingreso)}>
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
        data={ingresos}
        keyField="id"
        loading={loading}
        error={error ?? undefined}
        onRetry={onRetry}
        emptyAction={emptyAction}
        emptyIcon={ArrowDownCircle}
        emptyTitle="No hay ingresos registrados."
        emptyDescription="Registra tu primer ingreso para empezar a llevar el control."
      />

      <Modal
        open={solicitando !== null}
        onOpenChange={(open) => !open && setSolicitando(null)}
        title="Solicitar eliminación"
        description={`Pide a un administrador eliminar el ingreso "${solicitando?.concepto}".`}
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