import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type IconProps = {
  /** Ícono de lucide-react (importado en el consumidor). */
  icon: LucideIcon;
  className?: string;
  size?: number;
  strokeWidth?: number;
};

/**
 * Átomo Icon: envoltura tipada para íconos lucide, con tamaño consistente.
 */
export function Icon({ icon: LucideIcon, className, size = 16, strokeWidth = 2 }: IconProps) {
  return (
    <LucideIcon
      className={cn("shrink-0", className)}
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  );
}