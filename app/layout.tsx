import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import type { ReactNode } from "react";
import FooterBar from "@/components/FooterBar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "WanderWisely",
  description: "Plan your trips wisely 🌍",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body
        className={`${poppins.className} bg-[#F9F8F4] text-[#001e42] font-sans`}
      >
        {children}
        <FooterBar />
      </body>
    </html>
  );
}
