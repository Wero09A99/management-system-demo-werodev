import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SpinnerProps = {
  className?: string;
  size?: number;
};

/** Átomo Spinner: indicador de carga consistente. */
export function Spinner({ className, size = 16 }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin", className)}
      size={size}
      aria-label="Cargando"
      role="status"
    />
  );
}