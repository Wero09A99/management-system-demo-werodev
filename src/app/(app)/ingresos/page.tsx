import type { Metadata } from "next";
import { IngresosListTemplate } from "@/modules/ingresos/components/templates/IngresosListTemplate";

export const metadata: Metadata = {
  title: "Ingresos",
};

export default function IngresosPage() {
  return <IngresosListTemplate />;
}