-- Countries table
create table public.countries (
  id serial primary key,
  name text unique not null,
  code text unique not null
);

-- Categories table
create table public.categories (
  id serial primary key,
  name text unique not null,
  slug text unique not null
);

-- Enable RLS
alter table public.countries enable row level security;
alter table public.categories enable row level security;

-- Anyone can view countries and categories
create policy "Countries are viewable by everyone"
  on public.countries for select
  using (true);

create policy "Categories are viewable by everyone"
  on public.categories for select
  using (true);

-- Seed predefined categories
insert into public.categories (name, slug) values
  ('Food', 'food'),
  ('Budget', 'budget'),
  ('Accommodation', 'accommodation'),
  ('Nightlife', 'nightlife'),
  ('Nature', 'nature'),
  ('Culture', 'culture'),
  ('Transport', 'transport'),
  ('Safety', 'safety'),
  ('General', 'general');

-- Seed some countries
insert into public.countries (name, code) values
  ('Croatia', 'HR'),
  ('Italy', 'IT'),
  ('Spain', 'ES'),
  ('France', 'FR'),
  ('Germany', 'DE'),
  ('Greece', 'GR'),
  ('Turkey', 'TR'),
  ('Japan', 'JP'),
  ('Thailand', 'TH'),
  ('United States', 'US'),
  ('United Kingdom', 'GB'),
  ('Portugal', 'PT'),
  ('Austria', 'AT'),
  ('Czech Republic', 'CZ'),
  ('Hungary', 'HU'),
  ('Montenegro', 'ME'),
  ('Slovenia', 'SI'),
  ('Bosnia and Herzegovina', 'BA'),
  ('Serbia', 'RS'),
  ('Netherlands', 'NL');
