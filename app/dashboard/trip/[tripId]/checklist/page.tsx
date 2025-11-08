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

const defaultChecklist: ChecklistItem[] = [
  { category: "Documents", task: "ID and Passport", notes: "", done: false },
  { category: "Documents", task: "Visa", notes: "", done: false },
  { category: "Documents", task: "Fotocopy of Passport and Visa", notes: "", done: false },
  { category: "Documents", task: "International Driver's Licence", notes: "", done: false },
  { category: "Documents", task: "Hotel and Transport Reservations", notes: "", done: false },
  { category: "Money", task: "International Credit/Debit Card", notes: "", done: false },
  { category: "Health", task: "Basic First Aid Kit", notes: "", done: false },
  { category: "Health", task: "Vaccinations", notes: "", done: false },
  { category: "Health", task: "Health Insurance", notes: "", done: false },
  { category: "Technology", task: "Charger and Plug Adapters", notes: "", done: false },
  { category: "Technology", task: "Power Bank", notes: "", done: false },
  { category: "Technology", task: "International SIM Card/eSIM", notes: "", done: false },
  { category: "Others", task: "Other items", notes: "", done: false },
];


export default function ChecklistPage() {
  const params = useParams(); 
    const tripIdParam = params?.tripId;
    const tripId = Array.isArray(tripIdParam) ? tripIdParam[0] : tripIdParam;
  const [rows, setRows] = useState<ChecklistItem[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🟢 Cargar datos desde API o defaults
  useEffect(() => {
    async function fetchChecklist() {
      try {
        const res = await fetch(`/api/checklist?tripId=${tripId}`);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) setRows(data);
        else setRows(defaultChecklist);
      } catch (err) {
        console.error("Error loading checklist:", err);
        setRows(defaultChecklist);
      } finally {
        setLoading(false);
      }
    }
    fetchChecklist();
  }, [tripId]);

  // 🧩 Agrupar por categoría
  const grouped = rows.reduce((acc: Record<string, ChecklistItem[]>, item) => {
    const category = item.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const categories = Array.from(new Set(rows.map((r) => r.category).filter(Boolean)));

  // ➕ Añadir nueva categoría (como en Budget)
  const addCategory = () => {
    if (!newCategory.trim()) return;
    const newCat = newCategory.trim();
    setRows((prev) => [
      ...prev,
      { category: newCat, task: "", notes: "", done: false },
    ]);
    setNewCategory("");
  };

  // ➕ Añadir nueva fila seleccionando categoría existente o nueva
  const addRow = () => {
    if (!newItemCategory) {
      alert("Please select or create a category for this new item.");
      return;
    }
    setRows((prev) => [
      ...prev,
      { category: newItemCategory, task: "", notes: "", done: false },
    ]);
    setNewItemCategory("");
  };

  // 🗑️ Eliminar fila
  const deleteRow = (index: number) => setRows(rows.filter((_, i) => i !== index));

  // 💾 Guardar checklist
  const saveChecklist = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: Number(tripId), checklist: rows }),
      });
      if (res.ok) alert("✅ Checklist saved!");
      else {
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
      <main className="p-8 space-y-10 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-4">🧾 Travel Checklist</h1>
<p className="text-center text-gray-700 text-lg max-w-2xl mx-auto mt-4 mb-8 leading-relaxed">
  Don’t leave anything behind.  
  Create your packing list, check off what’s ready, and travel knowing you have everything you need.
</p>
        <section className="bg-white p-6 rounded-lg shadow-md">
          {/* Tabla principal */}
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-[#001e42] text-white">
              <tr>
                <th className="p-2 w-16">Done</th>
                <th className="p-2">Item</th>
                <th className="p-2 w-40">Category</th>
                <th className="p-2">Notes</th>
                <th className="p-2 w-20">Actions</th>
              </tr>
            </thead>

            <tbody>
              {Object.entries(grouped).map(([category, items]) =>
                items.map((r, i) => {
                  const globalIndex = rows.findIndex(
                    (x) =>
                      x.task === r.task &&
                      x.category === r.category &&
                      x.notes === r.notes
                  );
                  return (
                    <tr key={`${category}-${i}`} className="border-t hover:bg-gray-50">
                      {/* Done */}
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={r.done}
                          onChange={(e) =>
                            setRows((prev) =>
                              prev.map((x, j) =>
                                j === globalIndex ? { ...x, done: e.target.checked } : x
                              )
                            )
                          }
                        />
                      </td>

                      {/* Task */}
                      <td className="p-2">
                        <input
                          className="border p-1 rounded w-full"
                          value={r.task}
                          onChange={(e) =>
                            setRows((prev) =>
                              prev.map((x, j) =>
                                j === globalIndex
                                  ? { ...x, task: e.target.value }
                                  : x
                              )
                            )
                          }
                        />
                      </td>

                      {/* Category combinada */}
                      {i === 0 && (
                        <td
                          className="p-2 font-semibold text-center"
                          rowSpan={items.length}
                        >
                          {category}
                        </td>
                      )}

                      {/* Notes */}
                      <td className="p-2">
                        <textarea
                          className="border p-1 rounded w-full"
                          value={r.notes}
                          onChange={(e) =>
                            setRows((prev) =>
                              prev.map((x, j) =>
                                j === globalIndex
                                  ? { ...x, notes: e.target.value }
                                  : x
                              )
                            )
                          }
                        />
                      </td>

                      {/* Actions */}
                      <td className="p-2 text-center">
                        <button
                          onClick={() => deleteRow(globalIndex)}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Añadir nueva fila */}
          <div className="mt-6 flex gap-3">
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="border p-2 rounded-lg flex-1 bg-white"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="__new">+ Create New Category...</option>
            </select>

            {newItemCategory === "__new" && (
              <input
                type="text"
                placeholder="New Category Name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="border p-2 rounded-lg flex-1"
              />
            )}

            <button
              onClick={() => {
                if (newItemCategory === "__new") {
                  if (!newCategory.trim()) return alert("Enter a category name");
                  setRows((prev) => [
                    ...prev,
                    { category: newCategory.trim(), task: "", notes: "", done: false },
                  ]);
                  setNewCategory("");
                  setNewItemCategory("");
                } else addRow();
              }}
              className="bg-[#001e42] text-white px-4 py-2 rounded-lg hover:bg-[#DCC9A3] transition"
            >
              + Add New Item
            </button>
          </div>

          {/* Guardar */}
          <div className="mt-6">
            <button
              onClick={saveChecklist}
              disabled={saving}
              className="w-full bg-[#001e42] text-white py-2 rounded-lg hover:bg-[#DCC9A3] transition"
            >
              {saving ? "Saving..." : "Save Checklist"}
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
