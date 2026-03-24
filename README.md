# Smart Review QR SaaS

Production-ready multi-tenant MVP for local businesses that want to grow Google reviews with QR codes. Each business gets its own `/r/[slug]` review page, business-type review suggestions, and lightweight analytics.

## Stack

- Next.js App Router
- Tailwind CSS
- Node.js route handlers
- Lightweight JSON persistence
- Vercel-ready deployment

## Features

- Landing page with clear CTA
- Dynamic `/r/[slug]` review pages per business
- Business types: cafe, salon, clinic, gym, hotel
- Smart review suggestions based on business type
- Multi-client admin panel with auto-generated slugs
- Downloadable QR codes for direct review links
- Basic analytics for scans and click sentiment
- English and Hindi toggle using JSON translations
- Mobile-first UI
- Suggestion copy helpers on the public review page

## Folder Structure

```text
.
├── app
│   ├── admin/page.tsx
│   ├── api
│   │   └── businesses
│   │       ├── [slug]/route.ts
│   │       └── route.ts
│   ├── go/[slug]/[sentiment]/route.ts
│   ├── layout.tsx
│   ├── not-found.tsx
│   ├── page.tsx
│   ├── r/[slug]/page.tsx
│   └── s/[slug]/route.ts
├── components
│   ├── admin-dashboard.tsx
│   ├── landing-page.tsx
│   ├── language-provider.tsx
│   ├── language-toggle.tsx
│   ├── not-found-page.tsx
│   ├── qr-preview.tsx
│   ├── review-flow.tsx
│   └── site-header.tsx
├── data
│   └── seed.json
├── lib
│   ├── business-types.ts
│   ├── db.ts
│   ├── site.ts
│   ├── slug.ts
│   └── translations.ts
├── messages
│   ├── en.json
│   └── hi.json
├── types
│   └── business.ts
├── .env.example
├── eslint.config.mjs
├── .gitignore
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Optional: copy environment variables:

```bash
cp .env.example .env.local
```

3. Start the development server:

```bash
npm run dev
```

4. Open:

- `http://localhost:3000` for the landing page
- `http://localhost:3000/admin` for the admin panel

## Sample Data

The app auto-seeds from `data/seed.json` the first time it runs. The sample businesses include:

- `Sunrise Dental Studio`
- `Urban Brew Cafe`
- `Motion Fit Gym`

Use the seeded demo review flow at:

- `http://localhost:3000/r/urban-brew-cafe`

## Environment Variables

- `NEXT_PUBLIC_APP_URL`
  Use your public site URL for QR links when you want a fixed origin.
- `SMART_REVIEW_DATA_PATH`
  Optional custom path for the JSON database file.

## Persistence Notes

This MVP uses a lightweight file-based JSON store.

- Local development writes to `data/db.json`
- On Vercel, the app writes to `/tmp/smart-review-qr/db.json`

That makes deployment easy for demos and low-risk MVP trials. For long-term durable production storage across instance restarts, swap the adapter in `lib/db.ts` to a hosted database later.

## Deploying To Vercel

1. Import the project into Vercel.
2. Set `NEXT_PUBLIC_APP_URL` to your deployed domain.
3. Deploy with the default Next.js settings.

## Notes

- No authentication is included by design for MVP speed.
- The primary QR destination is the direct business page: `/r/[slug]`.
- Legacy `/s/[slug]` links still redirect for compatibility.
- Analytics are tracked when a business review page loads and when redirect buttons are clicked.
- Review suggestions are generated from the business type instead of requiring AI or manual writing.
