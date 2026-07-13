import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const formSlug = request.nextUrl.searchParams.get("formSlug");

  const submissions = await prisma.contactSubmission.findMany({
    where: formSlug ? { formSlug } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(submissions);
}
