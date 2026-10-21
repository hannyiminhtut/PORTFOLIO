# Activate private portfolio editing

The frontend has been connected to your Supabase project. Database tables and the owner account still need the following one-time setup.

1. In Supabase open **SQL Editor → New query**. Paste the entire contents of `supabase/setup.sql` and click **Run**. Run this setup script once (its policies intentionally do not overwrite existing policies).
2. Open **Authentication → Users → Add user → Create new user**. Create your own admin email/password account; keep the password private. Confirm the email using the dashboard's confirmation option if provided. Do not send the password to anyone.
3. Copy the new user's **User UID**. In a new SQL Editor query run the following after replacing the placeholder:

```sql
insert into public.portfolio_admins(user_id)
values ('PASTE-YOUR-USER-UID-HERE'::uuid)
on conflict do nothing;
```

4. In Authentication's sign-up settings, disable new user registrations. The portfolio does not provide a registration form. Even another signed-in account has no editing permission unless explicitly added to `portfolio_admins`.
5. Open `http://127.0.0.1:5173/admin` and sign in with the account from step 2.
6. Your current portfolio is prefilled. Click **Save draft**, preview it, then **Publish** to initialize permanent content. Your public page continues to show the bundled original until you publish the first version.

## Regular editing

- Text: edit existing labels and paragraphs; clear a value to remove its text.
- Links: update public contact and social URLs. Use `mailto:` for email links.
- Projects, skills, focus cards, education, certificates, gallery: add, edit, delete, and reorder items. Skills have an editable list of names. Known technology names get their logos automatically.
- Images: replace an existing photo slot, upload library photos, or remove a photo. Use **Copy photo URL** to fill a project `image` field or a gallery source. Blank project images retain the existing artwork.
- Save draft preserves edits privately. Publish makes the saved content visible on refreshed public pages without rebuilding the site.
- Uploaded photo files are public by URL. Use them only for photos intended for your portfolio. Draft text is private. The library only offers file deletion after a photo is removed from the current draft and published content.
- Publication history is retained in `portfolio_history` for recovery by the owner through Supabase.

## Hosting on Vercel

Use the `han-portfolio` directory as the project root. Set build command `npm run build` and output directory `dist`. Configure these Environment Variables using the same project values as `.env.local`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

`vercel.json` routes `/admin` to React. Never use a Supabase secret/service-role key in a `VITE_` variable. The publishable key identifies the project; database and storage policies enforce owner permissions.

## Verification after setup

- Anonymous visitor: portfolio opens; `/admin` shows only sign-in.
- Non-admin signed-in user: dashboard access is rejected by the database.
- Admin: save a private draft, confirm it does not change the public page, then publish and reload the public page.
- Upload and replace a photo, reload, and verify it survives sign-out and another browser session.

The code can be built before activation, but authenticated editing and permission checks require the SQL setup and a real authorized account. The local development server must be restarted after changing environment variables.

## Research papers and direct photo selection

Research papers now have their own collection. Existing saved research text is loaded into the first paper automatically; no SQL migration is required. Add, edit, delete, and reorder papers from **Research papers**. Save draft and publish as usual.

Project, certificate, gallery, and research forms include **Choose photo from device**. Select an image, wait for its preview, then apply the form. Images upload directly to Supabase; URL copying is optional. Canceling a form leaves an unused upload in the library, where it can be deleted. Original portfolio photo slots still support direct replacement.
