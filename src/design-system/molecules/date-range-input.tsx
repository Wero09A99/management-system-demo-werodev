import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type DateInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

/**
 * Molécula DateInput: input date accesible y consistente (con label).
 */
export function DateInput({ label, id, className, ...props }: DateInputProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <input
        id={id}
        type="date"
        aria-label={label}
        className="h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        {...props}
      />
    </div>
  );
}

export type DateRangeInputProps = {
  /** Label accesible para cada campo (default: "Desde" / "Hasta"). */
  desdeLabel?: string;
  hastaLabel?: string;
  desde?: string;
  hasta?: string;
  onDesdeChange: (valor: string | undefined) => void;
  onHastaChange: (valor: string | undefined) => void;
  className?: string;
};

/**
 * Molécula DateRangeInput: par de inputs date para filtrar por rango.
 * `undefined` representa "sin filtro" (valor vacío).
 */
export function DateRangeInput({
  desdeLabel = "Desde",
  hastaLabel = "Hasta",
  desde,
  hasta,
  onDesdeChange,
  onHastaChange,
  className,
}: DateRangeInputProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DateInput
        id="filtro-desde"
        label={desdeLabel}
        value={desde ?? ""}
        onChange={(e) => onDesdeChange(e.target.value || undefined)}
      />
      <DateInput
        id="filtro-hasta"
        label={hastaLabel}
        value={hasta ?? ""}
        onChange={(e) => onHastaChange(e.target.value || undefined)}
      />
    </div>
  );
}