-- =========================================================================
-- Amrita Yukti — 002_rls.sql: Hardened Row Level Security (RLS) Policies
-- =========================================================================

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to check if the current user is faculty, lab in-charge, or admin
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('faculty', 'lab_incharge', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occupancy_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 1. PROFILES
-- -----------------------------------------------------------------------------
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- 2. CLASSROOMS & TIMETABLES
-- -----------------------------------------------------------------------------
CREATE POLICY "classrooms_read" ON public.classrooms
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "classrooms_admin_write" ON public.classrooms
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "timetables_read" ON public.timetables
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "timetables_admin_write" ON public.timetables
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- 3. OCCUPANCY REPORTS
-- -----------------------------------------------------------------------------
CREATE POLICY "occupancy_reports_read" ON public.occupancy_reports
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "occupancy_reports_insert" ON public.occupancy_reports
  FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid() OR reporter_id IS NULL);

CREATE POLICY "occupancy_reports_admin_mod" ON public.occupancy_reports
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "occupancy_reports_admin_delete" ON public.occupancy_reports
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 4. PORTAL SETTINGS & PAGES
-- -----------------------------------------------------------------------------
CREATE POLICY "settings_read" ON public.portal_settings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "settings_admin_write" ON public.portal_settings
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "pages_read" ON public.portal_pages
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "pages_admin_write" ON public.portal_pages
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- 5. LABS, RESOURCES & INVENTORY
-- -----------------------------------------------------------------------------
CREATE POLICY "labs_read" ON public.labs
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "labs_write" ON public.labs
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "resources_read" ON public.resources
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "resources_write" ON public.resources
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "certifications_read" ON public.certifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff());

CREATE POLICY "certifications_write" ON public.certifications
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "inventory_read" ON public.inventory_items
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "inventory_write" ON public.inventory_items
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "inventory_imports_read" ON public.inventory_imports
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY "inventory_imports_write" ON public.inventory_imports
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

-- -----------------------------------------------------------------------------
-- 6. JOBS
-- -----------------------------------------------------------------------------
CREATE POLICY "jobs_select" ON public.jobs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff());

CREATE POLICY "jobs_insert" ON public.jobs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "jobs_update" ON public.jobs
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_staff())
  WITH CHECK (user_id = auth.uid() OR public.is_staff());

-- -----------------------------------------------------------------------------
-- 7. FACILITY BOOKINGS
-- -----------------------------------------------------------------------------
CREATE POLICY "facility_bookings_select" ON public.facility_bookings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff());

CREATE POLICY "facility_bookings_insert" ON public.facility_bookings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "facility_bookings_update" ON public.facility_bookings
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_staff())
  WITH CHECK (user_id = auth.uid() OR public.is_staff());

-- -----------------------------------------------------------------------------
-- 8. ROOM BOOKINGS
-- -----------------------------------------------------------------------------
CREATE POLICY "room_bookings_select" ON public.room_bookings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "room_bookings_insert" ON public.room_bookings
  FOR INSERT TO authenticated
  WITH CHECK (faculty_id = auth.uid() OR public.is_admin());

CREATE POLICY "room_bookings_update_delete" ON public.room_bookings
  FOR ALL TO authenticated
  USING (faculty_id = auth.uid() OR public.is_admin())
  WITH CHECK (faculty_id = auth.uid() OR public.is_admin());

-- -----------------------------------------------------------------------------
-- 9. PURCHASE REQUESTS
-- -----------------------------------------------------------------------------
CREATE POLICY "purchase_requests_select" ON public.purchase_requests
  FOR SELECT TO authenticated
  USING (requested_by = auth.uid() OR public.is_staff());

CREATE POLICY "purchase_requests_insert" ON public.purchase_requests
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

CREATE POLICY "purchase_requests_update" ON public.purchase_requests
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- 10. AUDIT LOG
-- -----------------------------------------------------------------------------
CREATE POLICY "audit_log_select" ON public.audit_log
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "audit_log_insert" ON public.audit_log
  FOR INSERT TO authenticated
  WITH CHECK (true);
