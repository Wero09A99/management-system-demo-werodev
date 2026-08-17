import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Icon } from "@/design-system/atoms/icon";

export type StatCardProps = {
  label: string;
  value: string;
  icon?: LucideIcon;
  /** Tono del ícono/valor (default: neutral). */
  tone?: "neutral" | "positive" | "negative" | "accent";
  hint?: string;
  className?: string;
};

const TONES = {
  neutral: { icon: "text-muted-foreground", value: "text-foreground" },
  positive: { icon: "text-emerald-600", value: "text-emerald-600" },
  negative: { icon: "text-red-600", value: "text-red-600" },
  accent: { icon: "text-primary", value: "text-foreground" },
} as const;

/**
 * Molécula StatCard: tarjeta de métrica para dashboards.
 * Estética neutra con acento único; los tonos se reservan para señales.
 */
export function StatCard({
  label,
  value,
  icon,
  tone = "neutral",
  hint,
  className,
}: StatCardProps) {
  const tones = TONES[tone];
  return (
    <Card className={cn("border-border/60", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          {icon ? (
            <Icon icon={icon} className={cn("size-4", tones.icon)} />
          ) : null}
        </div>
        <p className={cn("mt-1.5 truncate text-2xl font-semibold tabular-nums", tones.value)}>
          {value}
        </p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}