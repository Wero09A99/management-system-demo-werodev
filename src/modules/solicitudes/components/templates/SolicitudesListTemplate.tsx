"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Icon } from "@/design-system/atoms/icon";
import { Input } from "@/design-system/atoms/input";
import { Label } from "@/design-system/atoms/label";
import { PageHeader } from "@/design-system/organisms/page-header";
import { Pagination } from "@/design-system/molecules/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/atoms/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useSolicitudes } from "@/modules/solicitudes/hooks/useSolicitudes";
import { useResolverSolicitud } from "@/modules/solicitudes/hooks/useResolverSolicitud";
import { SolicitudTable } from "@/modules/solicitudes/components/organisms/SolicitudTable";
import type { EstadoSolicitud, Solicitud } from "@/modules/solicitudes/types/solicitud.types";

type FiltroEstado = "todas" | EstadoSolicitud;

const FILTROS_ESTADO: { value: FiltroEstado; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "PENDIENTE", label: "Pendientes" },
  { value: "APROBADA", label: "Aprobadas" },
  { value: "RECHAZADA", label: "Rechazadas" },
];

/**
 * Template SolicitudesListTemplate: bandeja de solicitudes de eliminación.
 * ADMIN ve todas y resuelve; OPERADOR ve solo las propias (sin resolver).
 */
export function SolicitudesListTemplate() {
  const { rol } = useAuth();
  const {
    solicitudes,
    total,
    page,
    totalPages,
    loading,
    error,
    estado,
    setEstado,
    recargar,
    irAPagina,
  } = useSolicitudes();

  const { resolver, pending } = useResolverSolicitud();
  const [resolviendo, setResolviendo] = useState<Solicitud | null>(null);
  const [accion, setAccion] = useState<"APROBAR" | "RECHAZAR">("APROBAR");
  const [comentarioRechazo, setComentarioRechazo] = useState("");

  const esAdmin = rol === "ADMIN";

  function abrirResolver(solicitud: Solicitud, a: "APROBAR" | "RECHAZAR") {
    setAccion(a);
    setComentarioRechazo("");
    setResolviendo(solicitud);
  }

  async function confirmarResolver() {
    if (!resolviendo) return;
    if (accion === "RECHAZAR" && !comentarioRechazo.trim()) return;
    await resolver(
      resolviendo.id,
      accion === "APROBAR"
        ? { accion: "APROBAR" }
        : { accion: "RECHAZAR", comentario: comentarioRechazo.trim() },
    );
    setResolviendo(null);
    recargar();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitudes"
        description="Solicitudes de eliminación de ingresos y gastos registrados por otros usuarios."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={estado ?? "todas"}
          onValueChange={(v: FiltroEstado) => setEstado(v === "todas" ? undefined : v)}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Filtrar por estado">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {FILTROS_ESTADO.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SolicitudTable
        solicitudes={solicitudes}
        loading={loading}
        error={error}
        onRetry={recargar}
        onAprobar={esAdmin ? (s) => abrirResolver(s, "APROBAR") : undefined}
        onRechazar={esAdmin ? (s) => abrirResolver(s, "RECHAZAR") : undefined}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {total} solicitud{total === 1 ? "" : "es"} en total
        </p>
        <Pagination page={page} totalPages={totalPages} onPageChange={irAPagina} />
      </div>

      <AlertDialog open={resolviendo !== null} onOpenChange={(open) => !open && setResolviendo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon
                icon={accion === "APROBAR" ? CheckCircle2 : XCircle}
                className={accion === "APROBAR" ? "text-emerald-600" : "text-destructive"}
              />
              {accion === "APROBAR" ? "¿Aprobar y eliminar?" : "¿Rechazar solicitud?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {accion === "APROBAR"
                ? `Se eliminará el ${resolviendo?.entidadTipo.toLowerCase()} "${resolviendo?.entidadDescripcion ?? "sin concepto"}" y la solicitud quedará aprobada.`
                : "La solicitud quedará rechazada y el registro se conservará. Debes indicar el motivo del rechazo."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {accion === "RECHAZAR" ? (
            <div className="grid gap-2">
              <Label htmlFor="comentario-rechazo">Motivo del rechazo</Label>
              <Input
                id="comentario-rechazo"
                placeholder="Explica por qué se rechaza la solicitud…"
                value={comentarioRechazo}
                onChange={(e) => setComentarioRechazo(e.target.value)}
                maxLength={600}
                disabled={pending}
              />
            </div>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant={accion === "APROBAR" ? "destructive" : "outline"}
              onClick={(e) => {
                e.preventDefault();
                confirmarResolver();
              }}
              disabled={pending || (accion === "RECHAZAR" && !comentarioRechazo.trim())}
            >
              {accion === "APROBAR" ? "Aprobar y eliminar" : "Rechazar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}