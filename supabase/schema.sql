-- QR Menu schema. Run this in the Supabase SQL editor for a fresh project.

create extension if not exists "pgcrypto";

create table if not exists public.menus (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  name_ar text,
  subtitle text,
  subtitle_ar text,
  cover_image_url text,
  background_image_url text,
  layout_style text default 'cards',         -- 'list' | 'cards' | 'gallery'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.menus(id) on delete cascade,
  name text not null,
  name_ar text,
  sort_order int not null default 0,
  created_at timestamptz default now()
);
create index if not exists categories_menu_idx on public.categories(menu_id);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  name_ar text,
  description text,
  description_ar text,
  price numeric(10,2) not null default 0,        -- USD
  price_lbp numeric(14,2),                       -- Lebanese Lira (optional)
  image_url text,
  sort_order int not null default 0,
  available boolean not null default true,
  created_at timestamptz default now()
);
create index if not exists products_category_idx on public.products(category_id);

-- Row level security: public can read, only authenticated users can write.
alter table public.menus enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;

create policy "public read menus"      on public.menus      for select using (true);
create policy "public read categories" on public.categories for select using (true);
create policy "public read products"   on public.products   for select using (true);

create policy "auth write menus"      on public.menus      for all to authenticated using (true) with check (true);
create policy "auth write categories" on public.categories for all to authenticated using (true) with check (true);
create policy "auth write products"   on public.products   for all to authenticated using (true) with check (true);

-- Storage bucket for product images. Run once.
-- In the Supabase dashboard: Storage -> create bucket "product-images" -> Public.
-- Then add this policy so authenticated users can upload, public can read:
--
-- create policy "public read product-images"
--   on storage.objects for select using (bucket_id = 'product-images');
-- create policy "auth upload product-images"
--   on storage.objects for insert to authenticated
--   with check (bucket_id = 'product-images');
-- create policy "auth update product-images"
--   on storage.objects for update to authenticated
--   using (bucket_id = 'product-images');
-- create policy "auth delete product-images"
--   on storage.objects for delete to authenticated
--   using (bucket_id = 'product-images');

-- If you have an existing database created from an older schema, run these once:
-- alter table public.menus      add column if not exists name_ar text;
-- alter table public.menus      add column if not exists subtitle_ar text;
-- alter table public.categories add column if not exists name_ar text;
-- alter table public.products   add column if not exists name_ar text;
-- alter table public.products   add column if not exists description_ar text;
-- alter table public.products   add column if not exists price_lbp numeric(14,2);
-- alter table public.menus      add column if not exists background_image_url text;
-- alter table public.menus      add column if not exists layout_style text default 'list';
