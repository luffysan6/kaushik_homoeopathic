import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({
    include: { media: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(testimonials);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const name = formData.get("name") as string | null;
  const role = formData.get("role") as string | null;
  const content = formData.get("content") as string | null;
  const ratingRaw = formData.get("rating") as string | null;
  const file = formData.get("file") as File | null;

  if (!name || !content) {
    return NextResponse.json({ error: "Name and testimonial content are required." }, { status: 400 });
  }

  let mediaId: string | undefined;

  if (file && file.size > 0) {
    try {
      const uploaded = await uploadImage(file, "testimonial", name);
      const media = await prisma.media.create({
        data: { url: uploaded.url, publicId: uploaded.publicId, type: "TESTIMONIAL" },
      });
      mediaId = media.id;
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Photo upload failed." },
        { status: 400 }
      );
    }
  }

  const testimonial = await prisma.testimonial.create({
    data: {
      name,
      role: role || null,
      content,
      rating: ratingRaw ? Number(ratingRaw) : null,
      mediaId,
    },
    include: { media: true },
  });

  return NextResponse.json(testimonial, { status: 201 });
}