-- =========================================================================
-- Amrita Yukti — 001_init.sql: Core Schema & Extensions
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
    id TEXT PRIMARY KEY,                       -- e.g. 'AB1-101', 'AB3-305'
    room_number TEXT NOT NULL,
    block TEXT NOT NULL,                      -- 'AB-1', 'AB-2', 'AB-3', 'CIR'
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
    day_of_week TEXT NOT NULL,                -- 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_number INTEGER NOT NULL,             -- 1 to 8
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

-- Ensure columns exist if table pre-existed from an earlier run
ALTER TABLE public.occupancy_reports ADD COLUMN IF NOT EXISTS reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.occupancy_reports ADD COLUMN IF NOT EXISTS reporter_name TEXT DEFAULT 'Anonymous Student';
ALTER TABLE public.occupancy_reports ADD COLUMN IF NOT EXISTS reporter_roll_no TEXT DEFAULT '';
ALTER TABLE public.occupancy_reports ADD COLUMN IF NOT EXISTS reporter_role TEXT DEFAULT 'student';
ALTER TABLE public.occupancy_reports ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

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

-- Safety certification gate table
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

-- 11. ROOM BOOKINGS (Faculty Room Reservation)
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

-- 14. Trigger to handle profile creation on auth.users sign-up
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
