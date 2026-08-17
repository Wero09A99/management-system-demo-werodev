import type { Metadata } from "next";
import { LoginTemplate } from "@/modules/auth/components/templates/LoginTemplate";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

/**
 * Página standalone de login. El proxy redirige aquí a usuarios sin sesión
 * y redirige al dashboard si ya hay sesión válida.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ motivo?: string; from?: string }>;
}) {
  const { motivo } = await searchParams;
  return <LoginTemplate motivoExpirado={motivo === "expirado"} />;
}