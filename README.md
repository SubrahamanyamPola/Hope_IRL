# HOPE_IRL Cloud UI Web App (Deploy-ready)

Cloud-themed career consultancy web app with:
- Login + Signup (Email/Password) ✅
- Google Sign-In (OAuth) ✅
- Services dashboard (from your HOPE_IRL plan) ✅
- Cart + Checkout ✅
- Revolut payment link flow (placeholder) ✅
- Resume upload (local/dev) + storage-ready fields ✅
- Admin dashboard (view orders, export CSV for Excel) ✅

---

## Quick Start (Local)

### 1) Install
```bash
npm install
cp .env.example .env
```

### 2) Configure `.env`
- Set `DATABASE_URL`
- Set `NEXTAUTH_SECRET` (random long string)

### 3) Prisma
```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

### 4) Run
```bash
npm run dev
```

Open: http://localhost:3000

---

## Admin Panel
- URL: `/admin`
- Default credentials come from:
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`

---

## Deploy (Vercel + Render Postgres)

### Database (Render)
1. Create a Postgres DB in Render
2. Copy its external connection string into `DATABASE_URL`

### Vercel
1. Push repo to GitHub
2. Import to Vercel
3. Add env vars on Vercel:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (your deployed URL)
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (optional now)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_REVOLUT_LINK`
   - `NEXT_PUBLIC_WHATSAPP_LINK`

> Note: run Prisma migrations against the cloud DB before/after deploy.

---

## Important: Resume Upload on Vercel
Current upload saves into `public/uploads` (OK locally).
**Vercel serverless is not persistent for file storage.**

Production options:
- Cloudflare R2
- AWS S3
- Supabase Storage
- Firebase Storage

Where to change:
- `app/api/checkout/submit/route.js` → replace local save with object storage upload, then store URL in DB.

---

## Payment
Current flow:
1. User clicks Revolut link (placeholder)
2. User pastes payment reference
3. Admin verifies and sets status to `paid`

Upgrade later:
- Revolut merchant API + webhook → automatic verification.

---

## Excel Export
Admin can export all orders as CSV:
- `/api/admin/export`

Open CSV in Excel.

---

## Customizations
- Service details: `lib/constants.js`
- Colors/background: `app/globals.css` + Tailwind config
- WhatsApp link: `.env` (`NEXT_PUBLIC_WHATSAPP_LINK`)
- Revolut link: `.env` (`NEXT_PUBLIC_REVOLUT_LINK`)

---

## Added Consultancy-Grade Features (v2)

### 1) Customer Order Status Page
- `/orders` (list)
- `/orders/[id]` (Amazon-style steps)

### 2) Email Notifications (Safe + Optional)
Uses **Resend** if `RESEND_API_KEY` is set, otherwise logs and continues (no crashes):
- On order submission: "Order received"
- On admin mark as paid: "Payment verified"
- On completion: "Completed"

### 3) Assign Consultant (Admin)
- Seeded sample consultants in `prisma/seed.mjs`
- Admin order page lets you assign a consultant.

### 4) Internal Notes (Admin)
- Admin can add notes.
- Customer sees notes on `/orders/[id]`.

### 5) Storage Upgrade (S3/R2 Optional)
- `lib/storage.js` automatically uses S3/R2 if env vars set.
- Otherwise falls back to local upload for development.

### 6) Payment Verification Webhook (Placeholder)
- `POST /api/webhooks/revolut`
- Accepts payload: `{ orderId, status: "paid", paymentRef }`
- Optional signature via `REVOLUT_WEBHOOK_SECRET` and header `x-hope-signature` (HMAC SHA256).

### 7) GDPR Features
- Download my data: `GET /api/gdpr/export`
- Delete request: `/account` → creates `DeleteRequest`

