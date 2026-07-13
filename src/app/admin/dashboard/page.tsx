import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Images,
  MessageSquareQuote,
  Inbox,
  LogOut,
  ArrowRight,
  Stethoscope,
  ClipboardList,
} from "lucide-react";

export default async function DashboardPage() {
  const [galleryCount, testimonialCount, submissionCount] = await Promise.all([
    prisma.media.count({ where: { type: "GALLERY" } }),
    prisma.testimonial.count(),
    prisma.contactSubmission.count(),
  ]);

  const cards = [
    {
      title: "Gallery images",
      count: galleryCount,
      href: "/admin/gallery",
      description: "Manage gallery photos",
      icon: Images,
      accent: { bg: "bg-blue-50", text: "text-blue-600" },
    },
    {
      title: "Testimonials",
      count: testimonialCount,
      href: "/admin/testimonials",
      description: "Add, edit, or remove testimonials",
      icon: MessageSquareQuote,
      accent: { bg: "bg-amber-50", text: "text-amber-600" },
    },
    {
      title: "Contact submissions",
      count: submissionCount,
      href: "/admin/contact-forms",
      description: "View leads from contact forms",
      icon: Inbox,
      accent: { bg: "bg-emerald-50", text: "text-emerald-600" },
    },
    { 
      title: "Contact forms",
      count: 0, // or fetch prisma.contactForm.count() alongside the others
      href: "/admin/forms",
      description: "Manage form fields",
      icon: ClipboardList, // import from lucide-react
      accent: { bg: "bg-purple-50", text: "text-purple-600" },
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Stethoscope size={18} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
              <p className="text-sm text-gray-500">
                Overview of your site content
              </p>
            </div>
          </div>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              title="Log out"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={15} />
              Log out
            </button>
          </form>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.accent.bg} ${card.accent.text}`}
                  >
                    <Icon size={20} />
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-500"
                  />
                </div>

                <p className="mt-4 text-3xl font-semibold text-gray-800">
                  {card.count}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {card.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
