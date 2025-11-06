// 📄 app/dashboard/trip/[tripId]/checklist/page.tsx
"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { useParams } from "next/navigation";

interface ChecklistItem {
  id?: number;
  category: string;
  task: string;
  notes: string;
  done: boolean;
}

interface Props {
  params: { tripId: string };
}

const defaultChecklist = [
  { category: "Documents", task: "ID and Passport", notes: "" },
  { category: "Documents", task: "Visa", notes: "" },
  { category: "Documents", task: "Fotocopy of Passport and Visa", notes: "" },
  { category: "Documents", task: "International Driver's Licence", notes: "" },
  { category: "Documents", task: "Hotel and Transport Reservations", notes: "" },
  { category: "Money", task: "International Credit/Debit Card", notes: "" },
  { category: "Health", task: "Basic First Aid Kit", notes: "" },
  { category: "Health", task: "Vaccinations", notes: "" },
  { category: "Health", task: "Health Insurance", notes: "" },
  { category: "Technology", task: "Charger and Plug Adapters", notes: "" },
  { category: "Technology", task: "Power Bank", notes: "" },
  { category: "Technology", task: "International SIM Card/eSIM", notes: "" },
];

export default function ChecklistPage() {
  const params = useParams(); 
  const tripIdParam = params?.tripId;
  const tripId = Array.isArray(tripIdParam) ? tripIdParam[0] : tripIdParam;
  const [rows, setRows] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🟢 Cargar datos
  useEffect(() => {
    async function fetchChecklist() {
      try {
        const res = await fetch(`/api/checklist?tripId=${tripId}`);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) setRows(data);
        else setRows(defaultChecklist.map((c) => ({ ...c, done: false })));
      } catch (err) {
        console.error("Error loading checklist:", err);
        setRows(defaultChecklist.map((c) => ({ ...c, done: false })));
      } finally {
        setLoading(false);
      }
    }

    fetchChecklist();
  }, [tripId]);

  // ➕ Añadir fila
  const addRow = () =>
    setRows([
      ...rows,
      { category: "", task: "", notes: "", done: false },
    ]);

  // 🗑️ Eliminar fila
  const deleteRow = (index: number) =>
    setRows(rows.filter((_, i) => i !== index));

  // 💾 Guardar checklist
  const saveChecklist = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: Number(tripId), checklist: rows }),
      });

      if (res.ok) {
        alert("✅ Checklist saved!");
      } else {
        const err = await res.json();
        alert("❌ Error saving checklist: " + (err.error || "Unknown"));
      }
    } catch (error) {
      alert("❌ Network or server error");
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
          <h1 className="text-3xl font-bold">🧾 Travel Checklist</h1>
        </div>

        <section className="bg-white p-6 rounded-lg shadow-md">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-[#0c454a] text-white">
              <tr>
                <th className="p-2">Category</th>
                <th className="p-2">Done</th>
                <th className="p-2">Task</th>
                <th className="p-2">Notes</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    <input
                      className="border p-1 rounded w-full"
                      value={r.category}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x, j) =>
                            j === i ? { ...x, category: e.target.value } : x
                          )
                        )
                      }
                    />
                  </td>
                  
                  <td className="p-2">
                    <input
                      className="border p-1 rounded w-full"
                      value={r.task}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x, j) =>
                            j === i ? { ...x, task: e.target.value } : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <textarea
                      className="border p-1 rounded w-full"
                      value={r.notes}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x, j) =>
                            j === i ? { ...x, notes: e.target.value } : x
                          )
                        )
                      }
                    />
                  </td>
                  
                  <td className="p-2 text-center">
                    <button
                      onClick={() => deleteRow(i)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Botones */}
          <div className="mt-6 flex flex-col gap-4">
            <button
              onClick={addRow}
              className="w-full bg-[#0c454a] text-white py-2 rounded-lg hover:bg-[#13636a] transition"
            >
              + Add Item
            </button>

            <button
              onClick={saveChecklist}
              disabled={saving}
              className="w-full bg-[#0c454a] text-white py-2 rounded-lg hover:bg-[#13636a] transition"
            >
              {saving ? "Saving..." : "Save Checklist"}
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
