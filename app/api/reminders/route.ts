import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { reservationId, email, sendAt } = await req.json();

    const reminder = await prisma.reminder.create({
      data: {
        reservationId,
        email,
        sendAt: new Date(sendAt),
      },
    });

    return NextResponse.json({ reminder });
  } catch (err) {
    console.error("Error creating reminder:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
