"use client";

import { useState } from "react";
import { Plus, ReceiptText } from "lucide-react";
import { Button } from "@/design-system/atoms/button";
import { Icon } from "@/design-system/atoms/icon";
import { PageHeader } from "@/design-system/organisms/page-header";
import { Modal } from "@/design-system/organisms/modal";
import { SearchInput } from "@/design-system/molecules/search-input";
import { Pagination } from "@/design-system/molecules/pagination";
import { DateRangeInput } from "@/design-system/molecules/date-range-input";
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
import { useIngresos } from "@/modules/ingresos/hooks/useIngresos";
import { useIngresoMutations } from "@/modules/ingresos/hooks/useIngresoMutations";
import { useCategorias } from "@/lib/hooks/useCategorias";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { puedeEditarRegistros } from "@/modules/auth/utils/permisos";
import {
  ESTADO_INGRESO_OPTIONS,
  type EstadoIngreso,
} from "@/design-system/molecules/estado-ingreso-badge";
import { IngresoForm } from "@/modules/ingresos/components/organisms/IngresoForm";
import { IngresoTable } from "@/modules/ingresos/components/organisms/IngresoTable";
import type { Ingreso } from "@/modules/ingresos/types/ingreso.types";
import type { IngresoFormValues } from "@/modules/ingresos/schemas/ingreso.schema";

/**
 * Template IngresosListTemplate: página de ingresos con filtros, tabla,
 * modal de alta/edición y borrado.
 */
export function IngresosListTemplate() {
  const { rol } = useAuth();
  const {
    ingresos,
    total,
    page,
    totalPages,
    loading,
    error,
    search,
    setSearch,
    estado,
    setEstado,
    categoriaId,
    setCategoriaId,
    desde,
    setDesde,
    hasta,
    setHasta,
    limpiarFiltros,
    recargar,
    irAPagina,
  } = useIngresos();

  const { crear, actualizar, eliminar, pending } = useIngresoMutations();
  const { categorias, loading: loadingCategorias, error: errorCategorias } =
    useCategorias("INGRESO");

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Ingreso | null>(null);
  const [eliminando, setEliminando] = useState<Ingreso | null>(null);

  function abrirCrear() {
    setEditando(null);
    setModalOpen(true);
  }

  function abrirEditar(ingreso: Ingreso) {
    setEditando(ingreso);
    setModalOpen(true);
  }

  async function enviar(values: IngresoFormValues) {
    if (editando) {
      await actualizar(editando.id, values);
    } else {
      await crear(values);
    }
    setModalOpen(false);
    recargar();
  }

  async function confirmarEliminar() {
    if (!eliminando) return;
    await eliminar(eliminando.id);
    setEliminando(null);
    recargar();
  }

  const hayFiltros =
    search !== "" || estado !== undefined || categoriaId !== undefined || desde || hasta;

  const puedeEditar = puedeEditarRegistros(rol);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ingresos"
        description="Registra el dinero que entra al negocio."
        actions={
          puedeEditar ? (
            <Button onClick={abrirCrear}>
              <Icon icon={Plus} />
              Nuevo ingreso
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar concepto…"
          className="lg:col-span-2"
        />
        <Select value={estado ?? "todos"} onValueChange={(v) => setEstado(v === "todos" ? undefined : (v as EstadoIngreso))}>
          <SelectTrigger className="w-full" aria-label="Filtrar por estado">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            {ESTADO_INGRESO_OPTIONS.map((e) => (
              <SelectItem key={e.value} value={e.value}>
                {e.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoriaId ?? "todas"} onValueChange={(v) => setCategoriaId(v === "todas" ? undefined : v)}>
          <SelectTrigger className="w-full" aria-label="Filtrar por categoría">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las categorías</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DateRangeInput
          desde={desde}
          hasta={hasta}
          onDesdeChange={setDesde}
          onHastaChange={setHasta}
        />
      </div>

      <IngresoTable
        ingresos={ingresos}
        loading={loading}
        error={error}
        onRetry={recargar}
        emptyAction={
          hayFiltros ? (
            <Button variant="outline" size="sm" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          ) : undefined
        }
        onEditar={puedeEditar ? abrirEditar : undefined}
        onEliminar={puedeEditar ? (ingreso) => setEliminando(ingreso) : undefined}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {total} ingreso{total === 1 ? "" : "s"} en total
        </p>
        <Pagination page={page} totalPages={totalPages} onPageChange={irAPagina} />
      </div>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editando ? "Editar ingreso" : "Nuevo ingreso"}
        description={
          editando
            ? "Actualiza los datos de este ingreso."
            : "Registra un ingreso del negocio."
        }
      >
        <IngresoForm
          ingreso={editando ?? undefined}
          submitting={pending}
          onSubmit={enviar}
          onCancel={() => setModalOpen(false)}
          categorias={categorias}
          loadingCategorias={loadingCategorias}
          errorCategorias={errorCategorias}
        />
      </Modal>

      <AlertDialog open={eliminando !== null} onOpenChange={(open) => !open && setEliminando(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon icon={ReceiptText} className="text-destructive" />
              ¿Eliminar este ingreso?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el ingreso <strong>{"\u201C"}{eliminando?.concepto}{"\u201D"}</strong>. Esta
              acción no se puede deshacer.
            </AlertDialogDescription>          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                confirmarEliminar();
              }}
              disabled={pending}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}