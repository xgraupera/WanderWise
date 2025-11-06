// app/dashboard/page.tsx
import NavBar from "@/components/NavBar";
import FooterBar from "@/components/FooterBar";

export default function DashboardPage() {
  return (
    <>
      <NavBar />
      <main className="flex flex-col min-h-screen items-center justify-center p-8">
        <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
        <p>Bienvenido a tu dashboard de Wanderwise.</p>
      </main>
      <FooterBar />
    </>
  );
}
