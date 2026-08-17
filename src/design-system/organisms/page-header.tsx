import type { ReactNode } from "react";

export type PageHeaderProps = {
  title: string;
  description?: string;
  /** Acciones a la derecha del título (botones, filtros…). */
  actions?: ReactNode;
};

/**
 * Organismo PageHeader: cabecera consistente de página (título + acciones).
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}