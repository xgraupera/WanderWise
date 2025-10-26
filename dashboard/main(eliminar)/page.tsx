import NavBar from "@/components/NavBar";

export default function MainOverviewPage() {
  return (
    <>
      <NavBar />
      <section className="p-8">
        <h1 className="text-2xl font-bold mb-4">Main Overview</h1>
        <p>Resumen general del viaje — presupuesto total, gasto, días, destino.</p>
      </section>
    </>
  );
}