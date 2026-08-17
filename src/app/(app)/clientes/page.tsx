import type { Metadata } from "next";
import { ClientesListTemplate } from "@/modules/clientes/components/templates/ClientesListTemplate";

export const metadata: Metadata = {
  title: "Clientes",
};

export default function ClientesPage() {
  return <ClientesListTemplate />;
}