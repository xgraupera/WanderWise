import { NextResponse } from 'next/server';

export async function GET(req) {
  // Si usas un secret
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Aquí pones la lógica que quieres ejecutar
  console.log("Cron job running");

  return NextResponse.json({ ok: true });
}
