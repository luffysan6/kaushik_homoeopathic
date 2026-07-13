# Kaushik Homoeopathic Clinic — Admin Panel Documentation

A summary of what's built, how it works, and a client-facing walkthrough you can use for training.

---

## 1. What this project is

A custom admin panel for the clinic's website, letting the client manage their own content — gallery photos, patient testimonials, and contact form submissions — without needing a developer for routine updates.

The public-facing website (what visitors see) is a separate, later phase. Right now this covers the **admin/backend side only**.

---

## 2. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database ORM | Prisma |
| Database | PostgreSQL (hosted on Supabase) |
| Image storage | Cloudinary |
| Authentication | JWT session in an httpOnly cookie |
| Styling | Tailwind CSS |
| Icons | lucide-react |
| Excel export | ExcelJS |
| PDF export | @react-pdf/renderer |
| Email notifications | Resend |

---

## 3. Project structure

```
src/
  app/
    admin/
      login/page.tsx           → admin login screen
      dashboard/page.tsx       → overview with stat cards
      gallery/page.tsx         → gallery photo management
      testimonials/page.tsx    → testimonial management
      forms/page.tsx           → contact form field builder
      contact-forms/page.tsx   → view/export submissions
    api/
      auth/logout/route.ts
      media/route.ts           → gallery upload/list/delete
      testimonials/route.ts + [id]/route.ts
      contact/route.ts         → PUBLIC submission endpoint
      contact/submissions/route.ts
      contact/submissions/export/excel/route.ts
      contact/submissions/export/pdf/route.ts
      contact-forms/route.ts + [id]/route.ts
  lib/
    prisma.ts                  → database connection
    cloudinary.ts               → image upload/delete helpers
    auth.ts                     → password hashing, JWT
    resend.ts                   → email sending
  prisma/
    schema.prisma                → database structure
    seed.ts                      → creates first admin user + default forms
proxy.ts                          → protects /admin/* routes (Next.js 16 renamed
                                     this from "middleware.ts")
```

---

## 4. Data model, in plain terms

| Model | What it stores |
|---|---|
| `Admin` | Login credentials (username + hashed password) |
| `Media` | Every uploaded image — tagged as `GALLERY` or `TESTIMONIAL` |
| `Testimonial` | Patient name, role, review text, star rating, published/hidden status, optional linked photo |
| `ContactForm` | The *definition* of a form — its name and which fields it has (stored as flexible JSON, so new forms/fields don't need code changes) |
| `ContactSubmission` | The actual data a visitor submits, linked to a `ContactForm` by slug |

The key design choice: **contact forms are data-driven, not hardcoded.** The client can create a new form (e.g. "Feedback Form") or add a field to an existing one (e.g. "preferred doctor") entirely through the admin panel — no code changes needed.

---

## 5. How the admin panel works — client walkthrough

Use this as your script when training the client.

### Logging in
1. Go to `yourdomain.com/admin/login`
2. Enter the username and password (set up during onboarding)
3. You'll land on the Dashboard

### Dashboard
The home screen shows three counters — gallery images, testimonials, and contact submissions — each a shortcut to that section.

### Managing the gallery
1. Go to **Gallery** from the dashboard
2. Click the upload area, choose one or more photos
3. Each selected photo shows a preview — add an optional caption, or click the ✕ to remove one before uploading
4. Click **Upload** — photos are compressed and stored automatically
5. Click any uploaded photo to view it full-size
6. Hover over a photo and click the trash icon to delete it (this also removes it from cloud storage, not just the website)

### Managing testimonials
1. Go to **Testimonials**
2. Click **Add testimonial**
3. Fill in patient name, role (optional, e.g. "Patient since 2022"), the testimonial text, and a star rating
4. Optionally attach a patient photo
5. Save — the testimonial appears in the list
6. Each testimonial has three quick actions: **Publish/Hide** (controls whether it shows on the live site), **Edit**, and **Delete**

### Managing contact forms
1. Go to **Contact Forms** (the builder, not the submissions viewer)
2. Click **New form** to create one (e.g. "Feedback Form"), or **Edit** an existing one
3. Add fields one at a time — give each a label (e.g. "Phone Number"), choose its type (text, email, phone, long text, or date), and mark it required or optional
4. Save

This is the part that gives the client independence — they can add a field to the appointment form without contacting you.

### Viewing and exporting submissions
1. Go to **Contact Submissions**
2. Use the dropdown to filter by which form
3. Click **Excel** or **PDF** to download all matching submissions as a spreadsheet or formatted document

### Logging out
Click **Log out** on the dashboard — this clears the session, requiring login again next time.

---

## 6. What's built vs. what's next

**Done:**
- Full gallery management (upload, preview, lightbox, delete)
- Full testimonial management (create, edit, publish toggle, delete)
- Dynamic contact form builder
- Submission viewing + Excel/PDF export
- Email notification on new submissions (via Resend)
- Login/session security

**Not yet built (next phases):**
- The actual public-facing website (gallery, testimonials, and contact form as visitors will see them)
- Spam protection on the public contact form (honeypot or rate limiting)
- Password change flow for the admin (currently requires a script)
- Bulk actions / drag-to-reorder in the gallery

---

## 7. Quick reference for you (the developer)

- Seed script: `npx prisma db seed` — recreates the first admin user and default forms
- Local DB inspection: `npx prisma studio`
- The `proxy.ts` file (Next.js 16's renamed `middleware.ts`) controls which routes require login — check its `matcher` array when adding new protected pages or API routes
