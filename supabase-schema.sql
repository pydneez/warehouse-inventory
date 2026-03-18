-- ============================================================
-- WAREHOUSEIQ — Supabase Schema + Seed Data
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Items table
create table if not exists public.items (
  id         uuid primary key default gen_random_uuid(),
  item_code  text not null unique,
  name       text not null,
  quantity   integer not null default 100,
  created_at timestamptz default now()
);

-- 2. Withdrawal logs table
create table if not exists public.withdrawal_logs (
  id           uuid primary key default gen_random_uuid(),
  item_id      uuid references public.items(id) on delete cascade,
  quantity     integer not null,
  user_id      uuid references auth.users(id) on delete set null,
  user_email   text not null,
  withdrawn_at timestamptz default now()
);

-- 3. Enable Row Level Security
alter table public.items           enable row level security;
alter table public.withdrawal_logs enable row level security;

-- 4. RLS Policies — any authenticated user can read items
create policy "Authenticated users can read items"
  on public.items for select
  using (auth.role() = 'authenticated');

-- Only admin can insert/update items
create policy "Admin can insert items"
  on public.items for insert
  with check (auth.jwt() ->> 'email' = 'admin@warehouse.com');

create policy "Admin can update items"
  on public.items for update
  using (auth.jwt() ->> 'email' = 'admin@warehouse.com');

-- Any authenticated user can update quantity (for withdrawals)
-- Use a function-based approach instead:
drop policy if exists "Admin can update items" on public.items;
create policy "Authenticated users can update item quantity"
  on public.items for update
  using (auth.role() = 'authenticated');

-- Authenticated users can insert withdrawal logs
create policy "Authenticated users can log withdrawals"
  on public.withdrawal_logs for insert
  with check (auth.role() = 'authenticated');

-- Any authenticated user can read logs (admin reads all, optional)
create policy "Authenticated users can read logs"
  on public.withdrawal_logs for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- 5. Seed — 20 item types, each starting at 100 units
-- ============================================================
insert into public.items (item_code, name, quantity) values
  ('WH-001', 'Safety Helmets',            100),
  ('WH-002', 'High-Vis Vests',            100),
  ('WH-003', 'Steel-Toe Boots (Size 42)', 100),
  ('WH-004', 'Work Gloves',               100),
  ('WH-005', 'Packing Tape Rolls',        100),
  ('WH-006', 'Cardboard Boxes (Large)',   100),
  ('WH-007', 'Cardboard Boxes (Small)',   100),
  ('WH-008', 'Bubble Wrap Rolls',         100),
  ('WH-009', 'Pallet Wrap Stretch Film',  100),
  ('WH-010', 'Wooden Pallets',            100),
  ('WH-011', 'Forklift Propane Tanks',    100),
  ('WH-012', 'Hand Trucks / Dollies',     100),
  ('WH-013', 'Hydraulic Pallet Jacks',    100),
  ('WH-014', 'Cable Ties (Pack of 100)',  100),
  ('WH-015', 'Shelf Dividers',            100),
  ('WH-016', 'Barcode Label Rolls',       100),
  ('WH-017', 'Fire Extinguishers',        100),
  ('WH-018', 'First Aid Kits',            100),
  ('WH-019', 'Cleaning Mop Sets',         100),
  ('WH-020', 'Industrial Trash Bags',     100),
  ('WH-021', 'LED Work Lights',           100),
  ('WH-022', 'Extension Cord Reels',      100),
  ('WH-023', 'Power Drills',              100),
  ('WH-024', 'Zip-Lock Storage Bags',     100)
on conflict (item_code) do nothing;
