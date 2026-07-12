import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type"); // GALLERY | TESTIMONIAL

  const media = await prisma.media.findMany({
    where: type ? { type: type as "GALLERY" | "TESTIMONIAL" } : undefined,
    orderBy: { order: "asc" },
  });

  return NextResponse.json(media);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null;
  const caption = formData.get("caption") as string | null;

  if (!file || !type) {
    return NextResponse.json({ error: "File and type are required." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `clinic/${type.toLowerCase()}` },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve({ secure_url: result.secure_url, public_id: result.public_id });
        }
      );
      stream.end(buffer);
    }
  );

  const media = await prisma.media.create({
    data: {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      type: type as "GALLERY" | "TESTIMONIAL",
      caption: caption || null,
    },
  });

  return NextResponse.json(media, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await cloudinary.uploader.destroy(media.publicId);
  await prisma.media.delete({ where: { id } });

  return NextResponse.json({ success: true });
}