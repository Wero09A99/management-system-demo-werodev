import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/modules/auth/components/organisms/LoginForm";
import { Badge } from "@/design-system/atoms/badge";
import { Clock } from "lucide-react";
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
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}