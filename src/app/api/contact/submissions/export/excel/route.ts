import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";

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

  // forms can have different fields, so collect every key that appears anywhere
  const allKeys = new Set<string>();
  submissions.forEach((s) =>
    Object.keys(s.data as object).forEach((k) => allKeys.add(k)),
  );
  const keys = Array.from(allKeys);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Submissions");

  sheet.columns = [
    { header: "Submitted At", key: "createdAt", width: 22 },
    { header: "Form", key: "formSlug", width: 16 },
    ...keys.map((k) => ({ header: k, key: k, width: 20 })),
  ];

  submissions.forEach((s) => {
    const data = s.data as Record<string, unknown>;
    const row: Record<string, unknown> = {
      createdAt: s.createdAt.toLocaleString(),
      formSlug: s.formSlug,
    };
    keys.forEach((k) => (row[k] = data[k] ?? ""));
    sheet.addRow(row);
  });

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEFEFEF" },
    };
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="submissions-${Date.now()}.xlsx"`,
    },
  });
}
