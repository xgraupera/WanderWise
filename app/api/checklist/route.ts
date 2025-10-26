// 📄 app/api/checklist/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔹 Checklist inicial por defecto
const defaultChecklist = [
  { category: "Documents", task: "ID and Passport", notes: "" },
  { category: "Documents", task: "Visa", notes: "" },
  { category: "Documents", task: "Fotocopy of Passport and Visa", notes: "" },
  { category: "Documents", task: "International Driver's Licence", notes: "" },
  { category: "Documents", task: "Hotel and Transport Reservations", notes: "" },
  { category: "Money", task: "International Credit/Debit Card", notes: "" },
  { category: "Health", task: "Basic First Aid Kit", notes: "" },
  { category: "Health", task: "Vaccinations", notes: "" },
  { category: "Health", task: "Health Insurance", notes: "" },
  { category: "Technology", task: "Charger and Plug Adapters", notes: "" },
  { category: "Technology", task: "Power Bank", notes: "" },
  { category: "Technology", task: "International SIM Card/eSIM", notes: "" },
];

// 🟢 GET - Obtener checklist de un viaje
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tripId = Number(searchParams.get("tripId"));
    if (!tripId) return NextResponse.json({ error: "Missing tripId" }, { status: 400 });

    const checklist = await prisma.checklist.findMany({
      where: { tripId },
      orderBy: { id: "asc" },
    });

    if (checklist.length === 0) {
      // Si no hay registros, devolver la lista por defecto
      return NextResponse.json(
        defaultChecklist.map((c) => ({ ...c, done: false }))
      );
    }

    return NextResponse.json(checklist);
  } catch (error) {
    console.error("❌ Error loading checklist:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// 🟢 POST - Guardar o actualizar checklist
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tripId, checklist } = body;

    if (!tripId || !Array.isArray(checklist)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    // 🔸 Borrar checklist anterior del viaje
    await prisma.checklist.deleteMany({ where: { tripId } });

    // 🔸 Insertar nueva lista
    const created = await prisma.checklist.createMany({
      data: checklist.map((c: any) => ({
        tripId: Number(tripId),
        category: c.category || "",
        task: c.task || "",
        notes: c.notes || "",
        done: Boolean(c.done),
      })),
    });

    return NextResponse.json({ message: "Checklist saved successfully", created });
  } catch (error: any) {
    console.error("❌ Error saving checklist:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
