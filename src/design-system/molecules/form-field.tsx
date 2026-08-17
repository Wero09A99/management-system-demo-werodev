import type { ReactNode } from "react";
import { Label } from "@/design-system/atoms/label";
import { cn } from "@/lib/utils";

export type FormFieldProps = {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Molécula FormField: label + control + mensaje de error/hint.
 * Agnóstica de negocio; el control se pasa como `children`.
 */
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <Label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </Label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}