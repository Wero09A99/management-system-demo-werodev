"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/design-system/atoms/button";
import { Icon } from "@/design-system/atoms/icon";
import { Modal } from "@/design-system/organisms/modal";
import { useCategoriasGestion } from "@/modules/categorias/hooks/useCategoriasGestion";
import { useCategoriaMutations } from "@/modules/categorias/hooks/useCategoriaMutations";
import { CategoriaForm } from "@/modules/categorias/components/organisms/CategoriaForm";
import { CategoriaEditForm } from "@/modules/categorias/components/organisms/CategoriaEditForm";
import { CategoriaTable } from "@/modules/categorias/components/organisms/CategoriaTable";
import type { CategoriaResumen } from "@/modules/categorias/types/categoria.types";
import type { CategoriaCreateInput, CategoriaUpdateInput } from "@/modules/categorias/schemas/categoria.schema";

/**
 * Template CategoriasListTemplate: gestión de categorías (ver, crear y editar).
 * Se monta como pestaña dentro de la página de Usuarios (solo ADMIN).
 */
export function CategoriasListTemplate() {
  const { categorias, loading, error, recargar } = useCategoriasGestion();
  const { crear, actualizar, pending } = useCategoriaMutations();

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<CategoriaResumen | null>(null);

  async function enviar(values: CategoriaCreateInput) {
    await crear(values);
    setModalOpen(false);
    recargar();
  }

  async function guardarCambios(values: CategoriaUpdateInput) {
    if (!editando) return;
    await actualizar(editando.id, values);
    setEditando(null);
    recargar();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setModalOpen(true)}>
          <Icon icon={Plus} />
          Nueva categoría
        </Button>
      </div>

      <CategoriaTable
        categorias={categorias}
        loading={loading}
        error={error}
        onRetry={recargar}
        onEditar={setEditando}
      />

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Nueva categoría"
        description="Registra una categoría para clasificar movimientos."
      >
        <CategoriaForm
          submitting={pending}
          onSubmit={enviar}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <Modal
        open={editando !== null}
        onOpenChange={(open) => !open && setEditando(null)}
        title={`Editar ${editando?.nombre ?? ""}`}
        description="Actualiza el nombre, tipo, color o estado de la categoría."
      >
        {editando ? (
          <CategoriaEditForm
            categoria={editando}
            submitting={pending}
            onSubmit={guardarCambios}
            onCancel={() => setEditando(null)}
          />
        ) : null}
      </Modal>
    </div>
  );
}