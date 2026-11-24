-- Run this in the Supabase SQL Editor for the project.
-- Anyone with the site can read and add memories. No public delete policy is created.

create extension if not exists pgcrypto;

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  caption text not null check (char_length(trim(caption)) between 1 and 500),
  memory_date date,
  category text not null check (category in ('university life', 'projects', 'plot twists')),
  media_path text not null check (media_path ~ '^[0-9]{4}/[A-Za-z0-9-]+\.(jpg|jpeg|png|webp|mp4|webm|mov)$'),
  media_type text not null check (media_type in ('photo', 'video')),
  created_at timestamptz not null default now()
);

alter table public.memories enable row level security;

drop policy if exists "Public can read memories" on public.memories;
create policy "Public can read memories" on public.memories
  for select to anon, authenticated using (true);

drop policy if exists "Public can add memories" on public.memories;
create policy "Public can add memories" on public.memories
  for insert to anon, authenticated with check (
    char_length(trim(caption)) between 1 and 500
    and category in ('university life', 'projects', 'plot twists')
    and media_type in ('photo', 'video')
    and ((media_type = 'photo' and media_path ~* '\.(jpg|jpeg|png|webp)$')
      or (media_type = 'video' and media_path ~* '\.(mp4|webm|mov)$'))
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memory-uploads', 'memory-uploads', true, 26214400,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can upload memories" on storage.objects;
create policy "Public can upload memories" on storage.objects
  for insert to anon, authenticated with check (
    bucket_id = 'memory-uploads'
    and name ~ '^[0-9]{4}/[A-Za-z0-9-]+\.(jpg|jpeg|png|webp|mp4|webm|mov)$'
  );
