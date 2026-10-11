-- =========================================================================
-- Amrita Yukti — Unified Supabase Database Schema (Production Ready)
-- Amrita Vishwa Vidyapeetham — Coimbatore Campus
-- =========================================================================
-- Target: Supabase Cloud SQL Editor (PostgreSQL with RLS & Realtime)
-- Safe migration: Uses CREATE TABLE IF NOT EXISTS without destructive DROPs
-- =========================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. PROFILES TABLE (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'lab_incharge', 'admin')),
    full_name TEXT NOT NULL DEFAULT '',
    roll_no TEXT DEFAULT '',
    emp_id TEXT DEFAULT '',
    department TEXT DEFAULT 'CSE',
    batch TEXT DEFAULT '2023-2027',
    preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'ta', 'hi', 'ml')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CLASSROOMS TABLE
CREATE TABLE IF NOT EXISTS public.classrooms (
    id TEXT PRIMARY KEY,
    room_number TEXT NOT NULL,
    block TEXT NOT NULL,
    floor INTEGER NOT NULL DEFAULT 1,
    capacity INTEGER NOT NULL DEFAULT 60,
    room_type TEXT NOT NULL DEFAULT 'lecture_hall',
    amenities JSONB DEFAULT '["ac", "projector", "power_sockets"]'::jsonb,
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason TEXT DEFAULT NULL,
    flag_count INTEGER DEFAULT 0,
    flagged_batch TEXT DEFAULT NULL,
    flagged_department TEXT DEFAULT NULL,
    flagged_purpose TEXT DEFAULT NULL,
    last_flagged_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MASTER TIMETABLES TABLE
CREATE TABLE IF NOT EXISTS public.timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id TEXT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_number INTEGER NOT NULL,
    subject_name TEXT NOT NULL,
    subject_code TEXT DEFAULT '',
    department TEXT NOT NULL,
    batch TEXT NOT NULL,
    is_lab BOOLEAN DEFAULT FALSE,
    faculty_name TEXT DEFAULT 'Faculty In-Charge',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. OCCUPANCY REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.occupancy_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id TEXT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL DEFAULT 'unscheduled_occupancy',
    reported_batch TEXT NOT NULL,
    reported_department TEXT NOT NULL,
    is_lab_class BOOLEAN DEFAULT FALSE,
    purpose TEXT NOT NULL,
    occupancy_level TEXT DEFAULT 'Full',
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reporter_name TEXT DEFAULT 'Anonymous Student',
    reporter_roll_no TEXT DEFAULT '',
    reporter_role TEXT DEFAULT 'student',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'verified_by_admin', 'dismissed', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PORTAL CONFIGURATION
CREATE TABLE IF NOT EXISTS public.portal_settings (
    id TEXT PRIMARY KEY DEFAULT 'campus_config',
    campus_name TEXT DEFAULT 'Amrita Vishwa Vidyapeetham — Coimbatore',
    active_semester TEXT DEFAULT 'Even Semester 2026',
    flag_threshold INTEGER DEFAULT 2,
    banner_message TEXT DEFAULT '📢 Real-time Classroom & Lab Occupancy live. Submit reports for unannounced room takeovers.',
    banner_active BOOLEAN DEFAULT TRUE,
    allow_student_reporting BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.portal_pages (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    badge TEXT NOT NULL,
    icon_name TEXT DEFAULT 'Layers',
    is_enabled BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 1,
    custom_content JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LABS & RESOURCES
CREATE TABLE IF NOT EXISTS public.labs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    block TEXT NOT NULL,
    floor INTEGER NOT NULL DEFAULT 1,
    category TEXT NOT NULL,
    incharge_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    capacity INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resources (
    id TEXT PRIMARY KEY,
    lab_id TEXT NOT NULL REFERENCES public.labs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('printer_3d', 'pcb_mill', 'laser', 'lathe', 'welding', 'workstation', 'bench')),
    status TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'maintenance')),
    requires_cert BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resource_kind TEXT NOT NULL,
    passed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, resource_kind)
);

-- 8. INVENTORY ITEMS & IMPORTS
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id TEXT PRIMARY KEY,
    lab_id TEXT NOT NULL REFERENCES public.labs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    part_no TEXT DEFAULT '',
    category TEXT DEFAULT 'General',
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    location TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.inventory_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_id TEXT REFERENCES public.labs(id) ON DELETE SET NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    filename TEXT NOT NULL,
    row_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. JOBS (3D print, PCB, Laser, etc.)
CREATE TABLE IF NOT EXISTS public.jobs (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('print_3d', 'pcb', 'laser', 'other')),
    title TEXT NOT NULL,
    file_path TEXT,
    file_name TEXT,
    file_ext TEXT,
    detected_by TEXT,
    est_minutes INTEGER DEFAULT 60,
    est_material_g NUMERIC DEFAULT 0,
    params JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'queued', 'approved', 'in_progress', 'done', 'rejected')),
    lab_id TEXT REFERENCES public.labs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. FACILITY BOOKINGS (With btree_gist exclusion constraint)
CREATE TABLE IF NOT EXISTS public.facility_bookings (
    id TEXT PRIMARY KEY,
    resource_id TEXT NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id TEXT REFERENCES public.jobs(id) ON DELETE SET NULL,
    start_ts TIMESTAMPTZ NOT NULL,
    end_ts TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'no_show', 'completed')),
    checked_in_at TIMESTAMPTZ DEFAULT NULL,
    purpose TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT facility_bookings_no_overlap EXCLUDE USING gist (
        resource_id WITH =,
        tstzrange(start_ts, end_ts) WITH &&
    ) WHERE (status IN ('pending', 'approved'))
);

-- 11. ROOM BOOKINGS
CREATE TABLE IF NOT EXISTS public.room_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id TEXT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    slot_number INTEGER NOT NULL,
    purpose TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'cancelled', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (room_id, booking_date, slot_number)
);

-- 12. PURCHASE / EQUIPMENT REQUESTS
CREATE TABLE IF NOT EXISTS public.purchase_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_id TEXT NOT NULL REFERENCES public.labs(id) ON DELETE CASCADE,
    item TEXT NOT NULL,
    qty INTEGER NOT NULL CHECK (qty > 0),
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'ordered')),
    requested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AUDIT LOG
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Trigger on auth.users for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, preferred_language)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    COALESCE(new.raw_user_meta_data->>'preferred_language', 'en')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 15. Helper functions for RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('faculty', 'lab_incharge', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 16. Enable RLS
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

-- 17. RLS Policies
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "classrooms_read" ON public.classrooms;
CREATE POLICY "classrooms_read" ON public.classrooms FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "classrooms_admin_write" ON public.classrooms;
CREATE POLICY "classrooms_admin_write" ON public.classrooms FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "timetables_read" ON public.timetables;
CREATE POLICY "timetables_read" ON public.timetables FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "timetables_admin_write" ON public.timetables;
CREATE POLICY "timetables_admin_write" ON public.timetables FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "occupancy_reports_read" ON public.occupancy_reports;
CREATE POLICY "occupancy_reports_read" ON public.occupancy_reports FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "occupancy_reports_insert" ON public.occupancy_reports;
CREATE POLICY "occupancy_reports_insert" ON public.occupancy_reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid() OR reporter_id IS NULL);
DROP POLICY IF EXISTS "occupancy_reports_admin_mod" ON public.occupancy_reports;
CREATE POLICY "occupancy_reports_admin_mod" ON public.occupancy_reports FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "settings_read" ON public.portal_settings;
CREATE POLICY "settings_read" ON public.portal_settings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "settings_admin_write" ON public.portal_settings;
CREATE POLICY "settings_admin_write" ON public.portal_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "pages_read" ON public.portal_pages;
CREATE POLICY "pages_read" ON public.portal_pages FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "pages_admin_write" ON public.portal_pages;
CREATE POLICY "pages_admin_write" ON public.portal_pages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "labs_read" ON public.labs;
CREATE POLICY "labs_read" ON public.labs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "labs_write" ON public.labs;
CREATE POLICY "labs_write" ON public.labs FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "resources_read" ON public.resources;
CREATE POLICY "resources_read" ON public.resources FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "resources_write" ON public.resources;
CREATE POLICY "resources_write" ON public.resources FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "certifications_read" ON public.certifications;
CREATE POLICY "certifications_read" ON public.certifications FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff());
DROP POLICY IF EXISTS "certifications_write" ON public.certifications;
CREATE POLICY "certifications_write" ON public.certifications FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "inventory_read" ON public.inventory_items;
CREATE POLICY "inventory_read" ON public.inventory_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "inventory_write" ON public.inventory_items;
CREATE POLICY "inventory_write" ON public.inventory_items FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "jobs_select" ON public.jobs;
CREATE POLICY "jobs_select" ON public.jobs FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff());
DROP POLICY IF EXISTS "jobs_insert" ON public.jobs;
CREATE POLICY "jobs_insert" ON public.jobs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "jobs_update" ON public.jobs;
CREATE POLICY "jobs_update" ON public.jobs FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_staff()) WITH CHECK (user_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "facility_bookings_select" ON public.facility_bookings;
CREATE POLICY "facility_bookings_select" ON public.facility_bookings FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff());
DROP POLICY IF EXISTS "facility_bookings_insert" ON public.facility_bookings;
CREATE POLICY "facility_bookings_insert" ON public.facility_bookings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "facility_bookings_update" ON public.facility_bookings;
CREATE POLICY "facility_bookings_update" ON public.facility_bookings FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_staff()) WITH CHECK (user_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "room_bookings_select" ON public.room_bookings;
CREATE POLICY "room_bookings_select" ON public.room_bookings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "room_bookings_insert" ON public.room_bookings;
CREATE POLICY "room_bookings_insert" ON public.room_bookings FOR INSERT TO authenticated WITH CHECK (faculty_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "room_bookings_update_delete" ON public.room_bookings;
CREATE POLICY "room_bookings_update_delete" ON public.room_bookings FOR ALL TO authenticated USING (faculty_id = auth.uid() OR public.is_admin()) WITH CHECK (faculty_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "purchase_requests_select" ON public.purchase_requests;
CREATE POLICY "purchase_requests_select" ON public.purchase_requests FOR SELECT TO authenticated USING (requested_by = auth.uid() OR public.is_staff());
DROP POLICY IF EXISTS "purchase_requests_insert" ON public.purchase_requests;
CREATE POLICY "purchase_requests_insert" ON public.purchase_requests FOR INSERT TO authenticated WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS "purchase_requests_update" ON public.purchase_requests;
CREATE POLICY "purchase_requests_update" ON public.purchase_requests FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "audit_log_select" ON public.audit_log;
CREATE POLICY "audit_log_select" ON public.audit_log FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "audit_log_insert" ON public.audit_log;
CREATE POLICY "audit_log_insert" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);
