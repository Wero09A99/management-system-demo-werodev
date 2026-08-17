import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Acción sugerida (botón). */
  action?: React.ReactNode;
  className?: string;
};

/**
 * Organismo EmptyState: estado vacío con copy claro en voz activa.
 */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="mb-1 flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-6" aria-hidden="true" />
        </div>
      ) : null}
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}