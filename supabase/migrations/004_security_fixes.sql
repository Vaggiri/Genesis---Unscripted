-- =========================================================================
-- Amrita Yukti — 004_security_fixes.sql
-- Closes privilege escalation, student self-approval and PII exposure.
-- Run AFTER 001-003. Idempotent.
-- =========================================================================

-- 1. Signup trigger: NEVER trust client metadata for role; enforce college domain.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  IF lower(new.email) !~ '@(cb\.amrita\.edu|cb\.students\.amrita\.edu|amrita\.edu)$' THEN
    RAISE EXCEPTION 'Sign-up restricted to Amrita college email addresses';
  END IF;

  INSERT INTO public.profiles (id, full_name, role, roll_no, department, batch, preferred_language)
  VALUES (
    new.id,
    COALESCE(NULLIF(left(new.raw_user_meta_data->>'full_name', 100), ''), split_part(new.email, '@', 1)),
    'student',                                              -- always student
    COALESCE(left(new.raw_user_meta_data->>'roll_no', 30), ''),
    COALESCE(left(new.raw_user_meta_data->>'department', 60), 'CSE'),
    COALESCE(left(new.raw_user_meta_data->>'batch', 20), '2023-2027'),
    CASE WHEN new.raw_user_meta_data->>'preferred_language' IN ('en','ta','hi','ml')
         THEN new.raw_user_meta_data->>'preferred_language' ELSE 'en' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Block role / identity changes by anyone except admins (service role has auth.uid() NULL).
CREATE OR REPLACE FUNCTION public.guard_profile_update()
RETURNS trigger AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    IF new.role IS DISTINCT FROM old.role OR new.id IS DISTINCT FROM old.id THEN
      RAISE EXCEPTION 'Only administrators can change roles';
    END IF;
  END IF;
  new.updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS guard_profile_update ON public.profiles;
CREATE TRIGGER guard_profile_update BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.guard_profile_update();

-- 3. Profiles: only own row (or staff) is readable.
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff());

-- 4. Jobs & facility bookings: all writes go through the Express API (service role).
--    Remove direct client write access so students cannot self-approve.
DROP POLICY IF EXISTS "jobs_insert" ON public.jobs;
DROP POLICY IF EXISTS "jobs_update" ON public.jobs;
DROP POLICY IF EXISTS "facility_bookings_insert" ON public.facility_bookings;
DROP POLICY IF EXISTS "facility_bookings_update" ON public.facility_bookings;

-- 5. Catalogue tables: admin writes only; inventory by that lab's in-charge or admin.
DROP POLICY IF EXISTS "labs_write" ON public.labs;
CREATE POLICY "labs_write" ON public.labs FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "resources_write" ON public.resources;
CREATE POLICY "resources_write" ON public.resources FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "inventory_write" ON public.inventory_items;
CREATE POLICY "inventory_write" ON public.inventory_items FOR ALL TO authenticated
  USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.labs l WHERE l.id = lab_id AND l.incharge_id = auth.uid()))
  WITH CHECK (public.is_admin() OR EXISTS (SELECT 1 FROM public.labs l WHERE l.id = lab_id AND l.incharge_id = auth.uid()));

DROP POLICY IF EXISTS "certifications_write" ON public.certifications;
CREATE POLICY "certifications_write" ON public.certifications FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. Audit log: only the server (service role) may insert; forged entries impossible from browser.
DROP POLICY IF EXISTS "audit_log_insert" ON public.audit_log;

-- 7. Purchase requests must belong to the caller.
DROP POLICY IF EXISTS "purchase_requests_insert" ON public.purchase_requests;
CREATE POLICY "purchase_requests_insert" ON public.purchase_requests
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff() AND requested_by = auth.uid());

-- 8. Inventory idempotent re-import: stable natural key.
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS item_key TEXT;
UPDATE public.inventory_items
   SET item_key = lower(regexp_replace(COALESCE(NULLIF(part_no, ''), name), '\s+', ' ', 'g'))
 WHERE item_key IS NULL;
-- remove accidental duplicates (keep newest)
DELETE FROM public.inventory_items a USING public.inventory_items b
 WHERE a.lab_id = b.lab_id AND a.item_key = b.item_key
   AND (a.updated_at, a.id) < (b.updated_at, b.id);
ALTER TABLE public.inventory_items ALTER COLUMN item_key SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS inventory_items_lab_key_uniq ON public.inventory_items (lab_id, item_key);

-- 9. Helpful indexes for traffic.
CREATE INDEX IF NOT EXISTS idx_fb_resource_time ON public.facility_bookings (resource_id, start_ts);
CREATE INDEX IF NOT EXISTS idx_fb_user ON public.facility_bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user ON public.jobs (user_id);
