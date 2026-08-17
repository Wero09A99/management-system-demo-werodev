import type { Metadata } from "next";
import { ReportesTemplate } from "@/modules/reportes/components/templates/ReportesTemplate";

export const metadata: Metadata = {
  title: "Reportes",
};

export default function ReportesPage() {
  return <ReportesTemplate />;
}
