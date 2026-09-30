create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),
    name text not null
);

create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    price numeric not null default 0,
    category uuid references public.categories(id) on delete set null,
    image_url text
);

create table if not exists public.transactions (
    id uuid primary key default gen_random_uuid(),
    items jsonb not null default '[]'::jsonb,
    total numeric not null default 0,
    cash numeric not null default 0,
    change numeric not null default 0,
    cashier text,
    created_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists transactions_created_at_idx on public.transactions (created_at desc);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "categories_select" on public.categories;
create policy "categories_select"
on public.categories for select
to anon, authenticated
using (true);

drop policy if exists "categories_insert" on public.categories;
create policy "categories_insert"
on public.categories for insert
to authenticated
with check (true);

drop policy if exists "categories_update" on public.categories;
create policy "categories_update"
on public.categories for update
to authenticated
using (true)
with check (true);

drop policy if exists "categories_delete" on public.categories;
create policy "categories_delete"
on public.categories for delete
to authenticated
using (true);

drop policy if exists "products_select" on public.products;
create policy "products_select"
on public.products for select
to anon, authenticated
using (true);

drop policy if exists "products_insert" on public.products;
create policy "products_insert"
on public.products for insert
to authenticated
with check (true);

drop policy if exists "products_update" on public.products;
create policy "products_update"
on public.products for update
to authenticated
using (true)
with check (true);

drop policy if exists "products_delete" on public.products;
create policy "products_delete"
on public.products for delete
to authenticated
using (true);

drop policy if exists "transactions_select" on public.transactions;
create policy "transactions_select"
on public.transactions for select
to authenticated
using (true);

drop policy if exists "transactions_insert" on public.transactions;
create policy "transactions_insert"
on public.transactions for insert
to authenticated
with check (true);

drop policy if exists "transactions_update" on public.transactions;
create policy "transactions_update"
on public.transactions for update
to authenticated
using (true)
with check (true);

drop policy if exists "transactions_delete" on public.transactions;
create policy "transactions_delete"
on public.transactions for delete
to authenticated
using (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.categories to anon, authenticated;
grant select, insert, update, delete on public.products to anon, authenticated;
grant select, insert, update, delete on public.transactions to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_read" on storage.objects;
create policy "product_images_read"
on storage.objects for select
to public
using (bucket_id = 'product-images');

drop policy if exists "product_images_insert" on storage.objects;
create policy "product_images_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images');

drop policy if exists "product_images_update" on storage.objects;
create policy "product_images_update"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');

drop policy if exists "product_images_delete" on storage.objects;
create policy "product_images_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images');
