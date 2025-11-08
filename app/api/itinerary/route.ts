import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 🔹 GET - Obtener itinerario de un viaje (NO genera nada)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tripId = Number(searchParams.get("tripId"));
  if (!tripId)
    return NextResponse.json({ error: "Missing tripId" }, { status: 400 });

  try {
    const itinerary = await prisma.itinerary.findMany({
      where: { tripId },
      orderBy: { day: "asc" },
    });
    return NextResponse.json(itinerary);
  } catch (error) {
    console.error("GET /api/itinerary error:", error);
    return NextResponse.json(
      { error: "Failed to load itinerary" },
      { status: 500 }
    );
  }
}

// 🔹 POST - Guardar/actualizar itinerario y eliminar días que no aparezcan en el payload
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tripId, itinerary } = body;

    if (!tripId || !Array.isArray(itinerary)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Normalizar la lista de días recibidos (asegurar day como number)
    const providedDays: number[] = itinerary
      .map((d: any) => Number(d.day))
      .filter((n: number) => !isNaN(n));

    // Upsert (crear/actualizar) cada día que viene en el payload
    const results: any[] = [];

    // Puedes usar transaction para mayor seguridad, pero mantenemos simple y robusto
    for (const i of itinerary) {
      const dayNum = Number(i.day);
      if (isNaN(dayNum)) continue;

      const saved = await prisma.itinerary.upsert({
        where: {
          tripId_day: { tripId: Number(tripId), day: dayNum },
        },
        update: {
          // solo incluir date si viene (evita pasar undefined/null explícito)
           date: i.date ? new Date(i.date) : new Date(),
          city: i.city || "",
          activity: i.activity || "",
          notes: i.notes || "",
        },
        create: {
  day: dayNum,
  date: i.date ? new Date(i.date) : new Date(), // ✅ aseguramos un valor Date válido
  city: i.city || "",
  activity: i.activity || "",
  notes: i.notes || "",
  trip: { connect: { id: tripId } },
},
      });

      results.push(saved);
    }

    // 🔻 ELIMINAR cualquier día que exista en BD pero NO venga en el payload
    // Esto hace persistente la eliminación hecha por el usuario en el frontend.
    // Si providedDays está vacío, eliminamos todas las filas (el usuario borró todo).
    await prisma.itinerary.deleteMany({
      where: {
        tripId: Number(tripId),
        day: providedDays.length ? { notIn: providedDays } : undefined,
      },
    });

    return NextResponse.json({ ok: true, saved: results });
  } catch (error: unknown) {
    console.error("❌ Error saving itinerary:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to save itinerary", details: message },
      { status: 500 }
    );
  }
}
