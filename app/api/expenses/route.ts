import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 🟢 GET — Obtener gastos de un viaje
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tripId = Number(searchParams.get("tripId"));
    const userId = searchParams.get("userId") || "demo";

    if (!tripId) {
      return NextResponse.json({ error: "Missing tripId" }, { status: 400 });
    }

    const expenses = await prisma.expense.findMany({
      where: { tripId, userId },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("GET /api/expenses error:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

// 🟢 POST — Guardar todos los gastos
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tripId, userId, expenses } = body;

    if (!tripId || !userId || !Array.isArray(expenses)) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }

    // ✅ Obtener número de viajeros reales
    const trip = await prisma.trip.findUnique({
      where: { id: Number(tripId) },
      select: { travelers: true },
    });

    const numTravelers = Number(trip?.travelers) || 1;

    // ✅ Borrar gastos previos
    await prisma.expense.deleteMany({
      where: { tripId: Number(tripId), userId },
    });

    // ✅ Crear nuevos
    const createdExpenses = await prisma.$transaction(
      expenses.map((e: any) => {
        const amount = Number(e.amount) || 0;
        const doNotSplit = Boolean(e.doNotSplit);
        const amountPerTraveler = doNotSplit
          ? amount
          : amount / (numTravelers > 0 ? numTravelers : 1);

        return prisma.expense.create({
          data: {
            tripId: Number(tripId),
            userId,
            date: e.date ? new Date(e.date) : new Date(),
            place: e.place || "",
            category: e.category || "Others",
            description: e.description || "",
            amount,
            paidBy: e.paidBy || "",
            doNotSplit,
            amountPerTraveler,
          },
        });
      })
    );

    return NextResponse.json(
      { ok: true, count: createdExpenses.length, expenses: createdExpenses },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/expenses error:", error);
    return NextResponse.json({ error: "Failed to save expenses" }, { status: 500 });
  }
}

// 🟢 DELETE — Eliminar gasto individual
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ error: "Missing expense id" }, { status: 400 });
    }

    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ ok: true, deletedId: id });
  } catch (error) {
    console.error("DELETE /api/expenses error:", error);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
