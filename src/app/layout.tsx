import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GabrielOS",
  description: "Sistema personal de organización, planificación y seguimiento.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
