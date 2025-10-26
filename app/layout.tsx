import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Wanderwise",
  description: "Planifica tus viajes con inteligencia 🌍",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-[#EAEAEA] text-[#2E3A3A] font-sans">
        {children}
      </body>
    </html>
  );
}