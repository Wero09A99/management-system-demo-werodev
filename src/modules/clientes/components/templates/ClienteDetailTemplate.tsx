"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserX } from "lucide-react";
import { Button } from "@/design-system/atoms/button";
import { Icon } from "@/design-system/atoms/icon";
import { Modal } from "@/design-system/organisms/modal";
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
import { useCliente } from "@/modules/clientes/hooks/useCliente";
import { useClienteMutations } from "@/modules/clientes/hooks/useClienteMutations";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
  puedeEditarRegistros,
  puedeEliminarCliente,
} from "@/modules/auth/utils/permisos";
import { ClienteForm } from "@/modules/clientes/components/organisms/ClienteForm";
import { ClienteDetailPanel } from "@/modules/clientes/components/organisms/ClienteDetailPanel";
import type { ClienteFormValues } from "@/modules/clientes/schemas/cliente.schema";

export type ClienteDetailTemplateProps = {
  clienteId: string;
};

/**
 * Template ClienteDetailTemplate: detalle de un cliente.
 */
export function ClienteDetailTemplate({ clienteId }: ClienteDetailTemplateProps) {
  const router = useRouter();
  const { rol } = useAuth();
  const { cliente, loading, error, recargar } = useCliente(clienteId);
  const { actualizar, eliminar, pending } = useClienteMutations();

  const [modalOpen, setModalOpen] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const puedeEditar = puedeEditarRegistros(rol);
  const puedeEliminar = puedeEliminarCliente(rol);

  async function enviar(values: ClienteFormValues) {
    await actualizar(clienteId, values);
    setModalOpen(false);
    recargar();
  }

  async function cambiarEstado() {
    if (!cliente) return;
    await actualizar(clienteId, { activo: !cliente.activo });
    recargar();
  }

  async function confirmarEliminar() {
    await eliminar(clienteId);
    setEliminando(false);
    router.push("/clientes");
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link
          href="/clientes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon icon={ArrowLeft} />
          Volver a clientes
        </Link>
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm font-medium text-foreground">No se pudo cargar el cliente.</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={recargar}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/clientes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <Icon icon={ArrowLeft} />
        Volver a clientes
      </Link>

      <ClienteDetailPanel
        cliente={cliente}
        loading={loading}
        onEditar={puedeEditar ? () => setModalOpen(true) : undefined}
        onCambiarEstado={puedeEditar ? cambiarEstado : undefined}
        onEliminar={puedeEliminar ? () => setEliminando(true) : undefined}
      />

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Editar cliente"
        description="Actualiza los datos de este cliente."
      >
        <ClienteForm
          cliente={cliente ?? undefined}
          submitting={pending}
          onSubmit={enviar}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <AlertDialog open={eliminando} onOpenChange={setEliminando}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon icon={UserX} className="text-destructive" />
              ¿Eliminar este cliente?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará a <strong>{cliente?.nombre}</strong>. Esta acción no se puede deshacer.
              Los clientes con ingresos asociados no se pueden eliminar; deberás desactivarlos.
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