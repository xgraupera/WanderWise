// app/api/reservations/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 🔹 Categorías predefinidas que se crean si no hay reservas
const predefinedCategories = [
   "Flight 1",
  "Hotel 1",
  "Internal Transport 1",
  "Activity 1",
  "Insurance",
  "Visa",
];

// 🟢 GET: obtener reservas de un viaje
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get("tripId");

    if (!tripId) {
      return NextResponse.json({ error: "Missing tripId" }, { status: 400 });
    }

    const tripIdNum = Number(tripId);
    if (isNaN(tripIdNum)) {
      return NextResponse.json({ error: "Invalid tripId" }, { status: 400 });
    }

    // Buscar reservas existentes
    const reservations = await prisma.reservation.findMany({
      where: { tripId: tripIdNum },
      orderBy: { id: "asc" },
    });

    // Si no hay, crear categorías base
    if (reservations.length === 0) {
      const today = new Date();

      const data = predefinedCategories.map((cat) => ({
        type: cat,
        provider: "",
        bookingDate: today,
        date: null,
        cancellationDate: null,
        amount: 0,
        confirmed: false,
        link: "",
        tripId: tripIdNum,
      }));

      await prisma.reservation.createMany({ data });

      const created = await prisma.reservation.findMany({
        where: { tripId: tripIdNum },
        orderBy: { id: "asc" },
      });

      return NextResponse.json(created);
    }

    return NextResponse.json(reservations);
  } catch (error: any) {
    console.error("GET /api/reservations error:", error);
    return NextResponse.json(
      { error: error.message || "Error loading reservations" },
      { status: 500 }
    );
  }
}

// 🔵 POST: guardar todas las reservas
export async function POST(req: Request) {
  try {
    const { tripId, reservations } = await req.json();

    if (!tripId) {
      return NextResponse.json({ error: "Missing tripId" }, { status: 400 });
    }

    const tripIdNum = Number(tripId);
    if (isNaN(tripIdNum)) {
      return NextResponse.json({ error: "Invalid tripId" }, { status: 400 });
    }

    if (!Array.isArray(reservations)) {
      return NextResponse.json(
        { error: "Invalid reservations array" },
        { status: 400 }
      );
    }

    // Borrar reservas anteriores
    await prisma.reservation.deleteMany({
      where: { tripId: tripIdNum },
    });

    // Crear las nuevas
    if (reservations.length > 0) {
      const dataToCreate = reservations.map((r) => ({
        tripId: tripIdNum,
        type: r.type || "",
        provider: r.provider || "",
        bookingDate: r.bookingDate ? new Date(r.bookingDate) : new Date(),
        date: r.date ? new Date(r.date) : new Date(),
        cancellationDate: r.cancellationDate ? new Date(r.cancellationDate) : null,
        amount: Number(r.amount) || 0,
        confirmed: Boolean(r.confirmed),
        link: r.link || "",
      }));

      await prisma.reservation.createMany({ data: dataToCreate });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/reservations error:", error);
    return NextResponse.json(
      { error: error.message || "Server error while saving reservations" },
      { status: 500 }
    );
  }
}

