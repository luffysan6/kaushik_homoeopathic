import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type FormField = {
  name: string;
  label: string;
  type: string;
  required: boolean;
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { formSlug, data } = body;

  if (!formSlug || !data) {
    return NextResponse.json(
      { error: "formSlug and data are required." },
      { status: 400 },
    );
  }

  const form = await prisma.contactForm.findUnique({
    where: { slug: formSlug },
  });
  if (!form) {
    return NextResponse.json({ error: "Invalid form." }, { status: 404 });
  }

  const fields = form.fields as unknown as FormField[];
  for (const field of fields) {
    if (field.required && !data[field.name]?.toString().trim()) {
      return NextResponse.json(
        { error: `${field.label} is required.` },
        { status: 400 },
      );
    }
  }

  const submission = await prisma.contactSubmission.create({
    data: { formSlug, data },
  });

  return NextResponse.json(submission, { status: 201 });
}
