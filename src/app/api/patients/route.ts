import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const search = request.nextUrl.searchParams.get("q")?.trim();

  const patients = await prisma.patient.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { ownerName: { contains: search } },
            { ownerEmail: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ patients });
}
