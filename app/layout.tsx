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
  metadataBase: new URL("https://wanderwiselyapp.com"),

  title: "WanderWisely - Your Smart Travel Planner",
  description:
    "Organiza itinerarios, presupuestos, reservas, checklist y gastos en un solo lugar. Planifica tus viajes sin caos.",
  keywords: [
    "travel planner",
    "trip planner",
    "itinerary builder",
    "travel budget",
    "WanderWisely app"
  ],

  openGraph: {
    title: "WanderWisely - Travel Planner",
    description:
      "Planifica tus viajes con itinerarios, presupuestos y reservas centralizadas.",
    images: ["/dashboard.png"],
    type: "website",
    url: "https://wanderwiselyapp.com",
  },

  twitter: {
    card: "summary_large_image",
    title: "WanderWisely - Travel Planner",
    description:
      "Planifica tus viajes con itinerarios, presupuestos y reservas centralizadas.",
    images: ["/dashboard.png"],
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/icon_blue.png",
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
