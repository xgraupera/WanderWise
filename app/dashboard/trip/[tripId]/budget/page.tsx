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

  const totalOverbudget = budget.reduce(
  (sum, c) => sum + Math.max(0, (c.spent || 0) - (c.budget || 0)),
  0
);

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
<p className="text-center text-gray-700 text-lg max-w-2xl mx-auto mt-4 mb-8 leading-relaxed">
  Travel freely by planning wisely.  
  Set your budget for each category and let WanderWisely help you stay on track every step of the journey.
</p>
        <section className="bg-white p-6 rounded-lg shadow-md">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-[#001e42] text-white">
              <tr>
                <th className="p-2">Category</th>
                <th className="p-2">Budget (€)</th>
                <th className="p-2">% of Total Budget</th>
                <th className="p-2">Spent by Traveler (€)</th>
                <th className="p-2">Overbudget (€)</th>
                
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
<td className="p-2 text-center">{pct}%</td>
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
                    
                    

<td className="p-2 text-center">
  <button
    onClick={() => {
      if (item.spent > 0) {
        alert("⚠️ This category cannot be deleted because it already has expenses.");
        return;
      }
      deleteCategory(i);
    }}
    disabled={item.spent > 0}
    className={`px-2 py-1 rounded text-white ${
      item.spent > 0
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-red-500 hover:bg-red-600"
    }`}
    title={
      item.spent > 0
        ? "Cannot delete a category with existing expenses"
        : "Delete this category"
    }
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
                <td className="p-2"> - </td>
                <td className="p-2">{totalSpent.toFixed(2)}</td>
                <td className="p-2">
                  {totalOverbudget.toFixed(2)}
                </td>
                
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
              className="bg-[#001e42] text-white px-4 py-2 rounded-lg hover:bg-[#DCC9A3] transition"
            >
              + Add Category
            </button>
          </div>

          <div className="mt-6">
            <button
              onClick={saveBudget}
              disabled={saving}
              className="w-full bg-[#001e42] text-white py-2 rounded-lg hover:bg-[#DCC9A3] transition"
            >
              {saving ? "Saving..." : "Save Budget"}
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
