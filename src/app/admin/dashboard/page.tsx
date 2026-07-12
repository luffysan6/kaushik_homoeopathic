import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [galleryCount, testimonialCount, submissionCount] = await Promise.all([
    prisma.media.count({ where: { type: "GALLERY" } }),
    prisma.testimonial.count(),
    prisma.contactSubmission.count(),
  ]);

  const cards = [
    {
      title: "Gallery Images",
      count: galleryCount,
      href: "/admin/gallery",
      description: "Manage gallery photos",
    },
    {
      title: "Testimonials",
      count: testimonialCount,
      href: "/admin/testimonials",
      description: "Add, edit, or remove testimonials",
    },
    {
      title: "Contact Submissions",
      count: submissionCount,
      href: "/admin/contact-forms",
      description: "View leads from contact forms",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="rounded border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Log out
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className="mt-2 text-3xl font-semibold">{card.count}</p>
              <p className="mt-1 text-sm text-gray-400">{card.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}