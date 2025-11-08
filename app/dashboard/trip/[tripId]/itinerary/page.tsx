"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NavBar from "@/components/NavBar";

interface ItineraryItem {
  id?: number;
  day: number;
  date: string;
  city: string;
  activity: string;
  notes: string;
}


interface Props {
  params: { tripId: string };
}

export default function ItineraryPage() {
  const params = useParams(); 
  const tripIdParam = params?.tripId;
  const tripId = Array.isArray(tripIdParam) ? tripIdParam[0] : tripIdParam;
  const [days, setDays] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔹 Cargar datos del itinerario
  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const res = await fetch(`/api/itinerary?tripId=${tripId}`);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((d: any) => ({
            ...d,
            date: d.date ? new Date(d.date).toISOString().split("T")[0] : "",
          }));
          setDays(formatted);
        } else {
          setDays([{ day: 1, date: "", city: "", activity: "", notes: "" }]);
        }
      } catch (err) {
        console.error("Error loading itinerary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItinerary();
  }, [tripId]);

  // ➕ Añadir un nuevo día
  const addDay = () => {
    const last = days[days.length - 1];
    let nextDate = "";

    if (last?.date) {
      const d = new Date(last.date);
      d.setDate(d.getDate() + 1);
      nextDate = d.toISOString().split("T")[0];
    }

    setDays([
      ...days,
      { day: days.length + 1, date: nextDate, city: "", activity: "", notes: "" },
    ]);
  };

  // 🗑️ Eliminar día
  const deleteDay = (index: number) => {
    const updated = days
      .filter((_, i) => i !== index)
      .map((d, i) => ({ ...d, day: i + 1 }));
    setDays(updated);
  };

  // ⬆️⬇️ Mover día arriba o abajo
  const moveDay = (index: number, direction: "up" | "down") => {
    const newDays = [...days];
    if (direction === "up" && index > 0) {
      [newDays[index - 1], newDays[index]] = [newDays[index], newDays[index - 1]];
    }
    if (direction === "down" && index < newDays.length - 1) {
      [newDays[index + 1], newDays[index]] = [newDays[index], newDays[index + 1]];
    }

    // Reindexar
    const reindexed = newDays.map((d, i) => ({ ...d, day: i + 1 }));
    setDays(reindexed);
  };

  // 💾 Guardar itinerario (sin error si fechas vacías)
  const saveItinerary = async () => {
    setSaving(true);
    try {
      const cleaned = days.map((d) => ({
        ...d,
        date: d.date || null,
        city: d.city?.trim() || "",
        activity: d.activity?.trim() || "",
        notes: d.notes?.trim() || "",
      }));

      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, itinerary: cleaned }),
      });

      if (res.ok) alert("✅ Itinerary saved!");
      else alert("❌ Error saving itinerary. Date missing.");
    } catch (err) {
      console.error(err);
      alert("❌ Server error");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <>
        <NavBar tripId={tripId} />
        <main className="p-8 text-center">
          <p className="text-lg text-gray-600">Loading trip information...</p>
        </main>
      </>
    );

  return (
    <>
      <NavBar tripId={tripId} />
      <main className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-4">🗓️ Trip Itinerary</h1>
        </div>
        <p className="text-center text-gray-700 text-lg max-w-2xl mx-auto mt-4 mb-8 leading-relaxed">
  Make every day count.  
  Plan your activities, destinations, and personal notes so your trip flows effortlessly and stress-free.
</p>

        <section className="bg-white p-6 rounded-lg shadow-md">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-[#001e42] text-white">
              <tr>
                <th className="p-2">Day</th>
                <th className="p-2">Date</th>
                <th className="p-2">City</th>
                <th className="p-2 w-1/4">Activity</th>
                <th className="p-2 w-1/4">Notes</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {days.map((d, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2 text-center">{d.day}</td>
                  <td className="p-2 text-center">
                    <input
                      type="date"
                      value={d.date}
                      onChange={(e) =>
                        setDays((prev) =>
                          prev.map((x, j) =>
                            j === i ? { ...x, date: e.target.value } : x
                          )
                        )
                      }
                      className="border p-1 rounded w-full"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      value={d.city}
                      onChange={(e) =>
                        setDays((prev) =>
                          prev.map((x, j) =>
                            j === i ? { ...x, city: e.target.value } : x
                          )
                        )
                      }
                      className="border p-1 rounded w-full"
                    />
                  </td>

                  <td className="p-2">
                    <textarea
                      rows={2}
                      value={d.activity}
                      onChange={(e) =>
                        setDays((prev) =>
                          prev.map((x, j) =>
                            j === i ? { ...x, activity: e.target.value } : x
                          )
                        )
                      }
                      className="border p-1 rounded w-full resize-y"
                    />
                  </td>

                  <td className="p-2">
                    <textarea
                      rows={2}
                      value={d.notes}
                      onChange={(e) =>
                        setDays((prev) =>
                          prev.map((x, j) =>
                            j === i ? { ...x, notes: e.target.value } : x
                          )
                        )
                      }
                      className="border p-1 rounded w-full resize-y"
                    />
                  </td>

                  <td className="p-2">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => moveDay(i, "up")}
                        className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveDay(i, "down")}
                        className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => deleteDay(i)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Botones */}
          <div className="mt-6 flex flex-col gap-4">
            <button
              onClick={addDay}
              className="w-full bg-[#001e42] text-white py-2 rounded-lg hover:bg-[#DCC9A3] transition"
            >
              + Add Day
            </button>

            <button
              onClick={saveItinerary}
              disabled={saving}
              className="w-full bg-[#001e42] text-white py-2 rounded-lg hover:bg-[#DCC9A3] transition"
            >
              {saving ? "Saving..." : "Save Itinerary"}
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
