"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";

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
    setSubmitting(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ name: "", startDate: "", endDate: "", travelers: "" });
        await fetchTrips();
      } else {
        const err = await res.json();
        alert("Error creating trip: " + (err?.error || res.statusText));
      }
    } catch (err) {
      console.error("Create trip error:", err);
      alert("Network error creating trip");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      const res = await fetch(`/api/trips/${id}`, { method: "DELETE" });
      if (res.ok) {
        // actualizar UI localmente
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
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#0c454a]">Your Dashboard</h1>
        </div>

        {/* Lista de viajes */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-[#0c454a]">Your Trips</h2>

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
                    <h3 className="text-lg font-semibold text-[#0c454a]">{trip.name}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(trip.startDate).toLocaleDateString()} →{" "}
                      {new Date(trip.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {trip.durationDays} Days | Travelers:{" "}
                      {trip.travelers}
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

        {/* Formulario para crear un viaje */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-[#0c454a]">Create a New Trip</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Trip Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="border p-2 rounded-lg"
            />

            {/* Start Date con etiqueta visible */}
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

            {/* End Date con etiqueta visible */}
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
              className="bg-[#0c454a] text-white py-2 rounded-lg hover:bg-[#13636a] transition sm:col-span-2"
            >
              {submitting ? "Creating..." : "Create Trip"}
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
