import type { Metadata } from "next";
import { ClienteDetailTemplate } from "@/modules/clientes/components/templates/ClienteDetailTemplate";

export const metadata: Metadata = {
  title: "Detalle de cliente",
};

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClienteDetailTemplate clienteId={id} />;
}