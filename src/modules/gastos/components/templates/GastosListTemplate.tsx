"use client";

import { useState } from "react";
import { Plus, Wallet } from "lucide-react";
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
import { useGastos } from "@/modules/gastos/hooks/useGastos";
import { useGastoMutations } from "@/modules/gastos/hooks/useGastoMutations";
import { useCategorias } from "@/lib/hooks/useCategorias";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { puedeEditarRegistros } from "@/modules/auth/utils/permisos";
import { GastoForm } from "@/modules/gastos/components/organisms/GastoForm";
import { GastoTable } from "@/modules/gastos/components/organisms/GastoTable";
import type { Gasto } from "@/modules/gastos/types/gasto.types";
import type { GastoFormValues } from "@/modules/gastos/schemas/gasto.schema";

/**
 * Template GastosListTemplate: página de gastos con filtros, tabla,
 * modal de alta/edición y borrado.
 */
export function GastosListTemplate() {
  const { rol } = useAuth();
  const {
    gastos,
    total,
    page,
    totalPages,
    loading,
    error,
    search,
    setSearch,
    categoriaId,
    setCategoriaId,
    desde,
    setDesde,
    hasta,
    setHasta,
    limpiarFiltros,
    recargar,
    irAPagina,
  } = useGastos();

  const { crear, actualizar, eliminar, pending } = useGastoMutations();
  const { categorias, loading: loadingCategorias, error: errorCategorias } =
    useCategorias("GASTO");

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Gasto | null>(null);
  const [eliminando, setEliminando] = useState<Gasto | null>(null);

  function abrirCrear() {
    setEditando(null);
    setModalOpen(true);
  }

  function abrirEditar(gasto: Gasto) {
    setEditando(gasto);
    setModalOpen(true);
  }

  async function enviar(values: GastoFormValues) {
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
    search !== "" || categoriaId !== undefined || desde || hasta;

  const puedeEditar = puedeEditarRegistros(rol);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gastos"
        description="Lleva el control de lo que el negocio desembolsa."
        actions={
          puedeEditar ? (
            <Button onClick={abrirCrear}>
              <Icon icon={Plus} />
              Nuevo gasto
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar concepto…"
          className="lg:col-span-2"
        />
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

      <GastoTable
        gastos={gastos}
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
        onEliminar={puedeEditar ? (gasto) => setEliminando(gasto) : undefined}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {total} gasto{total === 1 ? "" : "s"} en total
        </p>
        <Pagination page={page} totalPages={totalPages} onPageChange={irAPagina} />
      </div>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editando ? "Editar gasto" : "Nuevo gasto"}
        description={
          editando
            ? "Actualiza los datos de este gasto."
            : "Registra un gasto del negocio."
        }
      >
        <GastoForm
          gasto={editando ?? undefined}
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
              <Icon icon={Wallet} className="text-destructive" />
              ¿Eliminar este gasto?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el gasto <strong>{"\u201C"}{eliminando?.concepto}{"\u201D"}</strong>. Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
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