import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 🔹 GET: obtiene gastos
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tripId = Number(searchParams.get("tripId"));

  if (!tripId)
    return NextResponse.json({ error: "Missing tripId" }, { status: 400 });

  try {
    const expenses = await prisma.expense.findMany({
      where: { tripId },
      orderBy: { date: "asc" },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("GET /api/expenses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

// 🔹 POST: añade nuevos gastos (no borra los anteriores). Acepta un array o un único objeto.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tripId, userId } = body;

    // Accept either { expenses: [...] } or { expense: {...} } or directly expense(s)
    let incoming: any = body.expenses ?? body.expense ?? body;

    // If incoming has tripId/userId keys, and not expenses, normalize
    if (incoming && incoming.tripId && (incoming.expenses || incoming.expense)) {
      incoming = incoming.expenses ?? incoming.expense ?? [];
    }

    // Normalize to array
    const expensesArray = Array.isArray(incoming) ? incoming : [incoming];

    if (!tripId || !Array.isArray(expensesArray) || expensesArray.length === 0) {
      return NextResponse.json({ error: "Invalid data: no expenses provided" }, { status: 400 });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: Number(tripId) },
      select: { travelers: true },
    });

    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    const maxTravelers = Number(trip.travelers) || 1;

    // Validación: amount debe ser número y >= 0
    const invalid = expensesArray.some((e: any) => {
      const amount = Number(e?.amount);
      return Number.isNaN(amount) || amount < 0;
    });

    if (invalid) {
      return NextResponse.json(
        { error: "Invalid expense data: amounts must be numeric and >= 0" },
        { status: 400 }
      );
    }

    // Crear nuevos gastos (append)
    const created = [];
    for (const e of expensesArray) {
      const amount = Number(e.amount) || 0;
      const amountPerTraveler = (amount) / (maxTravelers > 0 ? maxTravelers : 1);

      const createdExpense = await prisma.expense.create({
        data: {
          tripId: Number(tripId),
          userId: (userId || "demo"),
          date: e.date ? new Date(e.date) : new Date(),
          place: e.place || "",
          category: e.category || "Others",
          description: e.description || "",
          amount: amount,
          paidBy: e.paidBy || "Split",
          amountPerTraveler,
        },
      });
      created.push(createdExpense);
    }

    return NextResponse.json({ ok: true, createdCount: created.length, created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/expenses error:", error);
    return NextResponse.json({ error: "Failed to save expenses" }, { status: 500 });
  }
}
