# A Lot Happened Here

A scrapbook-style memory space made for six university friends.

## Run locally

```sh
npm install
npm run dev
```

Vite prints a local preview URL. Member cards use the same page with a query value, for example `/?member=manar`, `/?member=mostafa`, `/?member=tasneem`, `/?member=ali`, `/?member=malak`, or `/?member=mohamed`.

## Build for production

```sh
npm run build
npm run preview
```

The generated site is in `dist/`. It can be deployed as a Vite project on Vercel with the default build command `npm run build` and output directory `dist`.

## Replace illustrated placeholders

Sample content and the six member records live in `src/data/content.js`. Artwork is drawn in CSS in `PhotoArt` in `src/App.jsx`; replace the illustration with an `<img>` or `<video>` when the real media is ready. Put local media in `public/media/` and use paths such as `/media/cafeteria.jpg`. Keep the `FICTIONAL` / `PLACEHOLDER` labels until sample items have been replaced with real memories.

## Personal QR links

After the final HTTPS domain is verified, create six QR codes pointing to `https://YOUR-VERIFIED-DOMAIN/?member=<id>` for the member IDs above. Do not print QR codes until the final domain is known and tested.

## Add a memory (Supabase setup required)

The form and Supabase upload code are prepared. It stays in setup mode until a Supabase project is connected.

1. Create a Supabase project.
2. In its SQL Editor, run `supabase/setup.sql`. This creates the memory table, a public media bucket capped at 25 MB, and policies that allow reading and adding but not deleting.
3. Copy `.env.example` to `.env.local`; fill in the Supabase Project URL and publishable key. Never use a service-role key in the website.
4. Add the same two `VITE_SUPABASE_*` values to the Vercel project’s environment variables, then redeploy.

The upload form accepts JPG, PNG, WebP, MP4, WebM, and MOV files, validates the type and 25 MB size in the browser, and the Storage bucket enforces the allowed types and size as well. A small honeypot provides basic spam filtering; a CAPTCHA or server-side rate limit can be added before wide public sharing.

**Privacy:** the media bucket is public so visitors can see shared memories. Anyone with the site link can read the archive, and the anonymous upload policy also means anyone with that link can submit a memory. Tell contributors before they upload. No public delete policy is created.

## Current project status

The responsive frontend and archive are implemented. Supabase persistence is prepared but awaits project credentials and SQL setup. The production URL, Vercel deployment, and final QR codes await publishing and URL verification.
