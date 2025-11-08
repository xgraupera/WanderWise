"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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


export default function TripMainPage() {
  const params = useParams(); // ✅ obtiene el tripId del path
  const router = useRouter();
  const tripIdParam = params?.tripId;
  const tripId = Array.isArray(tripIdParam) ? tripIdParam[0] : tripIdParam;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [spent, setSpent] = useState(0);
  const [budget, setBudget] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (tripId) fetchTrip();
  }, [tripId]);

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

    // ✅ recalcular duración si cambian fechas
    if (name === "startDate" || name === "endDate") {
      const start = new Date(updatedTrip.startDate);
      const end = new Date(updatedTrip.endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diff =
          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        updatedTrip.durationDays = diff > 0 ? diff : 0;
      }
    }

    setTrip(updatedTrip);
  }

  async function handleSave() {
    if (!trip) return;

    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    if (start > end) {
      alert("Start date cannot be later than end date.");
      return;
    }

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
    {/* ✅ Navbar fija arriba */}
    <NavBar tripId={tripId} />

    {/* ✅ Contenido principal */}
    <main className="p-8 space-y-10">
      {/* Intro del viaje */}
      <section>
        <h1 className="text-3xl font-bold mb-4 text-[#001e42]">{trip.name} — Main Overview</h1>
          
        <p className="text-gray-700 text-lg max-w-2xl mx-auto leading-relaxed">
          Welcome to your travel journal.  
          See your trip at a glance — key dates, destinations, and travelers, all beautifully organized in one place.
        </p>
      </section>

         

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: datos del viaje */}
        <section className="bg-white p-6 rounded-xl shadow-md lg:col-span-2 space-y-6">
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

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#001e42] text-white px-4 py-2 rounded-lg hover:bg-[#DCC9A3] transition disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="bg-[#001e42] text-white px-4 py-2 rounded-lg hover:bg-[#DCC9A3] transition"
            >
              ← Back to Dashboard
            </button>
          </div>
        </section>

        {/* Columna derecha: accesos rápidos */}
        <section className="bg-white p-6 rounded-xl shadow-md h-fit">
          <h3 className="text-xl font-semibold mb-4 text-[#001e42]">
            Quick Access
          </h3>
          <ul className="space-y-3 text-white">
            <li>
              <a
                href={`/dashboard/trip/${tripId}/budget`}
                className="block bg-[#001e42] p-3 rounded-lg hover:bg-[#DCC9A3] hover:text-white transition"
              >
                💰 Budget Planning
              </a>
            </li>
            <li>
              <a
                href={`/dashboard/trip/${tripId}/itinerary`}
className="block bg-[#001e42] p-3 rounded-lg hover:bg-[#DCC9A3] hover:text-white transition"              >
                🗓️ Trip Itinerary
              </a>
            </li>
            <li>
              <a
                href={`/dashboard/trip/${tripId}/reservations`}
className="block bg-[#001e42] p-3 rounded-lg hover:bg-[#DCC9A3] hover:text-white transition"              >
                ✈️ Reservations Tracker
              </a>
            </li>
            <li>
              <a
                href={`/dashboard/trip/${tripId}/checklist`}
className="block bg-[#001e42] p-3 rounded-lg hover:bg-[#DCC9A3] hover:text-white transition"              >
                🧾 Travel Checklist
              </a>
            </li>
            <li>
              <a
                href={`/dashboard/trip/${tripId}/expenses`}
className="block bg-[#001e42] p-3 rounded-lg hover:bg-[#DCC9A3] hover:text-white transition"              >
                💳 Expense Log
              </a>
            </li>
          </ul>
        </section>
      </div>
    </main>
  </>
);

}
