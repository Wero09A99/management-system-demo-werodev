import type { Metadata } from "next";
import { DashboardTemplate } from "@/modules/dashboard/components/templates/DashboardTemplate";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return <DashboardTemplate />;
}
