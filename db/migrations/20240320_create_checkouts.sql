create type checkout_status as enum ('pending', 'completed', 'cancelled', 'failed');

create table checkouts (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts(id),
  merchant_reference_id text not null,
  checkout_id text not null,
  status checkout_status not null default 'pending',
  amount numeric(10,2) not null,
  email text not null,
  first_name text not null,
  last_name text not null,
  kennitala text not null,
  address text not null,
  apartment text,
  city text not null,
  save_info boolean not null default false,
  marketing_opt_in boolean not null default false,
  metadata jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
); 