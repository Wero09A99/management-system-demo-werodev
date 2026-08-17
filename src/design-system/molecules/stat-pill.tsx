import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatPillProps = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  className?: string;
};

/**
 * Molécula StatPill: métrica compacta (label + valor) para cabeceras y tablas.
 */
export function StatPill({ label, value, icon, className }: StatPillProps) {
  return (
    <Card className={cn("border-border/60", className)}>
      <CardContent className="flex items-center gap-3 px-4 py-3">
        {icon ? (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold text-foreground tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}