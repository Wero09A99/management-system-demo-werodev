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
  categoriaCreateSchema,
  type CategoriaCreateInput,
} from "@/modules/categorias/schemas/categoria.schema";

export type CategoriaFormProps = {
  submitting?: boolean;
  onSubmit: (values: CategoriaCreateInput) => void;
  onCancel?: () => void;
};

/**
 * Organismo CategoriaForm: formulario de creación de categorías.
 * Usa el mismo schema Zod que la API.
 */
export function CategoriaForm({ submitting = false, onSubmit, onCancel }: CategoriaFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CategoriaCreateInput>({
    resolver: zodResolver(categoriaCreateSchema),
    defaultValues: {
      nombre: "",
      tipo: "INGRESO",
      color: "",
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

      <div className="flex justify-end gap-2 pt-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? <Spinner size={14} /> : null}
          Crear categoría
        </Button>
      </div>
    </form>
  );
}