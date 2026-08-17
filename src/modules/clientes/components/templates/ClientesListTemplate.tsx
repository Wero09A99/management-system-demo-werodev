"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, UserX } from "lucide-react";
import { Button } from "@/design-system/atoms/button";
import { Icon } from "@/design-system/atoms/icon";
import { PageHeader } from "@/design-system/organisms/page-header";
import { Modal } from "@/design-system/organisms/modal";
import { SearchInput } from "@/design-system/molecules/search-input";
import { Pagination } from "@/design-system/molecules/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useClientes } from "@/modules/clientes/hooks/useClientes";
import { useClienteMutations } from "@/modules/clientes/hooks/useClienteMutations";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
  puedeEditarRegistros,
  puedeEliminarCliente,
} from "@/modules/auth/utils/permisos";
import { ClienteForm } from "@/modules/clientes/components/organisms/ClienteForm";
import { ClienteTable } from "@/modules/clientes/components/organisms/ClienteTable";
import type { ClienteResumen } from "@/modules/clientes/types/cliente.types";
import type { ClienteFormValues } from "@/modules/clientes/schemas/cliente.schema";

type FiltroEstado = "todos" | "activos" | "inactivos";

/**
 * Template ClientesListTemplate: página de listado de clientes.
 * Compone búsqueda, filtro, tabla, paginación, modal de alta/edición y borrado.
 */
export function ClientesListTemplate() {
  const router = useRouter();
  const { rol } = useAuth();
  const {
    clientes,
    total,
    page,
    totalPages,
    loading,
    error,
    search,
    setSearch,
    activo,
    setActivo,
    limpiarFiltros,
    recargar,
    irAPagina,
  } = useClientes();

  const { crear, actualizar, eliminar, pending } = useClienteMutations();

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<ClienteResumen | null>(null);
  const [eliminando, setEliminando] = useState<ClienteResumen | null>(null);

  const filtroEstado: FiltroEstado =
    activo === undefined ? "todos" : activo ? "activos" : "inactivos";

  function abrirCrear() {
    setEditando(null);
    setModalOpen(true);
  }

  function abrirEditar(cliente: ClienteResumen) {
    setEditando(cliente);
    setModalOpen(true);
  }

  async function enviar(values: ClienteFormValues) {
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

  async function cambiarEstado(cliente: ClienteResumen) {
    await actualizar(cliente.id, { activo: !cliente.activo });
    recargar();
  }

  const hayFiltros = search !== "" || activo !== undefined;

  const puedeEditar = puedeEditarRegistros(rol);
  const puedeEliminar = puedeEliminarCliente(rol);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Administra las personas y empresas que generan ingresos."
        actions={
          puedeEditar ? (
            <Button onClick={abrirCrear}>
              <Icon icon={Plus} />
              Nuevo cliente
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, empresa, correo…"
          className="w-full sm:max-w-sm"
        />
        <Select
          value={filtroEstado}
          onValueChange={(v: FiltroEstado) =>
            setActivo(v === "todos" ? undefined : v === "activos")
          }
        >
          <SelectTrigger className="w-full sm:w-40" aria-label="Filtrar por estado">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="activos">Activos</SelectItem>
            <SelectItem value="inactivos">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ClienteTable
        clientes={clientes}
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
        onVer={(cliente) => router.push(`/clientes/${cliente.id}`)}
        onEditar={puedeEditar ? abrirEditar : undefined}
        onEliminar={puedeEliminar ? (cliente) => setEliminando(cliente) : undefined}
        onCambiarEstado={puedeEditar ? cambiarEstado : undefined}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {total} cliente{total === 1 ? "" : "s"} en total
        </p>
        <Pagination page={page} totalPages={totalPages} onPageChange={irAPagina} />
      </div>

      {/* Modal crear/editar */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editando ? "Editar cliente" : "Nuevo cliente"}
        description={
          editando
            ? "Actualiza los datos de este cliente."
            : "Registra un cliente para asociarlo a sus ingresos."
        }
      >
        <ClienteForm
          cliente={editando ?? undefined}
          submitting={pending}
          onSubmit={enviar}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      {/* Confirmación de borrado */}
      <AlertDialog open={eliminando !== null} onOpenChange={(open) => !open && setEliminando(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon icon={UserX} className="text-destructive" />
              ¿Eliminar este cliente?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará a <strong>{eliminando?.nombre}</strong>. Esta acción no se puede
              deshacer. Los clientes con ingresos asociados no se pueden eliminar; deberás
              desactivarlos.
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
              {eliminando ? "Eliminar" : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}