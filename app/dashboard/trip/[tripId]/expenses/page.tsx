"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";

interface Expense {
  id?: number;
  date: string;
  place: string;
  category: string;
  description: string;
  amount: number;
  paidBy: string;
  amountPerTraveler: number;
}

interface Props {
  params: { tripId: string };
}

export default function ExpensesPage() {
  const params = useParams(); 
  const tripIdParam = params?.tripId;
  const tripId = Array.isArray(tripIdParam) ? tripIdParam[0] : tripIdParam;
  const [userId, setUserId] = useState<string>("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  

  // 🟢 Cargar usuario actual (NextAuth)
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (data?.user?.email) setUserId(data.user.email);
    };
    fetchUser();
  }, []);

  // 🟢 Cargar gastos y categorías
  useEffect(() => {
    const loadData = async () => {
      try {
        const [expRes, budRes] = await Promise.all([
          fetch(`/api/expenses?tripId=${tripId}&userId=${userId || "demo"}`),
          fetch(`/api/budget?tripId=${tripId}`),
        ]);
        const expData = await expRes.json();
        const budData = await budRes.json();

        const budgetCats =
          Array.isArray(budData) && budData.length > 0
            ? budData.map((b) => b.category)
            : [
                "Flights",
                "Accommodation",
                "Internal Transport",
                "Insurance",
                "Visa",
                "Activities",
                "Meals",
                "SIM",
                "Others",
              ];

        setCategories(budgetCats);

        if (Array.isArray(expData) && expData.length > 0) {
          setExpenses(
            expData.map((e: any) => ({
              ...e,
              date: e.date ? new Date(e.date).toISOString().split("T")[0] : "",
            }))
          );
        } else {
          const today = new Date().toISOString().split("T")[0];
          setExpenses([
            {
              date: today,
              category: "Others",
              description: "",
              place: "",
              amount: 0,
              paidBy: "Split",
              amountPerTraveler: 0,
            },
          ]);
        }
      } catch (err) {
        console.error("Error loading expenses:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [tripId, userId]);

  // ➕ Añadir fila
  const addRow = () => {
    const today = new Date().toISOString().split("T")[0];
    setExpenses([
      ...expenses,
      {
        date: today,
        place: "",
        category: "Others",
        description: "",
        amount: 0,
        paidBy: "Split",
        amountPerTraveler: 0,
      },
    ]);
  };

  // ❌ Eliminar fila
  const deleteRow = (index: number) => {
    setExpenses((prev) => prev.filter((_, i) => i !== index));
  };

  // ⬆️ Mover fila arriba
  const moveUp = (index: number) => {
    if (index === 0) return;
    setExpenses((prev) => {
      const copy = [...prev];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  };

  // ⬇️ Mover fila abajo
  const moveDown = (index: number) => {
    if (index === expenses.length - 1) return;
    setExpenses((prev) => {
      const copy = [...prev];
      [copy[index + 1], copy[index]] = [copy[index], copy[index + 1]];
      return copy;
    });
  };

  // 💾 Guardar gastos
  const saveExpenses = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: Number(tripId), userId, expenses }),
      });
      const result = await res.json();
      if (res.ok) alert("✅ Expenses saved successfully!");
      else alert("❌ Error: " + result.error);
    } catch (err) {
      console.error(err);
      alert("❌ Network error");
    } finally {
      setSaving(false);
    }
  };

  // 🧮 Calcular resúmenes
  const categorySummary = categories.map((cat) => {
    const sum = expenses
      .filter((e) => e.category === cat)
      .reduce((s, e) => s + (e.amountPerTraveler || 0), 0);
    return { category: cat, value: sum };
  });
  const totalByCategory = categorySummary.reduce((s, c) => s + c.value, 0);

  const paidBySummary = Array.from(new Set(expenses.map((e) => e.paidBy))).map(
    (p) => ({
      paidBy: p,
      value: expenses
        .filter((e) => e.paidBy === p)
        .reduce((s, e) => s + (e.amountPerTraveler || 0), 0),
    })
  );
  const totalByPaid = paidBySummary.reduce((s, c) => s + c.value, 0);

  const colors = ["#0c454a", "#DCC9A3", "#4A6D7C", "#7BAE7F", "#BF6B63", "#D9B08C", "#B85042"];

  if (loading)
    return (
      <>
        <NavBar tripId={tripId} />
        <main className="p-8 text-center text-gray-600">Loading trip information...</main>
      </>
    );

  return (
    <>
      <NavBar tripId={tripId} />
      <main className="p-8 space-y-10 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-4 text-[#0c454a]">💳 Expenses</h1>

        {/* Tabla de gastos */}
        <section className="bg-white p-6 rounded-2xl shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-[#0c454a] text-white">
                <tr>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-3">City/Place</th>
                  <th className="py-2 px-3">Amount (€)</th>
                  <th className="py-2 px-3">Paid By</th>
                  <th className="py-2 px-3">Per Traveler (€)</th>
                  <th className="py-2 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-2">
                      <input
                        type="date"
                        value={e.date}
                        onChange={(ev) =>
                          setExpenses((prev) =>
                            prev.map((x, j) =>
                              j === i ? { ...x, date: ev.target.value } : x
                            )
                          )
                        }
                        className="border p-1 rounded w-full"
                      />
                    </td>

                    <td className="p-2">
                      <select
                        value={e.category}
                        onChange={(ev) =>
                          setExpenses((prev) =>
                            prev.map((x, j) =>
                              j === i ? { ...x, category: ev.target.value } : x
                            )
                          )
                        }
                        className="border p-1 rounded w-full"
                      >
                        {categories.map((cat) => (
                          <option key={cat}>{cat}</option>
                        ))}
                      </select>
                    </td>

                    <td className="p-2">
                      <input
                        value={e.description}
                        onChange={(ev) =>
                          setExpenses((prev) =>
                            prev.map((x, j) =>
                              j === i ? { ...x, description: ev.target.value } : x
                            )
                          )
                        }
                        className="border p-1 rounded w-full"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        value={e.place}
                        onChange={(ev) =>
                          setExpenses((prev) =>
                            prev.map((x, j) =>
                              j === i ? { ...x, place: ev.target.value } : x
                            )
                          )
                        }
                        className="border p-1 rounded w-full"
                      />
                    </td>

                    <td className="p-2 text-right">
                      <input
                        type="number"
                        value={e.amount || ""}
                        onChange={(ev) => {
                          const amount = Number(ev.target.value) || 0;
                          setExpenses((prev) =>
                            prev.map((x, j) => {
                              if (j !== i) return x;
                              const amountPerTraveler =
                                x.paidBy === "Split" ? amount : amount / 2; // divide entre 2 si pagó alguien
                              return { ...x, amount, amountPerTraveler };
                            })
                          );
                        }}
                        className="border p-1 rounded w-full text-center"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        value={e.paidBy}
                        onChange={(ev) =>
                          setExpenses((prev) =>
                            prev.map((x, j) =>
                              j === i
                                ? {
                                    ...x,
                                    paidBy: ev.target.value,
                                    amountPerTraveler:
                                      ev.target.value === "Split"
                                        ? x.amount
                                        : x.amount / 2,
                                  }
                                : x
                            )
                          )
                        }
                        className="border p-1 rounded w-full"
                      />
                    </td>

                    <td className="text-right pr-3">{e.amountPerTraveler.toFixed(2)}</td>

                     <td className="p-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => moveUp(i)}
                          className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveDown(i)}
                          className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteRow(i)}
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
          </div>

          {/* Botones */}
          <div className="mt-6 flex flex-col gap-4">
            <button
              onClick={addRow}
              className="w-full bg-[#0c454a] text-white py-2 rounded-lg hover:bg-[#13636a] transition"
            >
              + Add Expense
            </button>
            <button
              onClick={saveExpenses}
              disabled={saving}
              className="w-full bg-[#0c454a] text-white py-2 rounded-lg hover:bg-[#13636a] transition"
            >
              {saving ? "Saving..." : "Save Expenses"}
            </button>
          </div>
        </section>

                {/* Resumen por categoría */}
        <section className="bg-white p-6 rounded-2xl shadow-md text-center">
          <h2 className="text-xl font-semibold mb-6 text-[#0c454a]">Summary by Category</h2>

          <div className="flex flex-col items-center">
            <table className="w-full border border-gray-300 text-sm mb-6 text-center">
              <thead className="bg-[#0c454a] text-white">
                <tr>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Amount (€)</th>
                </tr>
              </thead>
              <tbody>
                {categorySummary.map((c, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-3">{c.category}</td>
                  <td className="py-3">{c.value.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="font-bold border-t bg-gray-100">
                  <td className="py-3">Total</td>
                  <td className="py-3">{totalByCategory.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <PieChart width={400} height={300}>
              <Pie
                data={categorySummary}
                dataKey="value"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
              >
                {categorySummary.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </section>

        {/* Resumen por Paid By */}
        <section className="bg-white p-6 rounded-2xl shadow-md text-center">
          <h2 className="text-xl font-semibold mb-6 text-[#0c454a]">Summary by Paid By</h2>

          <div className="flex flex-col items-center">
            <table className="w-full border border-gray-300 text-sm mb-6 text-center">
              <thead className="bg-[#0c454a] text-white">
                <tr>
                  <th className="py-2 px-3">Paid By</th>
                  <th className="py-2 px-3">Amount (€)</th>
                </tr>
              </thead>
              <tbody>
                {paidBySummary.map((p, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-3">{p.paidBy}</td>
                    <td className="py-3">{p.value.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="font-bold border-t bg-gray-100">
                  <td className="py-3">Total</td>
                  <td className="py-3">{totalByPaid.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <PieChart width={400} height={300}>
              <Pie
                data={paidBySummary}
                dataKey="value"
                nameKey="paidBy"
                cx="50%"
                cy="50%"
                outerRadius={100}
              >
                {paidBySummary.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </section>

      </main>
    </>
  );
}
