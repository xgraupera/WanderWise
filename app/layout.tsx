import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import type { ReactNode } from "react"; // ✅ importa el tipo
import { Inter } from "next/font/google";
import NavBar from "@/components/NavBar";
import FooterBar from "@/components/FooterBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Wanderwise",
  description: "Planifica tus viajes con inteligencia 🌍"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-[#EAEAEA] text-[#2E3A3A] font-sans`}>
        <NavBar />
        {children}
        <FooterBar />
      </body>
    </html>
  );
}