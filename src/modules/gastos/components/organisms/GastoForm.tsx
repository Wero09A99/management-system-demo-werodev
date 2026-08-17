"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toDateInputValue } from "@/lib/dates";
import { Button } from "@/design-system/atoms/button";
import { Input } from "@/design-system/atoms/input";
import { Textarea } from "@/design-system/atoms/textarea";
import { Spinner } from "@/design-system/atoms/spinner";
import { FormField } from "@/design-system/molecules/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/atoms/select";
import { Skeleton } from "@/components/ui/skeleton";
import { METODO_PAGO_OPTIONS } from "@/design-system/molecules/metodo-pago-badge";
import { useCategorias } from "@/lib/hooks/useCategorias";
import type { Categoria } from "@/lib/services/categorias";
import {
  gastoBaseSchema,
  type GastoFormInput,
  type GastoFormValues,
} from "@/modules/gastos/schemas/gasto.schema";
import type { Gasto } from "@/modules/gastos/types/gasto.types";

export type GastoFormProps = {
  /** Gasto existente (modo edición). */
  gasto?: Gasto;
  submitting?: boolean;
  onSubmit: (values: GastoFormValues) => void;
  onCancel?: () => void;
  /** Categorías de tipo gasto (evita un fetch duplicado si vienen del template). */
  categorias?: Categoria[];
  loadingCategorias?: boolean;
  errorCategorias?: string | null;
};

/**
 * Organismo GastoForm: formulario de creación/edición de gastos.
 * Usa el mismo schema Zod que la API.
 */
export function GastoForm({
  gasto,
  submitting = false,
  onSubmit,
  onCancel,
  categorias: categoriasProp,
  loadingCategorias: loadingCategoriasProp,
  errorCategorias: errorCategoriasProp,
}: GastoFormProps) {
  const categoriasHook = useCategorias("GASTO");
  const categorias = categoriasProp ?? categoriasHook.categorias;
  const loadingCategorias = loadingCategoriasProp ?? categoriasHook.loading;
  const errorCategorias = errorCategoriasProp ?? categoriasHook.error;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<GastoFormInput, unknown, GastoFormValues>({
    resolver: zodResolver(gastoBaseSchema),
    defaultValues: {
      concepto: gasto?.concepto ?? "",
      categoriaId: gasto?.categoriaId ?? "",
      monto: gasto ? Number(gasto.monto) : undefined,
      metodoPago: gasto?.metodoPago ?? "EFECTIVO",
      fecha: toDateInputValue(gasto?.fecha),
      notas: gasto?.notas ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Concepto" htmlFor="gasto-concepto" required error={errors.concepto?.message}>
        <Input
          id="gasto-concepto"
          placeholder="¿En qué se gastó? (ej. Filamento PLA)"
          autoFocus
          {...register("concepto")}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Categoría"
          htmlFor="gasto-categoria"
          required
          error={errors.categoriaId?.message ?? errorCategorias ?? undefined}
        >
          {loadingCategorias ? (
            <Skeleton className="h-8 w-full" />
          ) : (
            <Controller
              control={control}
              name="categoriaId"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger id="gasto-categoria">
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
        </FormField>

        <FormField label="Método de pago" htmlFor="gasto-metodo" required error={errors.metodoPago?.message}>
          <Controller
            control={control}
            name="metodoPago"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="gasto-metodo">
                  <SelectValue placeholder="Método" />
                </SelectTrigger>
                <SelectContent>
                  {METODO_PAGO_OPTIONS.map((metodo) => (
                    <SelectItem key={metodo.value} value={metodo.value}>
                      {metodo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Monto" htmlFor="gasto-monto" required error={errors.monto?.message}>
          <Input
            id="gasto-monto"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            placeholder="0.00"
            {...register("monto")}
          />
        </FormField>

        <FormField label="Fecha" htmlFor="gasto-fecha" required error={errors.fecha?.message}>
          <Input id="gasto-fecha" type="date" {...register("fecha")} />
        </FormField>
      </div>

      <FormField label="Notas" htmlFor="gasto-notas" error={errors.notas?.message}>
        <Textarea
          id="gasto-notas"
          placeholder="Notas sobre este gasto…"
          rows={2}
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
          {gasto ? "Guardar cambios" : "Registrar gasto"}
        </Button>
      </div>
    </form>
  );
}