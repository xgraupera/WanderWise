import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tripId = Number(searchParams.get("tripId"));
    if (!tripId)
      return NextResponse.json({ error: "Missing tripId" }, { status: 400 });

    const reservations = await prisma.reservation.findMany({
      where: { tripId },
      orderBy: { createdAt: "desc" },
    });

    const budgets = await prisma.budget.findMany({ where: { tripId } });
    const categories = budgets.map((b) => b.category);

    return NextResponse.json({ reservations, categories });
  } catch (error: any) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { tripId, reservations, userEmail } = data;

    if (!tripId || !Array.isArray(reservations)) {
      return NextResponse.json(
        { error: "Missing tripId or reservations" },
        { status: 400 }
      );
    }

    const savedReservations = [];

    for (const r of reservations) {
      let saved;

      // 🔹 Actualizar si id es numérico
      if (typeof r.id === "number") {
        saved = await prisma.reservation.update({
          where: { id: r.id },
          data: { ...r, tripId },
        });
      } else {
        // 🔹 Crear si no hay id numérico o es temporal
        const existing = await prisma.reservation.findFirst({
          where: { tripId, type: r.type },
        });

        if (existing) {
          saved = await prisma.reservation.update({
            where: { id: existing.id },
            data: { ...r, tripId },
          });
        } else {
          saved = await prisma.reservation.create({
            data: { ...r, tripId },
          });
        }
      }

      savedReservations.push(saved);

      // 🔔 HANDLE REMINDERS sin usar upsert
      if (saved.cancellationDate) {
        const existingReminder = await prisma.reminder.findFirst({
          where: { reservationId: saved.id },
        });

        if (existingReminder) {
          await prisma.reminder.update({
            where: { id: existingReminder.id },
            data: { sendAt: new Date(saved.cancellationDate) },
          });
        } else {
          await prisma.reminder.create({
            data: {
              reservationId: saved.id,
              email: userEmail,
              sendAt: new Date(saved.cancellationDate),
            },
          });
        }
      } else {
        await prisma.reminder.deleteMany({
          where: { reservationId: saved.id },
        });
      }
    }

    return NextResponse.json({ reservations: savedReservations });
  } catch (error: any) {
    console.error("Error saving reservations:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}





export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id, ...updates } = data;

    const reservation = await prisma.reservation.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(reservation);
  } catch (error: any) {
    console.error("Error updating reservation:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.reservation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting reservation:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
