# QR Menu

A premium menu builder. Admin signs in, designs a menu visually (drag and drop categories and items, drop in images), generates a QR code, and shares it with diners. Diners scan and land on a public menu page.

Stack: **Next.js 14 (App Router) + Supabase (Auth + Postgres + Storage) + Tailwind CSS + dnd-kit**.

---

## Go-live checklist

You need **3 things**: a Supabase project (free), a host for the Next.js app (Vercel free), and an admin user.

### 1. Create the Supabase project

1. Sign up at https://supabase.com and create a new project. Pick any region close to your diners. Note the database password — you won't need it day-to-day but Supabase asks.
2. Open **Settings → API**. Copy:
   - **Project URL** → goes into `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → goes into `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Run the database schema

Open the Supabase **SQL editor**, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates `menus`, `categories`, `products` tables with row-level security so:

- The public can **read** menus (so QR scans work without login)
- Only **authenticated users** can write (so only you can edit)

### 3. Create the image storage bucket

In **Storage**, click *New bucket*. Name it **`product-images`** and mark it **Public** (so image URLs load on the public menu page).

Then in **Storage → Policies**, run the four policies from the commented section at the bottom of [`supabase/schema.sql`](./supabase/schema.sql). These give the public read access and authenticated users upload/update/delete.

### 4. Create your admin user

In **Authentication → Users**, click *Add user → Create new user*. The login form on this site asks for a **username + password**, and maps the username to `<username>@menu.local` internally — so create the user with that exact email pattern.

For the credentials we agreed on:

- **Email:** `ahmed123@menu.local`
- **Password:** `admin123123`
- Check **Auto Confirm User** so it skips email verification.

Then on the live site sign in with **username `ahmed123`** and **password `admin123123`**.

You can add more admins the same way (any `<name>@menu.local` works). **There is no public signup** — this is the only way to create an admin account, which is intentional.

### 5. Configure local env vars

```
cp .env.local.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`NEXT_PUBLIC_SITE_URL` is the base URL the QR code encodes. Use `http://localhost:3000` for local testing, and your deployed URL in production.

### 6. Run locally

```
npm install
npm run dev
```

Open http://localhost:3000, click *Open admin*, sign in with the user you created.

---

## Deploy to production

The easiest host is **Vercel** (free for personal projects, made by the Next.js team).

1. Push this folder to a new GitHub repo.
2. Go to https://vercel.com → *New Project* → import your repo. Defaults are fine.
3. In **Settings → Environment Variables**, add the same three keys as `.env.local`, but set `NEXT_PUBLIC_SITE_URL` to the production URL Vercel gives you (e.g. `https://your-app.vercel.app`).
4. Trigger a redeploy after adding env vars.
5. **Optional**: in Vercel → Settings → Domains, attach a custom domain. Update `NEXT_PUBLIC_SITE_URL` to match so QR codes encode the pretty URL.

### One Supabase tweak for production auth

In Supabase → **Authentication → URL Configuration**:
- **Site URL** → your production URL
- **Redirect URLs** → add your production URL (and `http://localhost:3000` if you still develop locally)

That's it. Print or share the QR code from the **QR Code** tab inside the editor.

---

## How it works at a glance

- **`/`** — public landing → "Open admin"
- **`/login`** — Supabase email/password sign-in
- **`/admin`** — dashboard listing your menus, "Create menu"
- **`/admin/new`** — create a menu (name + slug)
- **`/admin/menus/[id]`** — the three-pane editor (left rail tabs, canvas, inspector). The QR tab inside the editor generates the code and download links.
- **`/menu/[slug]`** — the public menu page. This is the URL the QR encodes.

## Tech notes

- Row Level Security is on for every table. The anon key in the browser can only read menus and write nothing — writes require a signed-in user.
- Image uploads go to the Supabase `product-images` bucket; URLs are saved on the product row.
- The editor uses optimistic local updates; writes are debounced for text fields and immediate for structural changes (add/delete/reorder).
- Reorder uses `@dnd-kit` (pointer + touch sensors). On mobile, long-press to drag.
- The public menu page is revalidated every 30 seconds; edits show up shortly after saving.

## Costs

- Supabase free tier: 500 MB DB, 1 GB storage, 50k monthly active users. Comfortably enough for a single restaurant.
- Vercel free tier (Hobby): 100 GB bandwidth, unlimited static requests. More than enough for menu traffic.
- Total: **$0/month** until you outgrow free tiers.
