"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";

interface Props {
  params: { tripId: string };
}

interface Trip {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  travelers: number;
}

export default function TripMainPage({ params }: Props) {
  const { tripId } = params;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [spent, setSpent] = useState(0);
  const [budget, setBudget] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTrip();
  }, []);

  async function fetchTrip() {
    const res = await fetch(`/api/trips/${tripId}`);
    if (res.ok) {
      const data = await res.json();
      setTrip({
        id: data.id,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        durationDays: data.durationDays || 0,
        travelers: data.travelers || 1,
      });
      setBudget(data.totalBudget || 0);
      setSpent(data.spentSoFar || 0);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!trip) return;
    const { name, value } = e.target;
    let updatedTrip = { ...trip, [name]: value };

    // Si cambian fechas, recalculamos duración
    if (name === "startDate" || name === "endDate") {
      const start = new Date(updatedTrip.startDate);
      const end = new Date(updatedTrip.endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        updatedTrip.durationDays = diff > 0 ? diff : 0;
      }
    }
    setTrip(updatedTrip);
  }

  async function handleSave() {
    if (!trip) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trip),
      });
      if (res.ok) {
        alert("Trip details updated successfully!");
      } else {
        alert("Error saving trip data.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save trip changes.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!trip) {
    return (
      <>
        <NavBar tripId={tripId} />
        <main className="p-8 text-center">
          <p className="text-lg text-gray-600">Loading trip information...</p>
        </main>
      </>
    );
  }

  const percentage = budget ? ((spent / budget) * 100).toFixed(1) : "0";
  const remaining = (budget - spent).toFixed(2);

  return (
    <>
      <NavBar tripId={tripId} />
      <main className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: datos del viaje */}
        <section className="bg-white p-6 rounded-xl shadow-md lg:col-span-2 space-y-6">
          <h1 className="text-3xl font-bold text-[#0c454a]">
            {trip.name} — Main Overview
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Trip Name</label>
              <input
                name="name"
                className="w-full border rounded-lg p-2"
                value={trip.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Start Date</label>
              <input
                name="startDate"
                type="date"
                className="w-full border rounded-lg p-2"
                value={trip.startDate?.split("T")[0] || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">End Date</label>
              <input
                name="endDate"
                type="date"
                className="w-full border rounded-lg p-2"
                value={trip.endDate?.split("T")[0] || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Total Duration (days)</label>
              <input
                name="durationDays"
                type="number"
                className="w-full border rounded-lg p-2 bg-gray-100"
                value={trip.durationDays}
                onChange={handleChange}
                readOnly
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Number of Travelers</label>
              <input
                name="travelers"
                type="number"
                min={1}
                className="w-full border rounded-lg p-2"
                value={trip.travelers}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Total Budget (€)</label>
              <input
                className="w-full border rounded-lg p-2 bg-gray-100"
                value={budget.toFixed(2)}
                readOnly
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Spent So Far (€)</label>
              <input
                className="w-full border rounded-lg p-2 bg-gray-100"
                value={spent.toFixed(2)}
                readOnly
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Percentage Spent (%)</label>
              <input
                className="w-full border rounded-lg p-2 bg-gray-100"
                value={percentage}
                readOnly
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Remaining Budget (€)</label>
              <input
                className="w-full border rounded-lg p-2 bg-gray-100"
                value={remaining}
                readOnly
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="mt-4 bg-[#0c454a] text-white px-4 py-2 rounded-lg hover:bg-[#09616d] transition disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </section>

        {/* Columna derecha: accesos rápidos */}
        <section className="bg-white p-6 rounded-xl shadow-md h-fit">
          <h2 className="text-xl font-semibold mb-4 text-[#0c454a]">
            Quick Access
          </h2>
          <ul className="space-y-3 text-[#0c454a]">
            <li>
              <a
                href={`/dashboard/trip/${tripId}/budget`}
                className="block border p-3 rounded-lg hover:bg-[#0c454a] hover:text-white transition"
              >
                💰 Budget Planning
              </a>
            </li>
            <li>
              <a
                href={`/dashboard/trip/${tripId}/itinerary`}
                className="block border p-3 rounded-lg hover:bg-[#0c454a] hover:text-white transition"
              >
                🗓️ Trip Itinerary
              </a>
            </li>
            <li>
              <a
                href={`/dashboard/trip/${tripId}/reservations`}
                className="block border p-3 rounded-lg hover:bg-[#0c454a] hover:text-white transition"
              >
                ✈️ Reservations Tracker
              </a>
            </li>
            <li>
              <a
                href={`/dashboard/trip/${tripId}/checklist`}
                className="block border p-3 rounded-lg hover:bg-[#0c454a] hover:text-white transition"
              >
                🧾 Travel Checklist
              </a>
            </li>
            <li>
              <a
                href={`/dashboard/trip/${tripId}/expenses`}
                className="block border p-3 rounded-lg hover:bg-[#0c454a] hover:text-white transition"
              >
                💳 Expense Tracker
              </a>
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}
