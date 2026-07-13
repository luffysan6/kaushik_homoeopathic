import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, fields } = body;

  if (!name || !Array.isArray(fields) || fields.length === 0) {
    return NextResponse.json(
      { error: "Name and at least one field are required." },
      { status: 400 }
    );
  }

  const form = await prisma.contactForm.update({
    where: { id },
    data: { name, fields },
  });

  return NextResponse.json(form);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // don't silently delete a form that already has submissions tied to it
  const submissionCount = await prisma.contactSubmission.count({
    where: { formSlug: (await prisma.contactForm.findUnique({ where: { id } }))?.slug ?? "" },
  });

  if (submissionCount > 0) {
    return NextResponse.json(
      { error: `Can't delete — this form has ${submissionCount} existing submission(s).` },
      { status: 409 }
    );
  }

  await prisma.contactForm.delete({ where: { id } });
  return NextResponse.json({ success: true });
}