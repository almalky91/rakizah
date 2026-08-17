create policy "Enable read access for all users"
on "public"."grades"
as PERMISSIVE
to public
using (
  true
);


create policy "Enable read access for all users"
on "public"."subjects"
as PERMISSIVE
to public
using (
  true
);


create policy "Enable read access for all users"
on "public"."fields"
as PERMISSIVE
to public
using (
  true
);

create policy "Enable read access for all users"
on "public"."teacher_skills"
as PERMISSIVE
to public
using (
  true
);


