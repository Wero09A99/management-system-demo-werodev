import { Search } from "lucide-react";
import { Input, type InputProps } from "@/design-system/atoms/input";
import { cn } from "@/lib/utils";

export type SearchInputProps = Omit<InputProps, "type"> & {
  placeholder?: string;
  /** Label accesible (por defecto deriva del placeholder). :v */
  ariaLabel?: string;
};

/**
 * Molécula SearchInput: input con ícono de búsqueda.
 */
export function SearchInput({
  className,
  placeholder = "Buscar…",
  ariaLabel,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="pl-9"
        {...props}
      />
    </div>
  );
}