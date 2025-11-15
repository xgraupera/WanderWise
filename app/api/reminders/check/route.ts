import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();

  const dueReminders = await prisma.reminder.findMany({
    where: {
      sent: false,
      sendAt: { lte: now },
    },
    include: {
      reservation: true,
    },
  });

  for (const reminder of dueReminders) {
    // 1. Send email
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/send-reminder`, {
      method: "POST",
      body: JSON.stringify({
        to: reminder.email,
        subject: "Cancellation deadline reminder",
        text: `Don't forget to cancel your reservation: ${reminder.reservation.type}.
Deadline: ${reminder.sendAt.toISOString().split("T")[0]}`,
      }),
      headers: { "Content-Type": "application/json" },
    });

    // 2. Mark as sent
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { sent: true },
    });
  }

  return NextResponse.json({ sent: dueReminders.length });
}
