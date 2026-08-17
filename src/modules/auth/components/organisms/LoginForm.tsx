"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/design-system/atoms/button";
import { Input } from "@/design-system/atoms/input";
import { Spinner } from "@/design-system/atoms/spinner";
import { FormField } from "@/design-system/molecules/form-field";
import { useLogin } from "../../hooks/useLogin";
import { loginSchema, type LoginInput } from "../../schemas/login.schema";

/**
 * Organismo LoginForm: formulario de acceso con validación Zod.
 */
export function LoginForm() {
  const { iniciarSesion, loading, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { correo: "", password: "" },
  });

  return (
    <form onSubmit={handleSubmit(iniciarSesion)} className="space-y-4" noValidate>
      <FormField label="Correo" htmlFor="login-correo" required error={errors.correo?.message}>
        <Input
          id="login-correo"
          type="email"
          autoComplete="email"
          placeholder="correo@ejemplo.com"
          autoFocus
          {...register("correo")}
        />
      </FormField>

      <FormField
        label="Contraseña"
        htmlFor="login-password"
        required
        error={errors.password?.message}
      >
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="Tu contraseña"
          {...register("password")}
        />
      </FormField>

      {error ? (
        <p className="text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Spinner size={16} /> : null}
        {loading ? "Ingresando…" : "Iniciar sesión"}
      </Button>
    </form>
  );
}
