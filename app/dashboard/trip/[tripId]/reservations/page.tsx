"use client";

import { use, useEffect, useState } from "react";
import NavBar from "@/components/NavBar";

interface ReservationItem {
  id?: number;
  type: string;
  provider: string;
  bookingDate: string;
  date: string;
  cancellationDate?: string;
  amount: number;
  confirmed: boolean;
  link: string;
}

interface BudgetCategory {
  id: number;
  category: string;
}

interface Props {
  params: Promise<{ tripId: string }>;
}

// 🔹 Categorías predefinidas
const predefinedCategories = [
  "Flight 1",
  "Hotel 1",
  "Internal Transport 1",
  "Activity 1",
  "Insurance",
  "Visa",
];

export default function ReservationsPage({ params }: Props) {
  const { tripId } = use(params);
  const tripIdNum = Number(tripId);
  const [rows, setRows] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [currentReservation, setCurrentReservation] = useState<ReservationItem | null>(null);
  const [expenseForm, setExpenseForm] = useState({
    date: "",
    category: "",
    description: "",
    place: "",
    amount: 0,
    paidBy: "Split",
  });
  const [userId, setUserId] = useState("demo");
  const today = new Date().toISOString().split("T")[0];

  // 🧭 Obtener sesión (opcional)
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/auth/session");
        const d = await r.json();
        if (d?.user?.email) setUserId(d.user.email);
      } catch {
        setUserId("demo");
      }
    })();
  }, []);

  // 🟢 Cargar datos del viaje y categorías
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resReservations, resBudget] = await Promise.all([
          fetch(`/api/reservations?tripId=${tripIdNum}`),
          fetch(`/api/budget?tripId=${tripIdNum}`),
        ]);

        const data = await resReservations.json();
        const budget = await resBudget.json();

        if (Array.isArray(budget)) setBudgetCategories(budget);

        if (Array.isArray(data) && data.length > 0) {
          setRows(
            data.map((r: any) => ({
              ...r,
              bookingDate: r.bookingDate
                ? new Date(r.bookingDate).toISOString().split("T")[0]
                : today,
              date: r.date ? new Date(r.date).toISOString().split("T")[0] : "",
              cancellationDate: r.cancellationDate
                ? new Date(r.cancellationDate).toISOString().split("T")[0]
                : "",
            }))
          );
        } else {
          setRows(
            predefinedCategories.map((cat) => ({
              type: cat,
              provider: "",
              bookingDate: today,
              date: "",
              cancellationDate: "",
              amount: 0,
              confirmed: false,
              link: "",
            }))
          );
        }
      } catch (err) {
        console.error("Error loading reservations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tripId]);

  // 💾 Guardar todas las reservas
  const saveReservations = async () => {
    setSaving(true);
    const cleaned = rows.map((r) => ({
      ...r,
      tripId: tripIdNum,
      bookingDate: r.bookingDate ? new Date(r.bookingDate).toISOString() : null,
      date: r.date ? new Date(r.date).toISOString() : null,
      cancellationDate: r.cancellationDate
        ? new Date(r.cancellationDate).toISOString()
        : null,
      amount: Number(r.amount) || 0,
    }));

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: tripIdNum, reservations: cleaned }),
      });
      if (res.ok) alert("✅ Reservations saved!");
      else alert("❌ Error saving reservations");
    } catch (err) {
      console.error(err);
      alert("❌ Server error");
    } finally {
      setSaving(false);
    }
  };

  // ➕ Añadir fila
  const addRow = () => {
    setRows([
      ...rows,
      {
        type: "",
        provider: "",
        bookingDate: today,
        date: "",
        cancellationDate: "",
        amount: 0,
        confirmed: false,
        link: "",
      },
    ]);
  };

  // 🔽 Subir/bajar/eliminar
  const deleteRow = (i: number) => setRows(rows.filter((_, j) => j !== i));
  const moveUp = (i: number) => {
    if (i === 0) return;
    const copy = [...rows];
    [copy[i - 1], copy[i]] = [copy[i], copy[i - 1]];
    setRows(copy);
  };
  const moveDown = (i: number) => {
    if (i === rows.length - 1) return;
    const copy = [...rows];
    [copy[i + 1], copy[i]] = [copy[i], copy[i + 1]];
    setRows(copy);
  };

  // 🧾 Añadir gasto a Expenses
  const submitExpense = async () => {
    try {
      const payload = {
        tripId: tripIdNum,
        userId,
        expenses: [
          {
            date: new Date(expenseForm.date).toISOString(),
            category: expenseForm.category,
            description: expenseForm.description,
            place: expenseForm.place,
            amount: Number(expenseForm.amount),
            paidBy: expenseForm.paidBy,
          },
        ],
      };

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("✅ Expense added successfully");
        setShowExpenseForm(false);
      } else {
        alert("❌ Error adding expense");
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Server error adding expense");
    }
  };

  // abrir formulario de gasto
  const openExpenseForm = (reservation: ReservationItem) => {
    setCurrentReservation(reservation);
    setExpenseForm({
      date: reservation.bookingDate || today,
      category: budgetCategories[0]?.category || "",
      description: reservation.provider || reservation.type,
      place: "",
      amount: reservation.amount || 0,
      paidBy: "Split",
    });
    setShowExpenseForm(true);
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
        <h1 className="text-3xl font-bold mb-4">✈️ Reservations Tracker</h1>
<p className="text-center text-gray-700 text-lg max-w-2xl mx-auto mt-4 mb-8 leading-relaxed">
  Never lose a confirmation again.  
  Store your flights, hotels, transports, and tickets — always accessible, even on the go.
</p>
        <section className="bg-white p-6 rounded-lg shadow-md">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-[#001e42] text-white">
              <tr>
                <th className="p-2">Type</th>
                <th className="p-2">Provider</th>
                <th className="p-2">Booking Date</th>
                <th className="p-2">Travel Date</th>
                <th className="p-2">Cancellation Date</th>
                <th className="p-2">Amount (€)</th>
                <th className="p-2">Confirmed/Paid</th>
                <th className="p-2">Link</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    <input
                      className="border p-1 rounded w-full"
                      value={r.type}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x, j) => (j === i ? { ...x, type: e.target.value } : x))
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <input
                      className="border p-1 rounded w-full"
                      value={r.provider}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x, j) => (j === i ? { ...x, provider: e.target.value } : x))
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="date"
                      className="border p-1 rounded w-full"
                      value={r.bookingDate}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x, j) =>
                            j === i ? { ...x, bookingDate: e.target.value } : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="date"
                      className="border p-1 rounded w-full"
                      value={r.date}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x, j) => (j === i ? { ...x, date: e.target.value } : x))
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="date"
                      className="border p-1 rounded w-full"
                      value={r.cancellationDate || ""}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x, j) =>
                            j === i ? { ...x, cancellationDate: e.target.value } : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      className="border p-1 rounded w-full text-center"
                      value={r.amount || ""}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x, j) =>
                            j === i ? { ...x, amount: Number(e.target.value) || 0 } : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={r.confirmed}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setRows((prev) =>
                          prev.map((x, j) => (j === i ? { ...x, confirmed: checked } : x))
                        );
                        if (checked) openExpenseForm(r);
                      }}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      className="border p-1 rounded w-full"
                      value={r.link}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x, j) => (j === i ? { ...x, link: e.target.value } : x))
                        )
                      }
                    />
                  </td>
                  <td className="p-2 flex gap-1 justify-center">
                    <button
                      onClick={() => moveUp(i)}
                      className="px-2 py-1 bg-gray-300 rounded"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveDown(i)}
                      className="px-2 py-1 bg-gray-300 rounded"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => deleteRow(i)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 flex flex-col gap-4">
            <button
              onClick={addRow}
              className="w-full bg-[#001e42] hover:bg-[#DCC9A3] text-white py-2 rounded-lg"
            >
              + Add Reservation
            </button>
            <button
              onClick={saveReservations}
              disabled={saving}
              className="w-full bg-[#001e42] hover:bg-[#DCC9A3] text-white py-2 rounded-lg"
            >
              {saving ? "Saving..." : "Save Reservations"}
            </button>
          </div>
        </section>
      </main>

      {/* 🧾 Expense Form Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[400px] space-y-4">
            <h2 className="text-xl font-semibold text-center mb-4">Add Expense</h2>

            <label className="block">
              <span className="text-sm font-medium">Date</span>
              <input
                type="date"
                className="border p-2 rounded w-full"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Category</span>
              <select
                className="border p-2 rounded w-full"
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              >
                {budgetCategories.map((b) => (
                  <option key={b.id} value={b.category}>
                    {b.category}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium">Description</span>
              <input
                className="border p-2 rounded w-full"
                value={expenseForm.description}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, description: e.target.value })
                }
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">City / Place</span>
              <input
                className="border p-2 rounded w-full"
                value={expenseForm.place}
                onChange={(e) => setExpenseForm({ ...expenseForm, place: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Amount (€)</span>
              <input
                type="number"
                value={expenseForm.amount || ""}
                className="border p-2 rounded w-full"
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })
                }
                
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Paid By</span>
              <input
                className="border p-2 rounded w-full"
                value={expenseForm.paidBy}
                onChange={(e) => setExpenseForm({ ...expenseForm, paidBy: e.target.value })}
              />
            </label>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowExpenseForm(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={submitExpense}
                className="bg-[#0c454a] text-white px-4 py-2 rounded"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
