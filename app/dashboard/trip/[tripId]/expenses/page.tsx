"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useParams } from "next/navigation";

interface Expense {
  id?: number;
  date: string;
  place: string;
  category: string;
  description: string;
  amount: number;
  paidBy: string;
  doNotSplit: boolean;
  amountPerTraveler: number;
}

export default function ExpensesPage() {
  const params = useParams();
  const tripIdParam = params?.tripId;
  const tripId = Array.isArray(tripIdParam) ? tripIdParam[0] : tripIdParam;

  const [userId, setUserId] = useState<string>("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [numTravelers, setNumTravelers] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🟢 Load user (NextAuth)
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (data?.user?.email) setUserId(data.user.email);
    };
    fetchUser();
  }, []);

  // 🟢 Load trip info + expenses + budget
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tripRes, expRes, budRes] = await Promise.all([
          fetch(`/api/trips/${tripId}`),
          fetch(`/api/expenses?tripId=${tripId}&userId=${userId || "demo"}`),
          fetch(`/api/budget?tripId=${tripId}`),
        ]);

        const tripData = await tripRes.json();
        const expData = await expRes.json();
        const budData = await budRes.json();

        if (tripData?.travelers) setNumTravelers(tripData.travelers);

        const defaultCats = [
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

        const budgetCats =
          Array.isArray(budData) && budData.length > 0
            ? budData.map((b) => b.category)
            : defaultCats;

        if (!budgetCats.includes("Others")) budgetCats.push("Others");
        setCategories(budgetCats);

        if (Array.isArray(expData) && expData.length > 0) {
          const formatted = expData.map((e: any) => ({
            ...e,
            doNotSplit: e.doNotSplit || false,
            date: e.date ? new Date(e.date).toISOString().split("T")[0] : "",
          }));
          setExpenses(formatted);
        } else {
          setExpenses([
            {
              date: new Date().toISOString().split("T")[0],
              place: "",
              category: "Others",
              description: "",
              amount: 0,
              paidBy: "",
              doNotSplit: false,
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

  // 🧮 Recalculate per traveler when numTravelers changes
  useEffect(() => {
    setExpenses((prev) =>
      prev.map((e) => ({
        ...e,
        amountPerTraveler: e.doNotSplit
          ? e.amount
          : e.amount / (numTravelers || 1),
      }))
    );
  }, [numTravelers]);

  // ➕ Add row
  const addRow = () => {
    const today = new Date().toISOString().split("T")[0];
    setExpenses((prev) => [
      ...prev,
      {
        date: today,
        place: "",
        category: categories.includes("Others") ? "Others" : categories[0],
        description: "",
        amount: 0,
        paidBy: "",
        doNotSplit: false,
        amountPerTraveler: 0,
      },
    ]);
  };

  // ❌ Delete row
  const deleteRow = (index: number) => {
    setExpenses((prev) => prev.filter((_, i) => i !== index));
  };

  // ⬆️ Move row
  const moveUp = (index: number) => {
    if (index === 0) return;
    setExpenses((prev) => {
      const copy = [...prev];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  };

  // ⬇️ Move row
  const moveDown = (index: number) => {
    if (index === expenses.length - 1) return;
    setExpenses((prev) => {
      const copy = [...prev];
      [copy[index + 1], copy[index]] = [copy[index], copy[index + 1]];
      return copy;
    });
  };

  // 💾 Save expenses
  const saveExpenses = async () => {
    // Check PaidBy constraint
    const uniquePaidBy = new Set(
      expenses
        .map((e) => e.paidBy)
        .filter((p) => p && p.toLowerCase() !== "split")
    );
    if (uniquePaidBy.size > numTravelers) {
      alert(
        `❌ Error: You have more unique "Paid By" names (${uniquePaidBy.size}) than travelers (${numTravelers}).`
      );
      return;
    }

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

  // 🧾 Summaries
  const categorySummary = categories
    .map((cat) => {
      const sum = expenses
        .filter((e) => e.category === cat)
        .reduce((s, e) => s + (e.amountPerTraveler || 0), 0);
      return { category: cat, value: sum };
    })
    .filter((c) => c.value > 0);

  const totalByCategory = categorySummary.reduce((s, c) => s + c.value, 0);

  const paidBySummary = Array.from(new Set(expenses.map((e) => e.paidBy)))
    .filter((p) => p)
    .map((p) => ({
      paidBy: p,
      value: expenses
        .filter((e) => e.paidBy === p)
        .reduce((s, e) => s + (e.amountPerTraveler || 0), 0),
    }))
    .filter((p) => p.value > 0);

  const totalByPaid = paidBySummary.reduce((s, c) => s + c.value, 0);

  const colors = [
    "#001e42",
    "#DCC9A3",
    "#025fd1",
    "#EAEAEA",
    "#BF6B63",
    "#F6A89E",
    "#5d6063",
  ];

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
        <h1 className="text-3xl font-bold mb-4">💳 Expenses Log</h1>
        <p className="text-center text-gray-700 text-lg max-w-2xl mx-auto mt-4 mb-8 leading-relaxed">
  Your journey, your numbers.  
  Log your daily expenses and see how they align with your planned budget — because enjoying the trip also means understanding it.
</p>

        {/* Table */}
        <section className="bg-white p-6 rounded-2xl shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-[#001e42] text-white">
                <tr>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-3">City/Place</th>
                  <th className="py-2 px-3">Amount (€)</th>
                  <th className="py-2 px-3">Do Not Split?</th>
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
                              j === i
                                ? { ...x, description: ev.target.value }
                                : x
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
                            prev.map((x, j) =>
                              j === i
                                ? {
                                    ...x,
                                    amount,
                                    amountPerTraveler: x.doNotSplit
                                      ? amount
                                      : amount / (numTravelers || 1),
                                  }
                                : x
                            )
                          );
                        }}
                        className="border p-1 rounded w-full text-center"
                      />
                    </td>
                    <td className="p-2 text-center">
  <input
    type="checkbox"
    checked={e.doNotSplit || false}
    onChange={(ev) => {
      const checked = ev.target.checked;
      setExpenses((prev) =>
        prev.map((x, j) =>
          j === i
            ? {
                ...x,
                doNotSplit: checked,
                amountPerTraveler: checked
  ? x.amount
  : x.amount / Math.max(1, numTravelers || 1),
              }
            : x
        )
      );
    }}
  />
</td>
                    <td className="p-2">
                      <input
                        value={e.paidBy}
                        onChange={(ev) =>
                          setExpenses((prev) =>
                            prev.map((x, j) =>
                              j === i
                                ? { ...x, paidBy: ev.target.value }
                                : x
                            )
                          )
                        }
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="text-right pr-3">
                      {e.amountPerTraveler.toFixed(2)}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => moveUp(i)}
                          className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveDown(i)}
                          className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                        >
                          ↓
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

          {/* Buttons */}
          <div className="mt-6 flex flex-col gap-4">
            <button
              onClick={addRow}
              className="w-full bg-[#001e42] text-white py-2 rounded-lg hover:bg-[#DCC9A3] transition"
            >
              + Add Expense
            </button>
            <button
              onClick={saveExpenses}
              disabled={saving}
              className="w-full bg-[#001e42] text-white py-2 rounded-lg hover:bg-[#DCC9A3] transition"
            >
              {saving ? "Saving..." : "Save Expenses"}
            </button>
          </div>
        </section>

        {/* Resumen por categoría */}
        <section className="bg-white p-6 rounded-2xl shadow-md text-center">
          <h2 className="text-xl font-bold mb-6">
            Summary by Category
          </h2>
          <div className="flex flex-col items-center">
          <table className="w-full border border-gray-300 text-sm mb-6 text-center">
              <thead className="bg-[#001e42] text-white">
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
          
            <PieChart width={400} height={320}>
              <Pie
                data={categorySummary}
                dataKey="value"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
               label={({ category, value }) =>
  `${category}: €${Number(value || 0).toFixed(2)}`
}
              >
                {categorySummary.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val, name, entry) => {
  const value = Number(val) || 0;
  const percent = totalByCategory > 0 ? ((value / totalByCategory) * 100).toFixed(1) : "0.0";
  return `${entry.payload.category}: €${value.toFixed(2)} (${percent}%)`;
}}
              />
              <Legend />
            </PieChart>
          </div>
        </section>

        {/* Resumen por Paid By */}
        <section className="bg-white p-6 rounded-2xl shadow-md text-center">
          <h2 className="text-xl font-bold mb-6">
            Summary by Paid By
          </h2>
          <div className="flex flex-col items-center">
            <table className="w-full border border-gray-300 text-sm mb-6 text-center">
              <thead className="bg-[#001e42] text-white">
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
            <PieChart width={400} height={320}>
              <Pie
                data={paidBySummary}
                dataKey="value"
                nameKey="paidBy"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ paidBy, value }) => {
  const val = Number(value) || 0;
  return `${paidBy}: €${val.toFixed(2)}`;
}}
              >
                {paidBySummary.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip
               formatter={(val, name, entry) => {
  const valueNum = Number(val) || 0;
  const percent = totalByPaid > 0 ? (valueNum / totalByPaid) * 100 : 0;
  return `${entry.payload.paidBy}: €${valueNum.toFixed(2)} (${percent.toFixed(1)}%)`;
}}
              />
              <Legend />
            </PieChart>
          </div>
        </section>
      </main>
    </>
  );
}
