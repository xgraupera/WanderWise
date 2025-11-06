"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { useParams } from "next/navigation";

interface Props {
  params: { tripId: string };
}

interface BudgetItem {
  id?: number;
  category: string;
  budget: number;
  spent: number;
  overbudget?: number;
  percentage?: number;
}

export default function BudgetPage() {
  const params = useParams(); 
  const tripIdParam = params?.tripId;
  const tripId = Array.isArray(tripIdParam) ? tripIdParam[0] : tripIdParam;
  const tripIdNum = Number(tripId);
  const [budget, setBudget] = useState<BudgetItem[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  

  // 🟢 Cargar budgets + gastos desde API
  useEffect(() => {
    async function loadBudgets() {
      try {
        const res = await fetch(`/api/budget?tripId=${tripIdNum}`);
        const data = await res.json();
        if (Array.isArray(data)) setBudget(data);
      } catch (err) {
        console.error("Error loading budgets:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBudgets();
  }, [tripIdNum]);

  const totalBudget = budget.reduce((sum, c) => sum + (Number(c.budget) || 0), 0);
  const totalSpent = budget.reduce((sum, c) => sum + (Number(c.spent) || 0), 0);

  const addCategory = () => {
    if (!newCategory.trim()) return;
    setBudget((prev) => [
      ...prev,
      { category: newCategory.trim(), budget: 0, spent: 0 },
    ]);
    setNewCategory("");
  };

  const deleteCategory = (index: number) => {
    setBudget((prev) => prev.filter((_, i) => i !== index));
  };

  async function saveBudget() {
    setSaving(true);
    const prepared = budget.map((b) => ({
      ...b,
      overbudget: Math.max(0, (b.spent || 0) - (b.budget || 0)),
      percentage: b.budget ? ((b.spent || 0) / b.budget) * 100 : 0,
    }));

    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: tripIdNum, budgets: prepared }),
      });
      if (res.ok) alert("✅ Budget saved!");
      else alert("❌ Error saving budget");
    } catch (err) {
      console.error(err);
      alert("❌ Server error");
    } finally {
      setSaving(false);
    }
  }

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
        <h1 className="text-3xl font-bold">💰 Budget Planning</h1>

        <section className="bg-white p-6 rounded-lg shadow-md">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-[#0c454a] text-white">
              <tr>
                <th className="p-2">Category</th>
                <th className="p-2">Budget (€)</th>
                <th className="p-2">Spent by Traveler (€)</th>
                <th className="p-2">Overbudget (€)</th>
                <th className="p-2">% of Total Budget</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {budget.map((item, i) => {
                const over = Math.max(0, (item.spent || 0) - (item.budget || 0));
                const pct = item.budget
                  ? (((item.budget || 0) / totalBudget) * 100).toFixed(1)
                  : "0";

                return (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-2 font-medium">{item.category}</td>

                    {/* Budget */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        placeholder="Enter budget"
                        className="border p-1 rounded w-full text-center"
                        value={item.budget || ""}
                        onChange={(e) =>
                          setBudget((prev) =>
                            prev.map((b, j) =>
                              j === i
                                ? { ...b, budget: Number(e.target.value) || 0 }
                                : b
                            )
                          )
                        }
                      />
                    </td>

                    {/* Spent (readonly) */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        readOnly
                        className="border p-1 rounded w-full text-center bg-gray-100 cursor-not-allowed"
                        value={item.spent?.toFixed(2) || "0.00"}
                      />
                    </td>

                    <td className="p-2 text-center">{over.toFixed(2)}</td>
                    <td className="p-2 text-center">{pct}%</td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => deleteCategory(i)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Totales centrados */}
            <tfoot className="bg-gray-100 font-semibold text-center">
              <tr>
                <td className="p-2">Total</td>
                <td className="p-2">{totalBudget.toFixed(2)}</td>
                <td className="p-2">{totalSpent.toFixed(2)}</td>
                <td className="p-2">
                  {Math.max(0, totalSpent - totalBudget).toFixed(2)}
                </td>
                <td className="p-2"> - </td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-6 flex gap-3">
            <input
              type="text"
              placeholder="New Category Name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="border p-2 rounded-lg flex-1"
            />
            <button
              onClick={addCategory}
              className="bg-[#0c454a] text-white px-4 py-2 rounded-lg hover:bg-[#13636a] transition"
            >
              + Add Category
            </button>
          </div>

          <div className="mt-6">
            <button
              onClick={saveBudget}
              disabled={saving}
              className="w-full bg-[#0c454a] text-white py-2 rounded-lg hover:bg-[#13636a] transition"
            >
              {saving ? "Saving..." : "Save Budget"}
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
