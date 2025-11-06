// 📄 app/api/itinerary/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
    return NextResponse.json({ error: "Failed to load itinerary" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tripId, itinerary } = body;

    if (!tripId || !Array.isArray(itinerary)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const results = [];

    for (const i of itinerary) {
      const saved = await prisma.itinerary.upsert({
        where: {
          tripId_day: { tripId: Number(tripId), day: Number(i.day) },
        },
        update: {
          date: i.date ? new Date(i.date) : null as any,
          city: i.city || "",
          activity: i.activity || "",
          notes: i.notes || "",
        },
        create: {
          day: Number(i.day),
          date: i.date ? new Date(i.date) : null as any,
          city: i.city || "",
          activity: i.activity || "",
          notes: i.notes || "",
          trip: {
            connect: { id: Number(tripId) },
          },
        },
      });
      results.push(saved);
    }

    return NextResponse.json({ ok: true, saved: results });
} catch (error: unknown) {
  console.error("❌ Error saving itinerary:", error);

  const message =
    error instanceof Error ? error.message : "Unknown error";

  return NextResponse.json(
    { error: "Failed to save itinerary", details: message },
    { status: 500 }
  );
}
}
