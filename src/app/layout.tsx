import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Montserrat } from "next/font/google";
import { Toaster } from "@/design-system/organisms/toaster";
import { StoreProvider } from "@/store/StoreProvider";
import { ThemeProvider } from "@/design-system/providers/ThemeProvider";
import { COOKIE_TEMA, leerTemaCookie } from "@/design-system/providers/tema";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "WeroDev | Gestión Financiera",
    template: "%s | WeroDev",
  },
  description: "Sistema de gestión financiera del negocio",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const temaInicial = leerTemaCookie(cookieStore.get(COOKIE_TEMA)?.value);

  return (
    <html
      lang="es"
      data-theme={temaInicial}
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider temaInicial={temaInicial}>
          <StoreProvider>{children}</StoreProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}