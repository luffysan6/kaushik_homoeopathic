import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { prisma } from "@/lib/prisma";
import SubmissionsPdf from "@/components/pdf/SubmissionsPdf";

export async function GET(request: NextRequest) {
  const formSlug = request.nextUrl.searchParams.get("formSlug");

  const submissions = await prisma.contactSubmission.findMany({
    where: formSlug ? { formSlug } : undefined,
    orderBy: { createdAt: "desc" },
  });

  if (submissions.length === 0) {
    return NextResponse.json(
      { error: "No submissions to export." },
      { status: 404 },
    );
  }

  const allKeys = new Set<string>();
  submissions.forEach((s) =>
    Object.keys(s.data as object).forEach((k) => allKeys.add(k)),
  );
  const keys = Array.from(allKeys);

  const buffer = await renderToBuffer(
    React.createElement(SubmissionsPdf, { submissions, keys }),
  );

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="submissions-${Date.now()}.pdf"`,
    },
  });
}
