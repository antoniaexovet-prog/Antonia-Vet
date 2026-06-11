import { NextRequest, NextResponse } from "next/server";
import { availableSlotsForDate } from "@/lib/availability";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Parámetro 'date' inválido. Usa formato YYYY-MM-DD." },
      { status: 400 }
    );
  }

  const slots = await availableSlotsForDate(date);
  return NextResponse.json({ date, slots });
}
