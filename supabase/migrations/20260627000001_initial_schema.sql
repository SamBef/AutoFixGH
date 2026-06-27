-- AutoFix GH — Initial Schema
-- Phase 1: vehicle owners, vehicles, garages, jobs, SOS dispatches

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ─────────────────────────────────────────
create table public.profiles (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  phone     text unique not null,
  full_name text not null,
  role      text not null check (role in ('owner', 'mechanic', 'technician', 'admin')),
  avatar_url text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- VEHICLES
-- ─────────────────────────────────────────
create table public.vehicles (
  vehicle_id         uuid primary key default gen_random_uuid(),
  owner_id           uuid not null references public.profiles(user_id) on delete cascade,
  registration_plate text not null,
  vin                text unique,
  make               text not null,
  model              text not null,
  year               integer not null check (year >= 1960 and year <= extract(year from now()) + 1),
  color              text,
  created_at         timestamptz default now() not null,
  updated_at         timestamptz default now() not null
);

create index on public.vehicles(owner_id);
create index on public.vehicles(registration_plate);
create index on public.vehicles(vin) where vin is not null;

alter table public.vehicles enable row level security;

create policy "Owners can manage their vehicles"
  on public.vehicles for all
  using (auth.uid() = owner_id);

-- ─────────────────────────────────────────
-- GARAGES
-- ─────────────────────────────────────────
create table public.garages (
  garage_id    uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.profiles(user_id) on delete cascade,
  name         text not null,
  address      text not null,
  latitude     double precision,
  longitude    double precision,
  phone        text,
  is_active    boolean default true not null,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

create index on public.garages(owner_id);
create index on public.garages(is_active);

alter table public.garages enable row level security;

create policy "Anyone can read active garages"
  on public.garages for select
  using (is_active = true);

create policy "Garage owners can manage their garage"
  on public.garages for all
  using (auth.uid() = owner_id);

-- ─────────────────────────────────────────
-- JOBS (repair bookings — self-pay or insurance)
-- Every job MUST reference a vehicle_id — this seeds Vehicle Health Score
-- ─────────────────────────────────────────
create table public.jobs (
  job_id      uuid primary key default gen_random_uuid(),
  vehicle_id  uuid not null references public.vehicles(vehicle_id) on delete restrict,
  garage_id   uuid not null references public.garages(garage_id) on delete restrict,
  owner_id    uuid not null references public.profiles(user_id) on delete restrict,
  type        text not null check (type in ('self_pay', 'insurance')),
  status      text not null default 'PENDING' check (status in ('PENDING','ACCEPTED','IN_PROGRESS','COMPLETED','CANCELLED')),
  description text not null,
  amount      numeric(10, 2),
  currency    text not null default 'GHS',
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create index on public.jobs(vehicle_id);
create index on public.jobs(owner_id);
create index on public.jobs(garage_id);
create index on public.jobs(status);

alter table public.jobs enable row level security;

create policy "Owners can read and create their jobs"
  on public.jobs for select
  using (auth.uid() = owner_id);

create policy "Owners can insert jobs"
  on public.jobs for insert
  with check (auth.uid() = owner_id);

create policy "Garages can read jobs assigned to them"
  on public.jobs for select
  using (
    garage_id in (
      select garage_id from public.garages where owner_id = auth.uid()
    )
  );

create policy "Garages can update job status"
  on public.jobs for update
  using (
    garage_id in (
      select garage_id from public.garages where owner_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- SOS DISPATCHES
-- Every dispatch MUST reference a vehicle_id
-- ─────────────────────────────────────────
create table public.sos_dispatches (
  dispatch_id    uuid primary key default gen_random_uuid(),
  vehicle_id     uuid not null references public.vehicles(vehicle_id) on delete restrict,
  owner_id       uuid not null references public.profiles(user_id) on delete restrict,
  technician_id  uuid references public.profiles(user_id),
  status         text not null default 'REQUESTED' check (status in ('REQUESTED','DISPATCHED','EN_ROUTE','ARRIVED','RESOLVED','CANCELLED')),
  latitude       double precision not null,
  longitude      double precision not null,
  description    text,
  created_at     timestamptz default now() not null,
  updated_at     timestamptz default now() not null
);

create index on public.sos_dispatches(vehicle_id);
create index on public.sos_dispatches(owner_id);
create index on public.sos_dispatches(technician_id);
create index on public.sos_dispatches(status);

alter table public.sos_dispatches enable row level security;

create policy "Owners can manage their SOS dispatches"
  on public.sos_dispatches for all
  using (auth.uid() = owner_id);

create policy "Technicians can read and update dispatches assigned to them"
  on public.sos_dispatches for select
  using (auth.uid() = technician_id);

create policy "Technicians can update dispatches assigned to them"
  on public.sos_dispatches for update
  using (auth.uid() = technician_id);

-- ─────────────────────────────────────────
-- SUBSCRIPTIONS
-- ─────────────────────────────────────────
create table public.subscriptions (
  subscription_id uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references public.profiles(user_id) on delete cascade,
  plan            text not null check (plan in ('basic', 'standard', 'premium')),
  status          text not null default 'active' check (status in ('active', 'cancelled', 'expired')),
  amount_ghs      numeric(10, 2) not null,
  paystack_ref    text unique,
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  created_at      timestamptz default now() not null
);

create index on public.subscriptions(owner_id);
create index on public.subscriptions(status);

alter table public.subscriptions enable row level security;

create policy "Owners can read their subscriptions"
  on public.subscriptions for select
  using (auth.uid() = owner_id);
