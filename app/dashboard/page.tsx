"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import FooterBar from "@/components/FooterBar";



export default function DashboardPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    travelers: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null); // Nuevo estado para mostrar errores

  useEffect(() => {
    fetchTrips();
  }, []);

  async function fetchTrips() {
    setLoading(true);
    try {
      const res = await fetch("/api/trips");
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
      } else {
        console.error("Failed to fetch trips");
      }
    } catch (err) {
      console.error("Error fetching trips:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // ✅ Validación de fechas antes de enviar
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      setError("End date cannot be earlier than the start date.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          startDate: form.startDate,
          endDate: form.endDate,
          travelers: Number(form.travelers),
        }),
      });

      if (res.ok) {
        setForm({ name: "", startDate: "", endDate: "", travelers: "" });
        await fetchTrips();
      } else {
        const err = await res.json();
        setError("Error creating trip: " + (err?.error || res.statusText));
      }
    } catch (err) {
      console.error("Create trip error:", err);
      setError("Network error creating trip");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      const res = await fetch(`/api/trips/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTrips((prev) => prev.filter((t) => t.id !== id));
      } else {
        const err = await res.json();
        alert("Error deleting trip: " + (err?.error || res.statusText));
      }
    } catch (err) {
      console.error("Delete trip error:", err);
      alert("Network error deleting trip");
    }
  }

  return (
    <>
      <NavBar />
      <main className="p-8 space-y-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-4 text-[#001e42]">Your Dashboard</h1>
        </div>

        <p className="text-center text-gray-700 text-lg max-w-2xl mx-auto mt-4 mb-8 leading-relaxed">
          Every great adventure begins here.  
          Create a new trip or revisit your ongoing journeys.  
          Each destination is a story — and WanderWisely helps you plan it with both heart and wisdom.
        </p>

        {/* Lista de viajes */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-[#001e42]">Your Trips</h2>
          {loading ? (
            <p className="text-gray-500">Loading trips...</p>
          ) : trips.length === 0 ? (
            <p className="text-gray-500 italic">You have not created a trip yet!</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="relative bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition group"
                >
                  <Link href={`/dashboard/trip/${trip.id}/main`} className="block">
                    <h3 className="text-lg font-semibold text-[#001e42]">{trip.name}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(trip.startDate).toLocaleDateString()} →{" "}
                      {new Date(trip.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {trip.durationDays} Days | Travelers: {trip.travelers}
                    </p>
                  </Link>
                  <button
                    onClick={() => handleDelete(trip.id)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition opacity-80 group-hover:opacity-100"
                    title="Delete trip"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Crear un nuevo viaje */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-[#001e42]">Create a New Trip</h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Trip Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="border p-2 rounded-lg"
            />
            <div className="relative">
              <label className="absolute left-3 top-1 text-xs text-gray-500">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
                className="border p-2 rounded-lg pt-5 w-full"
              />
            </div>
            <div className="relative">
              <label className="absolute left-3 top-1 text-xs text-gray-500">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
                className="border p-2 rounded-lg pt-5 w-full"
              />
            </div>
            <input
              type="number"
              placeholder="Number of Travelers"
              value={form.travelers}
              onChange={(e) => setForm({ ...form, travelers: e.target.value })}
              required
              className="border p-2 rounded-lg"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#001e42] text-white py-2 rounded-lg hover:bg-[#DCC9A3] transition sm:col-span-2"
            >
              {submitting ? "Creating..." : "Create Trip"}
            </button>
          </form>

          {/* Mostrar error si existe */}
          {error && (
            <p className="text-red-600 text-sm mt-3 font-medium text-center sm:col-span-2">
              ⚠️ {error}
            </p>
          )}
        </section>
      </main>
    
    </>
  );
}
