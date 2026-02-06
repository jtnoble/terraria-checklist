# Terraria Checklist
A simple to-do list with a terraria theme

## Setup
- Clone repository
- `npm install`
- Add `.env.local` file to your main directory
  - `NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY`
- Set up your Supabase database (Read "Supabase Setup")
- `npm run dev`

## Supabase Setup
Run the following in the SQL editor:
```
create extension if not exists "uuid-ossp";


create table boards (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    password_hash text not null,
    created_at timestamp with time zone default now()
);


create table checklists (
    id uuid primary key default uuid_generate_v4(),
    board_id uuid references boards(id) on delete cascade,
    name text not null,
    created_at timestamp with time zone default now()
);


create table categories (
    id uuid primary key default uuid_generate_v4(),
    checklist_id uuid references checklists(id) on delete cascade,
    name text not null,
    sort_order int default 0
);


create table items (
    id uuid primary key default uuid_generate_v4(),
    category_id uuid references categories(id) on delete cascade,
    label text not null,
    completed boolean default false,
    sort_order int default 0
);


create index idx_categories_checklist on categories(checklist_id);
create index idx_items_category on items(category_id);


alter table boards enable row level security;
alter table checklists enable row level security;
alter table categories enable row level security;
alter table items enable row level security;


create policy "Allow all" on boards
  for all
  using (true);

create policy "Allow all" on checklists
  for all
  using (true);

create policy "Allow all" on categories
  for all
  using (true);

create policy "Allow all" on items
  for all
  using (true);

```

## Default Information

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
