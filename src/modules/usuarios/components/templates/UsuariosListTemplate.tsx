"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/design-system/atoms/button";
import { Icon } from "@/design-system/atoms/icon";
import { PageHeader } from "@/design-system/organisms/page-header";
import { Modal } from "@/design-system/organisms/modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUsuarios } from "@/modules/usuarios/hooks/useUsuarios";
import { useUsuarioMutations } from "@/modules/usuarios/hooks/useUsuarioMutations";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { UsuarioForm } from "@/modules/usuarios/components/organisms/UsuarioForm";
import { UsuarioEditForm } from "@/modules/usuarios/components/organisms/UsuarioEditForm";
import { UsuarioTable } from "@/modules/usuarios/components/organisms/UsuarioTable";
import { CategoriasListTemplate } from "@/modules/categorias/components/templates/CategoriasListTemplate";
import type { UsuarioResumen } from "@/modules/usuarios/types/usuario.types";
import type { UsuarioCreateInput, UsuarioUpdateInput } from "@/modules/usuarios/schemas/usuario.schema";

/**
 * Template UsuariosListTemplate: página de gestión de usuarios (ver, crear y editar).
 * Solo accesible para ADMIN (protegida por RequireRole).
 */
export function UsuariosListTemplate() {
  const { usuarios, loading, error, recargar } = useUsuarios();
  const { crear, actualizar, pending } = useUsuarioMutations();
  const { usuario: usuarioActual } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<UsuarioResumen | null>(null);

  async function enviar(values: UsuarioCreateInput) {
    await crear(values);
    setModalOpen(false);
    recargar();
  }

  async function guardarCambios(values: UsuarioUpdateInput) {
    if (!editando) return;
    await actualizar(editando.id, values);
    setEditando(null);
    recargar();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Gestiona los accesos al sistema, sus roles y las categorías."
      />

      <Tabs defaultValue="usuarios">
        <TabsList>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="categorias">Categorías</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="space-y-6 pt-4">
          <div className="flex justify-end">
            <Button onClick={() => setModalOpen(true)}>
              <Icon icon={Plus} />
              Nuevo usuario
            </Button>
          </div>

          <UsuarioTable
            usuarios={usuarios}
            loading={loading}
            error={error}
            onRetry={recargar}
            onEditar={setEditando}
            usuarioActualId={usuarioActual?.id}
          />
        </TabsContent>

        <TabsContent value="categorias" className="pt-4">
          <CategoriasListTemplate />
        </TabsContent>
      </Tabs>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Nuevo usuario"
        description="Registra un usuario para que pueda acceder al sistema."
      >
        <UsuarioForm
          submitting={pending}
          onSubmit={enviar}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <Modal
        open={editando !== null}
        onOpenChange={(open) => !open && setEditando(null)}
        title={`Editar a ${editando?.nombre ?? ""}`}
        description="Actualiza el rol o el estado de la cuenta."
      >
        {editando ? (
          <UsuarioEditForm
            usuario={editando}
            submitting={pending}
            onSubmit={guardarCambios}
            onCancel={() => setEditando(null)}
          />
        ) : null}
      </Modal>
    </div>
  );
}