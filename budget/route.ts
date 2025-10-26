// /app/api/budget/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const defaultCategories = [
  "Flights",
  "Accommodation",
  "Internal Transport",
  "Insurance",
  "Visa",
  "Activities",
  "Meals",
  "SIM",
  "Others",
];

// 🟢 GET budgets (incluye spent desde Expenses)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tripId = Number(searchParams.get("tripId"));
    if (!tripId)
      return NextResponse.json({ error: "Missing tripId" }, { status: 400 });

    // 🔹 Obtener budgets actuales
    let budgets = await prisma.budget.findMany({ where: { tripId } });

    // 🔹 Crear las categorías por defecto si no existen
    if (budgets.length === 0) {
      await prisma.budget.createMany({
        data: defaultCategories.map((cat) => ({
          tripId,
          category: cat,
          budget: 0,
          spent: 0,
          overbudget: 0,
          percentage: 0,
        })),
      });
      budgets = await prisma.budget.findMany({ where: { tripId } });
    }

    // 🔹 Obtener gastos agrupados por categoría
    const expenses = await prisma.expense.groupBy({
      by: ["category"],
      where: { tripId },
      _sum: { amountPerTraveler: true },
    });

    // 🔹 Unir las categorías de Budget, Expenses y defaultCategories
    const allCategories = Array.from(
      new Set([
        ...defaultCategories,
        ...budgets.map((b) => b.category),
        ...expenses.map((e) => e.category),
      ])
    );

    // 🔹 Actualizar o crear Budget si hay nuevas categorías
    for (const cat of allCategories) {
      if (!budgets.some((b) => b.category === cat)) {
        await prisma.budget.create({
          data: {
            tripId,
            category: cat,
            budget: 0,
            spent: 0,
            overbudget: 0,
            percentage: 0,
          },
        });
      }
    }

    // 🔹 Releer budgets actualizados
    budgets = await prisma.budget.findMany({ where: { tripId } });

    // 🔹 Actualizar spent automáticamente
    const updated = budgets.map((b) => {
      const match = expenses.find((e) => e.category === b.category);
      const spent = match?._sum.amountPerTraveler || 0;
      const over = Math.max(0, spent - b.budget);
      const percentage = b.budget ? (spent / b.budget) * 100 : 0;
      return { ...b, spent, overbudget: over, percentage };
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 🔵 POST budgets (añade o actualiza categorías)
export async function POST(req: Request) {
  try {
    const { tripId, budgets } = await req.json();
    if (!tripId || !Array.isArray(budgets))
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    // 🔹 Eliminar anteriores
    await prisma.budget.deleteMany({ where: { tripId } });

    // 🔹 Crear nuevos registros
    await prisma.budget.createMany({
      data: budgets.map((b) => ({
        tripId,
        category: b.category,
        budget: Number(b.budget) || 0,
        spent: Number(b.spent) || 0,
        overbudget: Math.max(0, (b.spent || 0) - (b.budget || 0)),
        percentage: b.budget ? ((b.spent || 0) / b.budget) * 100 : 0,
      })),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving budgets:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
