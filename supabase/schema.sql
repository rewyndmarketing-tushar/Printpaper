-- ═══════════════════════════════════════════════════════════
--  PaperLink — Supabase Schema
--  Run this entire file in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ── 1. Profiles (extends Supabase auth.users) ──────────────
create table if not exists profiles (
  id        uuid primary key references auth.users(id) on delete cascade,
  email     text not null,
  name      text not null,
  role      text not null check (role in ('admin', 'purchaser', 'supplier')),
  created_at timestamptz default now()
);

-- ── 2. Enquiries (posted by purchasers) ────────────────────
create table if not exists enquiries (
  id           bigserial primary key,
  purchaser_id uuid references profiles(id) on delete cascade,
  paper_type   text not null,
  gsm          text not null,
  coating      text not null,
  shade        text not null,
  quantity     integer not null,
  unit         text not null default 'sheets',
  notes        text,
  status       text not null default 'open'
               check (status in ('open', 'responded', 'quoted', 'closed')),
  created_at   timestamptz default now()
);

-- ── 3. Supplier Responses (private — only admin sees all) ──
create table if not exists supplier_responses (
  id           bigserial primary key,
  enquiry_id   bigint references enquiries(id) on delete cascade,
  supplier_id  uuid references profiles(id) on delete cascade,
  price_per_kg numeric(10,2) not null,
  location     text not null,
  note         text,
  created_at   timestamptz default now(),
  unique (enquiry_id, supplier_id)   -- one response per supplier per enquiry
);

-- ── 4. Quotes (admin → purchaser, markup applied) ──────────
create table if not exists quotes (
  id                   bigserial primary key,
  enquiry_id           bigint references enquiries(id) on delete cascade,
  purchaser_id         uuid references profiles(id),
  supplier_response_id bigint references supplier_responses(id),
  supplier_price       numeric(10,2) not null,   -- what supplier quoted (hidden from buyer)
  quoted_price         numeric(10,2) not null,   -- what buyer sees (marked up)
  message              text,
  created_at           timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════
--  Row Level Security (RLS)
-- ═══════════════════════════════════════════════════════════

alter table profiles           enable row level security;
alter table enquiries          enable row level security;
alter table supplier_responses enable row level security;
alter table quotes             enable row level security;

-- Helper: get current user's role
create or replace function current_role_is(r text)
returns boolean language sql security definer as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = r
  );
$$;

-- ── profiles ────────────────────────────────────────────────
-- Users can read their own profile; admin can read all
create policy "profiles: read own" on profiles
  for select using (id = auth.uid() or current_role_is('admin'));

create policy "profiles: insert own on signup" on profiles
  for insert with check (id = auth.uid());

create policy "profiles: update own" on profiles
  for update using (id = auth.uid());

-- ── enquiries ───────────────────────────────────────────────
-- Purchaser: sees only their own
create policy "enquiries: purchaser reads own" on enquiries
  for select using (
    purchaser_id = auth.uid()
    or current_role_is('admin')
    or current_role_is('supplier')
  );

create policy "enquiries: purchaser inserts" on enquiries
  for insert with check (
    purchaser_id = auth.uid() and current_role_is('purchaser')
  );

create policy "enquiries: admin updates status" on enquiries
  for update using (current_role_is('admin'));

-- ── supplier_responses ──────────────────────────────────────
-- Supplier: sees only their own responses
-- Admin: sees all
create policy "responses: supplier reads own" on supplier_responses
  for select using (
    supplier_id = auth.uid()
    or current_role_is('admin')
  );

create policy "responses: supplier inserts" on supplier_responses
  for insert with check (
    supplier_id = auth.uid() and current_role_is('supplier')
  );

-- ── quotes ──────────────────────────────────────────────────
-- Purchaser: sees only quotes addressed to them
-- Admin: sees all; supplier: sees nothing
create policy "quotes: purchaser reads own" on quotes
  for select using (
    purchaser_id = auth.uid()
    or current_role_is('admin')
  );

create policy "quotes: admin inserts" on quotes
  for insert with check (current_role_is('admin'));

-- ═══════════════════════════════════════════════════════════
--  Realtime (enable for live updates without refresh)
-- ═══════════════════════════════════════════════════════════
alter publication supabase_realtime add table enquiries;
alter publication supabase_realtime add table supplier_responses;
alter publication supabase_realtime add table quotes;
