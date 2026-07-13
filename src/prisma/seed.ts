import { prisma } from "@/lib/prisma";

async function main() {
  // ...existing admin seed code...

  await prisma.contactForm.upsert({
    where: { slug: "general" },
    update: {},
    create: {
      slug: "general",
      name: "General Inquiry",
      fields: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "phone", label: "Phone", type: "text", required: true },
        {
          name: "message",
          label: "Message",
          type: "textarea",
          required: false,
        },
      ],
    },
  });

  await prisma.contactForm.upsert({
    where: { slug: "appointment" },
    update: {},
    create: {
      slug: "appointment",
      name: "Book Appointment",
      fields: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "phone", label: "Phone", type: "text", required: true },
        {
          name: "preferredDate",
          label: "Preferred Date",
          type: "date",
          required: true,
        },
      ],
    },
  });

  console.log("Contact forms ready.");
}
main();
