import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const forms = await prisma.contactForm.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(forms);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { slug, name, fields } = body;

  if (!slug || !name || !Array.isArray(fields) || fields.length === 0) {
    return NextResponse.json(
      { error: "Slug, name, and at least one field are required." },
      { status: 400 }
    );
  }

  const existing = await prisma.contactForm.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "A form with this slug already exists." }, { status: 409 });
  }

  const form = await prisma.contactForm.create({
    data: { slug, name, fields },
  });

  return NextResponse.json(form, { status: 201 });
}