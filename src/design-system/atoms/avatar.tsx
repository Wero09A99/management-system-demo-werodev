import { Avatar as ShadAvatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type AvatarProps = {
  /** Iniciales a mostrar cuando no hay imagen. */
  name?: string;
  src?: string;
  className?: string;
};

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p.charAt(0)).join("").toUpperCase();
  return initials || "?";
}

/**
 * Átomo Avatar agnóstico de dominio: recibe un nombre y opcionalmente una imagen.
 * Muestra las iniciales del nombre como fallback.
 */
export function Avatar({ name, src, className }: AvatarProps) {
  return (
    <ShadAvatar className={cn("size-9", className)}>
      {src ? <AvatarImage src={src} alt={name ?? ""} /> : null}
      <AvatarFallback className="bg-muted text-xs font-medium text-foreground">
        {getInitials(name)}
      </AvatarFallback>
    </ShadAvatar>
  );
}