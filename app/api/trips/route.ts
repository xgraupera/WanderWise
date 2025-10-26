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
  const { name, startDate, endDate, travelers } = data;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationDays = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  const newTrip = await prisma.trip.create({
    data: {
      name,
      startDate: start,
      endDate: end,
      travelers: parseInt(travelers),
      durationDays,
      userId: user!.id,
    },
  });

  return NextResponse.json(newTrip);
}
