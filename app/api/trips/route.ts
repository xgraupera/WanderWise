import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 🔹 Obtener todos los viajes del usuario
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { trips: true },
  });

  return NextResponse.json(user?.trips || []);
}

// 🔹 Crear un nuevo viaje
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  const data = await request.json();
  const { name, startDate, endDate, travelers, latitude, longitude } = data;

  const start = new Date(startDate);
  const end = new Date(endDate);
  // duración en días (incluye ambos extremos)
  const durationDays =
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // 🔹 Crear el viaje (sin cambiar nada de tu implementación original)
  const newTrip = await prisma.trip.create({
    data: {
      name,
      startDate: start,
      endDate: end,
      travelers: parseInt(travelers),
      durationDays,
       latitude,
    longitude,
      userId: user!.id,
    },
  });

  // 🔹 Generar itinerario inicial SOLO al crear el viaje (si no existe)
  try {
    const existing = await prisma.itinerary.findFirst({
      where: { tripId: newTrip.id },
    });

    if (!existing) {
      const itineraryData = Array.from({ length: durationDays }, (_, i) => ({
        day: i + 1,
        date: new Date(start.getTime() + i * 86400000),
        city: "",
        activity: "",
        notes: "",
        tripId: newTrip.id,
      }));

      await prisma.itinerary.createMany({ data: itineraryData });
    }
  } catch (err) {
    // No interrumpimos la creación del trip si algo falla aquí
    console.error("⚠️ Error generating itinerary automatically:", err);
  }

  return NextResponse.json(newTrip);
}
