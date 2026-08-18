import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/modules/auth/components/organisms/LoginForm";
import { Badge } from "@/design-system/atoms/badge";
import { Clock, Sparkles } from "lucide-react";
import { Icon } from "@/design-system/atoms/icon";

export type LoginTemplateProps = {
  /** true cuando el access token expiró y el proxy redirigió al login. */
  motivoExpirado?: boolean;
};

/**
 * Template LoginTemplate: página standalone full-screen con la card centrada.
 * Los colores los maneja el design system; aquí solo se define el layout.
 */
export function LoginTemplate({ motivoExpirado = false }: LoginTemplateProps) {
  const modoDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>Accede a tu panel de gestión.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {motivoExpirado ? (
            <Badge variant="outline" className="gap-1.5 py-1">
              <Icon icon={Clock} size={14} />
              Tu sesión expiró. Ingresa de nuevo.
            </Badge>
          ) : null}

          {modoDemo ? (
            <div className="rounded-lg border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Icon icon={Sparkles} size={14} />
                Credenciales de demostración
              </span>
              <span className="mt-1 block font-mono">
                Correo: test@example.com · Contraseña: 12345678
              </span>
            </div>
          ) : null}

          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}