"use client";

import { Toaster as SonnerToaster } from "sonner";

/**
 * Organismo Toaster: contenedor global de notificaciones toast.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:border-border group-[.toaster]:bg-background",
          description: "group-[.toast]:text-muted-foreground",
        },
      }}
    />
  );
}