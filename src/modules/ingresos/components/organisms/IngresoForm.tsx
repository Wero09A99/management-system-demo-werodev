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
import { useClientesActivos } from "@/lib/hooks/useClientesActivos";
import { METODO_PAGO_OPTIONS } from "@/design-system/molecules/metodo-pago-badge";
import { ESTADO_INGRESO_OPTIONS } from "@/design-system/molecules/estado-ingreso-badge";
import { useCategorias } from "@/lib/hooks/useCategorias";
import type { Categoria } from "@/lib/services/categorias";
import {
  ingresoBaseSchema,
  type IngresoFormInput,
  type IngresoFormValues,
} from "@/modules/ingresos/schemas/ingreso.schema";
import type { Ingreso } from "@/modules/ingresos/types/ingreso.types";

export type IngresoFormProps = {
  /** Ingreso existente (modo edición). */
  ingreso?: Ingreso;
  submitting?: boolean;
  onSubmit: (values: IngresoFormValues) => void;
  onCancel?: () => void;
  /** Categorías de tipo ingreso (evita un fetch duplicado si vienen del template). */
  categorias?: Categoria[];
  loadingCategorias?: boolean;
  errorCategorias?: string | null;
};

/**
 * Organismo IngresoForm: formulario de creación/edición de ingresos.
 * Usa el mismo schema Zod que la API.
 */
export function IngresoForm({
  ingreso,
  submitting = false,
  onSubmit,
  onCancel,
  categorias: categoriasProp,
  loadingCategorias: loadingCategoriasProp,
  errorCategorias: errorCategoriasProp,
}: IngresoFormProps) {
  const categoriasHook = useCategorias("INGRESO");
  const categorias = categoriasProp ?? categoriasHook.categorias;
  const loadingCategorias = loadingCategoriasProp ?? categoriasHook.loading;
  const errorCategorias = errorCategoriasProp ?? categoriasHook.error;
  const { clientes, loading: loadingClientes, error: errorClientes } = useClientesActivos();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IngresoFormInput, unknown, IngresoFormValues>({
    resolver: zodResolver(ingresoBaseSchema),
    defaultValues: {
      concepto: ingreso?.concepto ?? "",
      clienteId: ingreso?.clienteId ?? "",
      categoriaId: ingreso?.categoriaId ?? "",
      monto: ingreso ? Number(ingreso.monto) : undefined,
      metodoPago: ingreso?.metodoPago ?? "EFECTIVO",
      estado: ingreso?.estado ?? "LIQUIDADO",
      fecha: toDateInputValue(ingreso?.fecha),
      notas: ingreso?.notas ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Concepto" htmlFor="ingreso-concepto" required error={errors.concepto?.message}>
        <Input
          id="ingreso-concepto"
          placeholder="¿Qué se cobró? (ej. Impresión 3D)"
          autoFocus
          {...register("concepto")}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Cliente" htmlFor="ingreso-cliente" error={errors.clienteId?.message}>
          {loadingClientes ? (
            <Skeleton className="h-8 w-full" />
          ) : (
            <Controller
              control={control}
              name="clienteId"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger id="ingreso-cliente">
                    <SelectValue placeholder="Sin cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin cliente</SelectItem>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                        {cliente.empresa ? ` — ${cliente.empresa}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
        </FormField>

        <FormField
          label="Categoría"
          htmlFor="ingreso-categoria"
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
                  <SelectTrigger id="ingreso-categoria">
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
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Monto" htmlFor="ingreso-monto" required error={errors.monto?.message}>
          <Input
            id="ingreso-monto"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            placeholder="0.00"
            {...register("monto")}
          />
        </FormField>

        <FormField label="Método de pago" htmlFor="ingreso-metodo" required error={errors.metodoPago?.message}>
          <Controller
            control={control}
            name="metodoPago"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="ingreso-metodo">
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

        <FormField label="Estado" htmlFor="ingreso-estado" required error={errors.estado?.message}>
          <Controller
            control={control}
            name="estado"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="ingreso-estado">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADO_INGRESO_OPTIONS.map((estado) => (
                    <SelectItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>

      <FormField label="Fecha" htmlFor="ingreso-fecha" required error={errors.fecha?.message}>
        <Input id="ingreso-fecha" type="date" {...register("fecha")} />
      </FormField>

      <FormField label="Notas" htmlFor="ingreso-notas" error={errors.notas?.message}>
        <Textarea
          id="ingreso-notas"
          placeholder="Notas sobre este ingreso…"
          rows={2}
          {...register("notas")}
        />
      </FormField>

      {errorClientes ? (
        <p className="text-xs font-medium text-destructive">{errorClientes}</p>
      ) : null}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? <Spinner size={14} /> : null}
          {ingreso ? "Guardar cambios" : "Registrar ingreso"}
        </Button>
      </div>
    </form>
  );
}