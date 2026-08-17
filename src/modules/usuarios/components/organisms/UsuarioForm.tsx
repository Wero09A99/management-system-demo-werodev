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
import { ROLES } from "@/modules/auth/types/auth.types";
import {
  usuarioCreateSchema,
  type UsuarioCreateInput,
} from "@/modules/usuarios/schemas/usuario.schema";

export type UsuarioFormProps = {
  submitting?: boolean;
  onSubmit: (values: UsuarioCreateInput) => void;
  onCancel?: () => void;
};

/**
 * Organismo UsuarioForm: formulario de creación de usuarios.
 * Usa el mismo schema Zod que la API.
 */
export function UsuarioForm({ submitting = false, onSubmit, onCancel }: UsuarioFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UsuarioCreateInput>({
    resolver: zodResolver(usuarioCreateSchema),
    defaultValues: {
      nombre: "",
      correo: "",
      password: "",
      rol: ROLES.OPERADOR,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Nombre" htmlFor="usuario-nombre" required error={errors.nombre?.message}>
        <Input
          id="usuario-nombre"
          placeholder="Nombre completo"
          autoFocus
          {...register("nombre")}
        />
      </FormField>

      <FormField label="Correo" htmlFor="usuario-correo" required error={errors.correo?.message}>
        <Input
          id="usuario-correo"
          type="email"
          autoComplete="email"
          placeholder="usuario@correo.com"
          {...register("correo")}
        />
      </FormField>

      <FormField
        label="Contraseña"
        htmlFor="usuario-password"
        required
        error={errors.password?.message}
        hint="Mínimo 8 caracteres."
      >
        <Input
          id="usuario-password"
          type="password"
          autoComplete="new-password"
          placeholder="Contraseña temporal"
          {...register("password")}
        />
      </FormField>

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

      <div className="flex justify-end gap-2 pt-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? <Spinner size={14} /> : null}
          Crear usuario
        </Button>
      </div>
    </form>
  );
}