import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 🟢 GET: obtener datos del viaje + presupuestos + gastos
export async function GET(
  req: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    const tripId = Number(params.tripId);
    if (!tripId) {
      return NextResponse.json({ error: "Missing tripId" }, { status: 400 });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        durationDays: true,
        travelers: true,
        createdAt: true,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // 🔹 Calcular presupuestos totales
    const budgets = await prisma.budget.findMany({
      where: { tripId },
      select: { budget: true },
    });
    const totalBudget = budgets.reduce((sum, b) => sum + (b.budget || 0), 0);

    // 🔹 Calcular gastos totales
    const expenses = await prisma.expense.findMany({
      where: { tripId },
      select: { amountPerTraveler: true },
    });
    const spentSoFar = expenses.reduce(
      (sum, e) => sum + (e.amountPerTraveler || 0),
      0
    );

    // ✅ Devolvemos estructura compatible con la página Main
  return NextResponse.json({
  id: trip.id,
  name: trip.name,
  startDate: trip.startDate,
  endDate: trip.endDate,
  durationDays: trip.durationDays,
  travelers: Number(trip.travelers) || 1, // ✅ fuerza tipo numérico y valor por defecto
  totalBudget,
  spentSoFar,
});
  } catch (error) {
    console.error("GET /api/trips/[tripId] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trip" },
      { status: 500 }
    );
  }
}

// 🔵 PUT: actualizar datos del viaje
export async function PUT(
  req: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    const tripId = Number(params.tripId);
    const body = await req.json();

    const durationDays = parseInt(body.durationDays, 10);
    const travelers = parseInt(body.travelers, 10);

    if (isNaN(durationDays) || isNaN(travelers)) {
      return NextResponse.json({ error: "Invalid number values" }, { status: 400 });
    }

    const updated = await prisma.trip.update({
      where: { id: tripId },
      data: {
        name: body.name,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        durationDays,
        travelers,
      },
    });

    // 🔹 Recalcular presupuesto y gastos después de actualizar
    const budgets = await prisma.budget.findMany({
      where: { tripId },
      select: { budget: true },
    });
    const totalBudget = budgets.reduce((sum, b) => sum + (b.budget || 0), 0);

    const expenses = await prisma.expense.findMany({
      where: { tripId },
      select: { amountPerTraveler: true },
    });
    const spentSoFar = expenses.reduce(
      (sum, e) => sum + (e.amountPerTraveler || 0),
      0
    );

    return NextResponse.json({
      message: "Trip updated successfully",
      updated,
      totalBudget,
      spentSoFar,
    });
  } catch (error) {
    console.error("PUT /api/trips/[tripId] error:", error);
    return NextResponse.json({ error: "Failed to update trip" }, { status: 500 });
  }
}
// 🔴 DELETE: eliminar un viaje y sus datos asociados
export async function DELETE(
  req: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    const tripId = Number(params.tripId);

    if (!tripId) {
      return NextResponse.json({ error: "Missing tripId" }, { status: 400 });
    }

    // 🔹 Eliminar datos dependientes en orden (evita errores de clave foránea)
    await prisma.budget.deleteMany({ where: { tripId } });
    await prisma.expense.deleteMany({ where: { tripId } });
    await prisma.itinerary.deleteMany({ where: { tripId } });
    await prisma.reservation.deleteMany({ where: { tripId } });
    await prisma.checklist.deleteMany({ where: { tripId } });

    // 🔹 Finalmente, eliminar el viaje
    await prisma.trip.delete({ where: { id: tripId } });

    return NextResponse.json({ message: "Trip and related data deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/trips/[tripId] error:", error);
    return NextResponse.json(
      { error: "Failed to delete trip" },
      { status: 500 }
    );
  }
}
