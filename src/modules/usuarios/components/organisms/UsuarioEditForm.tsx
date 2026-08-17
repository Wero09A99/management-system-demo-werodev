"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/design-system/atoms/button";
import { Spinner } from "@/design-system/atoms/spinner";
import { FormField } from "@/design-system/molecules/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/atoms/select";
import { ROLES } from "@/modules/auth/types/auth.types";
import {
  usuarioUpdateSchema,
  type UsuarioUpdateInput,
} from "@/modules/usuarios/schemas/usuario.schema";
import type { UsuarioResumen } from "@/modules/usuarios/types/usuario.types";

export type UsuarioEditFormProps = {
  usuario: UsuarioResumen;
  submitting?: boolean;
  onSubmit: (values: UsuarioUpdateInput) => void;
  onCancel?: () => void;
};

/**
 * Organismo UsuarioEditForm: formulario de edición de rol y estado activo.
 * Usa el mismo schema Zod que la API.
 */
export function UsuarioEditForm({
  usuario,
  submitting = false,
  onSubmit,
  onCancel,
}: UsuarioEditFormProps) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UsuarioUpdateInput>({
    resolver: zodResolver(usuarioUpdateSchema),
    defaultValues: {
      rol: usuario.rol as UsuarioUpdateInput["rol"],
      activo: usuario.activo,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Rol" htmlFor="usuario-rol" required error={errors.rol?.message}>
        <Controller
          control={control}
          name="rol"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="usuario-rol" className="w-full">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ROLES.ADMIN}>Administrador</SelectItem>
                <SelectItem value={ROLES.OPERADOR}>Operador</SelectItem>
                <SelectItem value={ROLES.CONSULTA}>Consulta</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <FormField label="Estado de la cuenta" htmlFor="usuario-activo" error={errors.activo?.message}>
        <Controller
          control={control}
          name="activo"
          render={({ field }) => (
            <div className="flex items-center gap-4">
              <Select value={String(field.value)} onValueChange={(v) => field.onChange(v === "true")}>
                <SelectTrigger id="usuario-activo" className="w-full">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
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