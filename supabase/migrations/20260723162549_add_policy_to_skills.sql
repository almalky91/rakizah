
create policy "Enable read access for all users"
on "public"."skills"
as PERMISSIVE
to public
using (
  true
);