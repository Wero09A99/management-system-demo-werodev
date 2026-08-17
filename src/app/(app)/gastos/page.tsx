import type { Metadata } from "next";
import { GastosListTemplate } from "@/modules/gastos/components/templates/GastosListTemplate";

export const metadata: Metadata = {
  title: "Gastos",
};

export default function GastosPage() {
  return <GastosListTemplate />;
}
