import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImage, deleteImage } from "@/lib/cloudinary";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await request.formData();

  const name = formData.get("name") as string | null;
  const role = formData.get("role") as string | null;
  const content = formData.get("content") as string | null;
  const ratingRaw = formData.get("rating") as string | null;
  const published = formData.get("published") as string | null;
  const file = formData.get("file") as File | null;

  const existing = await prisma.testimonial.findUnique({
    where: { id },
    include: { media: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Testimonial not found." }, { status: 404 });
  }

  let mediaId = existing.mediaId;

  if (file && file.size > 0) {
    try {
      // replace old photo if one exists
      if (existing.media) {
        await deleteImage(existing.media.publicId);
        const uploaded = await uploadImage(file, "testimonial", name ?? existing.name);
        await prisma.media.update({
          where: { id: existing.media.id },
          data: { url: uploaded.url, publicId: uploaded.publicId },
        });
      } else {
        const uploaded = await uploadImage(file, "testimonial", name ?? existing.name);
        const media = await prisma.media.create({
          data: { url: uploaded.url, publicId: uploaded.publicId, type: "TESTIMONIAL" },
        });
        mediaId = media.id;
      }
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Photo upload failed." },
        { status: 400 }
      );
    }
  }

  const testimonial = await prisma.testimonial.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(role !== null && { role: role || null }),
      ...(content && { content }),
      ...(ratingRaw !== null && { rating: ratingRaw ? Number(ratingRaw) : null }),
      ...(published !== null && { published: published === "true" }),
      mediaId,
    },
    include: { media: true },
  });

  return NextResponse.json(testimonial);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
    include: { media: true },
  });
  if (!testimonial) {
    return NextResponse.json({ error: "Testimonial not found." }, { status: 404 });
  }

  if (testimonial.media) {
    await deleteImage(testimonial.media.publicId);
    await prisma.testimonial.delete({ where: { id } });
    await prisma.media.delete({ where: { id: testimonial.media.id } });
  } else {
    await prisma.testimonial.delete({ where: { id } });
  }

  return NextResponse.json({ success: true });
}