-- Demo seed upgrade for an existing Thayyib Supabase project.
-- Run this if `npm run seed:demo-user` says notification inserts are blocked by RLS.

drop policy if exists "members can insert notifications" on public.notifications;

create policy "members can insert notifications"
on public.notifications for insert
with check (company_id in (select public.current_user_company_ids()));
