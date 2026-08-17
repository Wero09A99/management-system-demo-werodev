"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/design-system/atoms/button";
import { Input } from "@/design-system/atoms/input";
import { Textarea } from "@/design-system/atoms/textarea";
import { Spinner } from "@/design-system/atoms/spinner";
import { FormField } from "@/design-system/molecules/form-field";
import {
  clienteBaseSchema,
  type ClienteFormValues,
} from "@/modules/clientes/schemas/cliente.schema";
import type { Cliente } from "@/modules/clientes/types/cliente.types";

export type ClienteFormProps = {
  /** Cliente existente (modo edición). */
  cliente?: Cliente;
  submitting?: boolean;
  onSubmit: (values: ClienteFormValues) => void;
  onCancel?: () => void;
};

/**
 * Organismo ClienteForm: formulario de creación/edición de clientes.
 * Usa el mismo schema Zod que la API.
 */
export function ClienteForm({ cliente, submitting = false, onSubmit, onCancel }: ClienteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteBaseSchema),
    defaultValues: {
      nombre: cliente?.nombre ?? "",
      telefono: cliente?.telefono ?? "",
      correo: cliente?.correo ?? "",
      empresa: cliente?.empresa ?? "",
      notas: cliente?.notas ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Nombre" htmlFor="cliente-nombre" required error={errors.nombre?.message}>
        <Input
          id="cliente-nombre"
          placeholder="Nombre del cliente"
          autoFocus
          {...register("nombre")}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Teléfono" htmlFor="cliente-telefono" error={errors.telefono?.message}>
          <Input
            id="cliente-telefono"
            type="tel"
            placeholder="+52 55 0000 0000"
            {...register("telefono")}
          />
        </FormField>
        <FormField label="Correo" htmlFor="cliente-correo" error={errors.correo?.message}>
          <Input
            id="cliente-correo"
            type="email"
            placeholder="cliente@correo.com"
            {...register("correo")}
          />
        </FormField>
      </div>

      <FormField label="Empresa" htmlFor="cliente-empresa" error={errors.empresa?.message}>
        <Input id="cliente-empresa" placeholder="Empresa (opcional)" {...register("empresa")} />
      </FormField>

      <FormField label="Notas" htmlFor="cliente-notas" error={errors.notas?.message}>
        <Textarea
          id="cliente-notas"
          placeholder="Notas internas sobre el cliente…"
          rows={3}
          {...register("notas")}
        />
      </FormField>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? <Spinner size={14} /> : null}
          {cliente ? "Guardar cambios" : "Crear cliente"}
        </Button>
      </div>
    </form>
  );
}