"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/design-system/atoms/button";
import { Input } from "@/design-system/atoms/input";
import { Spinner } from "@/design-system/atoms/spinner";
import { FormField } from "@/design-system/molecules/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/atoms/select";
import {
  categoriaUpdateSchema,
  type CategoriaUpdateInput,
} from "@/modules/categorias/schemas/categoria.schema";
import type { CategoriaResumen } from "@/modules/categorias/types/categoria.types";

export type CategoriaEditFormProps = {
  categoria: CategoriaResumen;
  submitting?: boolean;
  onSubmit: (values: CategoriaUpdateInput) => void;
  onCancel?: () => void;
};

/**
 * Organismo CategoriaEditForm: formulario de edición de categorías.
 * Usa el mismo schema Zod que la API.
 */
export function CategoriaEditForm({
  categoria,
  submitting = false,
  onSubmit,
  onCancel,
}: CategoriaEditFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CategoriaUpdateInput>({
    resolver: zodResolver(categoriaUpdateSchema),
    defaultValues: {
      nombre: categoria.nombre,
      tipo: categoria.tipo,
      color: categoria.color ?? "",
      activa: categoria.activa,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Nombre" htmlFor="categoria-nombre" required error={errors.nombre?.message}>
        <Input
          id="categoria-nombre"
          placeholder="Ej. Ventas de servicios"
          autoFocus
          {...register("nombre")}
        />
      </FormField>

      <FormField label="Tipo" htmlFor="categoria-tipo" required error={errors.tipo?.message}>
        <Controller
          control={control}
          name="tipo"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="categoria-tipo" className="w-full">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INGRESO">Ingreso</SelectItem>
                <SelectItem value="GASTO">Gasto</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <FormField
        label="Color"
        htmlFor="categoria-color"
        error={errors.color?.message}
        hint="Opcional. Código hex como #22c55e para distinguirla en reportes."
      >
        <Input
          id="categoria-color"
          placeholder="#22c55e"
          {...register("color")}
        />
      </FormField>

      <FormField label="Estado" htmlFor="categoria-activa" error={errors.activa?.message}>
        <Controller
          control={control}
          name="activa"
          render={({ field }) => (
            <Select
              value={String(field.value)}
              onValueChange={(v) => field.onChange(v === "true")}
            >
              <SelectTrigger id="categoria-activa" className="w-full">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Activa</SelectItem>
                <SelectItem value="false">Inactiva</SelectItem>
              </SelectContent>
            </Select>
          )}
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
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}