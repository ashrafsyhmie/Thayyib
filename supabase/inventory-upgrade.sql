-- Adds inventory tracking tables and demo inventory rows to an existing Thayyib Supabase project.
-- Run after supabase/schema.sql if your project was created before inventory existed.

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  document_id uuid references public.documents(id) on delete set null,
  ingredient_risk_id uuid references public.ingredient_risks(id) on delete set null,
  name text not null,
  category text not null,
  batch_number text not null,
  quantity numeric(12,2) not null default 0 check (quantity >= 0),
  unit text not null,
  received_date date,
  expiry_date date,
  halal_status public.document_status not null default 'needs_review',
  risk_level public.halal_risk_level not null default 'unknown',
  storage_location text,
  notes text,
  is_sample_data boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inventory_items_company_batch_name_key unique (company_id, batch_number, name)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.inventory_items'::regclass
      and contype = 'u'
      and pg_get_constraintdef(oid) = 'UNIQUE (company_id, batch_number, name)'
  ) then
    alter table public.inventory_items
      add constraint inventory_items_company_batch_name_key
      unique (company_id, batch_number, name);
  end if;
exception
  when duplicate_object then null;
end;
$$;

create index if not exists inventory_items_company_id_idx on public.inventory_items(company_id);
create index if not exists inventory_items_supplier_id_idx on public.inventory_items(supplier_id);
create index if not exists inventory_items_document_id_idx on public.inventory_items(document_id);
create index if not exists inventory_items_ingredient_risk_id_idx on public.inventory_items(ingredient_risk_id);
create index if not exists inventory_items_halal_status_idx on public.inventory_items(halal_status);
create index if not exists inventory_items_risk_level_idx on public.inventory_items(risk_level);

drop trigger if exists inventory_items_set_updated_at on public.inventory_items;
create trigger inventory_items_set_updated_at
before update on public.inventory_items
for each row execute function public.set_updated_at();

alter table public.inventory_items enable row level security;

drop policy if exists "members can read inventory items" on public.inventory_items;
create policy "members can read inventory items"
on public.inventory_items for select
to authenticated
using (company_id in (select public.current_user_company_ids()));

drop policy if exists "members can insert inventory items" on public.inventory_items;
create policy "members can insert inventory items"
on public.inventory_items for insert
to authenticated
with check (company_id in (select public.current_user_company_ids()));

drop policy if exists "members can update inventory items" on public.inventory_items;
create policy "members can update inventory items"
on public.inventory_items for update
to authenticated
using (company_id in (select public.current_user_company_ids()))
with check (company_id in (select public.current_user_company_ids()));

drop policy if exists "members can delete inventory items" on public.inventory_items;
create policy "members can delete inventory items"
on public.inventory_items for delete
to authenticated
using (company_id in (select public.current_user_company_ids()));

grant select, insert, update, delete on public.inventory_items to authenticated;

create or replace function public.seed_demo_inventory_data(target_company_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  global_meats_id uuid;
  eastern_spices_id uuid;
  prime_ingredients_id uuid;
  pure_extracts_id uuid;
  global_certificate_id uuid;
  traceability_log_id uuid;
  prime_certificate_id uuid;
  gelatin_id uuid;
  e471_id uuid;
  vinegar_id uuid;
  vanilla_extract_id uuid;
begin
  if auth.uid() is not null and not exists (
    select 1
    from public.company_members
    where company_id = target_company_id
      and user_id = auth.uid()
  ) then
    raise exception 'Not authorized to seed this workspace';
  end if;

  select id into global_meats_id
  from public.suppliers
  where company_id = target_company_id and name = 'Global Meats Inc.'
  limit 1;

  select id into eastern_spices_id
  from public.suppliers
  where company_id = target_company_id and name = 'Eastern Spices Co.'
  limit 1;

  select id into prime_ingredients_id
  from public.suppliers
  where company_id = target_company_id and name = 'Prime Ingredients'
  limit 1;

  select id into pure_extracts_id
  from public.suppliers
  where company_id = target_company_id and name = 'Pure Extracts Ltd.'
  limit 1;

  select id into global_certificate_id
  from public.documents
  where company_id = target_company_id and name = 'Global Meats Halal Certificate'
  limit 1;

  select id into traceability_log_id
  from public.documents
  where company_id = target_company_id and name = 'Ingredient Traceability Log - Batch A124'
  limit 1;

  select id into prime_certificate_id
  from public.documents
  where company_id = target_company_id and name = 'Prime Ingredients Certificate'
  limit 1;

  select id into gelatin_id from public.ingredient_risks where name = 'Gelatin' limit 1;
  select id into e471_id from public.ingredient_risks where name = 'Mono- and diglycerides of fatty acids' limit 1;
  select id into vinegar_id from public.ingredient_risks where name = 'Vinegar' limit 1;
  select id into vanilla_extract_id from public.ingredient_risks where name = 'Vanilla extract' limit 1;

  insert into public.inventory_items (
    company_id,
    supplier_id,
    document_id,
    ingredient_risk_id,
    name,
    category,
    batch_number,
    quantity,
    unit,
    received_date,
    expiry_date,
    halal_status,
    risk_level,
    storage_location,
    notes
  )
  select
    target_company_id,
    supplier_id,
    document_id,
    ingredient_risk_id,
    item_name,
    category,
    batch_number,
    quantity,
    unit,
    received_date::date,
    expiry_date::date,
    halal_status::public.document_status,
    risk_level::public.halal_risk_level,
    storage_location,
    notes
  from (
    values
      (global_meats_id, global_certificate_id, null, 'Chicken Filling', 'Protein', 'CHK-2026-0701-A', 125.00, 'kg', '2026-06-25', '2026-08-25', 'valid', 'low', 'Cold Room A', 'Linked to Global Meats certificate. Keep batch receiving record for audit.'),
      (eastern_spices_id, traceability_log_id, vinegar_id, 'Food Vinegar', 'Acidulant', 'VIN-2026-0619-B', 48.00, 'L', '2026-06-19', '2027-06-19', 'complete', 'low', 'Dry Store 2', 'Low risk sample item with traceability evidence.'),
      (prime_ingredients_id, prime_certificate_id, e471_id, 'Emulsifier E471', 'Additive', 'E471-2026-0530-C', 18.50, 'kg', '2026-05-30', '2027-05-30', 'expired', 'medium', 'Dry Store 3', 'Supplier certificate is expired. Request updated source declaration before use.'),
      (pure_extracts_id, traceability_log_id, vanilla_extract_id, 'Vanilla Extract', 'Flavoring', 'VAN-2026-0621-D', 12.00, 'L', '2026-06-21', '2027-01-21', 'needs_review', 'medium', 'Flavour Cabinet', 'Check alcohol carrier and supplier certificate before production release.'),
      (prime_ingredients_id, prime_certificate_id, gelatin_id, 'Gelatin Powder', 'Gelling Agent', 'GEL-2026-0528-E', 9.00, 'kg', '2026-05-28', '2027-05-28', 'missing_document', 'high', 'Quarantine Shelf', 'High risk sample item. Do not rely on it without qualified halal review.')
  ) as seed_data (
    supplier_id,
    document_id,
    ingredient_risk_id,
    item_name,
    category,
    batch_number,
    quantity,
    unit,
    received_date,
    expiry_date,
    halal_status,
    risk_level,
    storage_location,
    notes
  )
  where not exists (
    select 1
    from public.inventory_items
    where company_id = target_company_id
      and batch_number = seed_data.batch_number
      and name = seed_data.item_name
  );
end;
$$;

revoke all on function public.seed_demo_inventory_data(uuid) from public;
revoke all on function public.seed_demo_inventory_data(uuid) from anon;
revoke all on function public.seed_demo_inventory_data(uuid) from authenticated;

do $$
declare
  workspace record;
begin
  for workspace in select id from public.companies loop
    perform public.seed_demo_inventory_data(workspace.id);
  end loop;
end;
$$;
