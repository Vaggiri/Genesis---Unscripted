-- =========================================================================
-- CampusSync - Unified Campus E-Governance & Space Radar
-- Amrita Vishwa Vidyapeetham — Coimbatore Campus
-- Target: Supabase Cloud SQL Editor (PostgreSQL with RLS & Realtime)
-- =========================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Cleanly reset existing tables to avoid column mismatches from previous schemas
DROP TABLE IF EXISTS public.occupancy_reports CASCADE;
DROP TABLE IF EXISTS public.timetables CASCADE;
DROP TABLE IF EXISTS public.classrooms CASCADE;
DROP TABLE IF EXISTS public.portal_pages CASCADE;
DROP TABLE IF EXISTS public.portal_settings CASCADE;

-- 3. CLASSROOMS TABLE
CREATE TABLE public.classrooms (
    id TEXT PRIMARY KEY,                       -- e.g. 'AB1-101', 'AB3-305'
    room_number TEXT NOT NULL,                -- e.g. '101', '305', 'LAB-2'
    block TEXT NOT NULL,                      -- 'AB-1', 'AB-2', 'AB-3', 'CIR'
    floor INTEGER NOT NULL DEFAULT 1,         -- 0 (Ground), 1, 2, 3, 4
    capacity INTEGER NOT NULL DEFAULT 60,
    room_type TEXT NOT NULL DEFAULT 'lecture_hall', -- 'lecture_hall', 'lab_computer', 'lab_electronics', 'seminar_hall', 'project_room'
    amenities JSONB DEFAULT '["ac", "projector", "power_sockets"]'::jsonb,
    is_flagged BOOLEAN DEFAULT FALSE,         -- Permanently flagged if reported >= threshold (e.g. 2 times in a week)
    flag_reason TEXT DEFAULT NULL,
    flag_count INTEGER DEFAULT 0,
    flagged_batch TEXT DEFAULT NULL,          -- e.g. 'CSE-B 3rd Yr'
    flagged_department TEXT DEFAULT NULL,     -- e.g. 'Computer Science & Engineering'
    flagged_purpose TEXT DEFAULT NULL,        -- e.g. 'Extra Remedial Coding Session'
    last_flagged_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MASTER TIMETABLE SCHEDULE TABLE
CREATE TABLE public.timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id TEXT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL,                -- 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    start_time TIME NOT NULL,                 -- e.g. '08:45:00'
    end_time TIME NOT NULL,                   -- e.g. '09:35:00'
    slot_number INTEGER NOT NULL,             -- 1 to 8
    subject_name TEXT NOT NULL,               -- e.g. 'Data Structures & Algorithms', 'Deep Learning Lab'
    subject_code TEXT DEFAULT '',             -- e.g. '21CSE201'
    department TEXT NOT NULL,                 -- 'CSE', 'ECE', 'AI & DS', 'MECH', 'CIVIL', 'MATH'
    batch TEXT NOT NULL,                      -- e.g. 'B.Tech CSE-A (Sem 4)', 'AI-DS 2024-28'
    is_lab BOOLEAN DEFAULT FALSE,
    faculty_name TEXT DEFAULT 'Faculty In-Charge',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CROWDSOURCED OCCUPANCY REPORTS TABLE
CREATE TABLE public.occupancy_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id TEXT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL DEFAULT 'unscheduled_occupancy', -- 'unscheduled_occupancy', 'class_cancelled_empty'
    reported_batch TEXT NOT NULL,             -- e.g. 'CSE-B 3rd Yr'
    reported_department TEXT NOT NULL,        -- e.g. 'Computer Science & Engineering'
    is_lab_class BOOLEAN DEFAULT FALSE,
    purpose TEXT NOT NULL,                    -- 'Remedial Test', 'Internal Hackathon Prep', 'Extra Lecture'
    occupancy_level TEXT DEFAULT 'Full',      -- 'Full', 'Moderate', 'Empty'
    reporter_name TEXT DEFAULT 'Anonymous Student',
    reporter_roll_no TEXT DEFAULT '',
    reporter_role TEXT DEFAULT 'student',
    status TEXT DEFAULT 'active',             -- 'active', 'verified_by_admin', 'dismissed', 'resolved'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PORTAL DYNAMIC CONFIGURATION & CMS
CREATE TABLE public.portal_settings (
    id TEXT PRIMARY KEY DEFAULT 'campus_config',
    campus_name TEXT DEFAULT 'Amrita Vishwa Vidyapeetham — Coimbatore',
    active_semester TEXT DEFAULT 'Even Semester 2026',
    flag_threshold INTEGER DEFAULT 2,         -- >= 2 reports per week permanently flags room
    banner_message TEXT DEFAULT '📢 Real-time Classroom & Lab Occupancy live. Submit reports for unannounced room takeovers.',
    banner_active BOOLEAN DEFAULT TRUE,
    allow_student_reporting BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.portal_pages (
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

-- 7. ENABLE ROW LEVEL SECURITY (RLS) WITH FULL PUBLIC PERMISSIONS
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occupancy_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_pages ENABLE ROW LEVEL SECURITY;

-- Allow unrestricted read & write for portal operations
CREATE POLICY "Public full access classrooms" ON public.classrooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access timetables" ON public.timetables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access occupancy_reports" ON public.occupancy_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access portal_settings" ON public.portal_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access portal_pages" ON public.portal_pages FOR ALL USING (true) WITH CHECK (true);

-- 8. SAFE REALTIME PUBLICATION ENABLEMENT (Prevents duplicate errors)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'classrooms'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.classrooms;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'occupancy_reports'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.occupancy_reports;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'timetables'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.timetables;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'portal_settings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.portal_settings;
    END IF;
END $$;

-- 9. SEED INITIAL AMRITA DATA
INSERT INTO public.portal_settings (id, campus_name, active_semester, flag_threshold, banner_message, banner_active)
VALUES (
    'campus_config',
    'Amrita Vishwa Vidyapeetham — Coimbatore',
    'Even Semester 2026',
    2,
    '📢 Real-time Classroom & Lab Occupancy live. Submit reports for unannounced room takeovers.',
    TRUE
);

INSERT INTO public.classrooms (id, room_number, block, floor, capacity, room_type, amenities, is_flagged, flag_count, flagged_batch, flagged_department, flagged_purpose)
VALUES 
('AB1-101', '101', 'AB-1', 1, 75, 'lecture_hall', '["ac", "projector", "power_sockets", "smart_board"]'::jsonb, false, 0, null, null, null),
('AB1-102', '102', 'AB-1', 1, 75, 'lecture_hall', '["projector", "power_sockets"]'::jsonb, false, 0, null, null, null),
('AB1-204', '204', 'AB-1', 2, 80, 'lecture_hall', '["ac", "projector", "power_sockets", "mic_audio"]'::jsonb, true, 3, 'CSE-B (3rd Year)', 'Computer Science & Engineering', 'Unscheduled Remedial Coding Session'),
('AB1-205', '205', 'AB-1', 2, 60, 'lecture_hall', '["projector", "power_sockets"]'::jsonb, false, 1, null, null, null),
('AB2-108', '108', 'AB-2', 1, 40, 'project_room', '["ac", "power_sockets", "smart_board", "wifi_6"]'::jsonb, false, 0, null, null, null),
('AB2-210', '210 (IoT Lab)', 'AB-2', 2, 50, 'lab_electronics', '["ac", "power_sockets", "oscilloscope", "pcb_stations"]'::jsonb, false, 0, null, null, null),
('AB3-301', '301', 'AB-3', 3, 90, 'lecture_hall', '["ac", "projector", "power_sockets", "tiered_seating"]'::jsonb, false, 0, null, null, null),
('AB3-305', '305 (AI Lab)', 'AB-3', 3, 60, 'lab_computer', '["ac", "high_gpu_workstations", "power_sockets", "lan_gigabit"]'::jsonb, false, 1, null, null, null),
('AB3-402', '402', 'AB-3', 4, 70, 'lecture_hall', '["projector", "power_sockets"]'::jsonb, false, 0, null, null, null),
('CIR-SEM1', 'Seminar Hall 1', 'CIR', 1, 150, 'seminar_hall', '["ac", "dual_projectors", "mic_audio", "surround_sound"]'::jsonb, false, 0, null, null, null);

INSERT INTO public.timetables (room_id, day_of_week, start_time, end_time, slot_number, subject_name, subject_code, department, batch, is_lab, faculty_name)
VALUES
('AB1-101', 'Monday', '08:45:00', '09:35:00', 1, 'Data Structures & Algorithms', '21CSE201', 'CSE', 'B.Tech CSE-A (Sem 4)', false, 'Dr. K. Swaminathan'),
('AB1-101', 'Monday', '09:40:00', '10:30:00', 2, 'Discrete Mathematics', '21MAT204', 'Mathematics', 'B.Tech CSE-A (Sem 4)', false, 'Prof. S. Ranganathan'),
('AB1-101', 'Monday', '10:45:00', '11:35:00', 3, 'Computer Architecture', '21CSE205', 'CSE', 'B.Tech CSE-A (Sem 4)', false, 'Dr. V. Priya'),
('AB1-204', 'Monday', '13:30:00', '16:15:00', 6, 'Cloud Computing Lab', '21CSE318', 'CSE', 'B.Tech CSE-B (Sem 6)', true, 'Dr. M. Suresh'),
('AB3-305', 'Monday', '08:45:00', '11:35:00', 1, 'Deep Learning & Neural Networks Lab', '21AID302', 'AI & DS', 'B.Tech AI-DS (Sem 6)', true, 'Dr. Anand Kumar'),
('AB3-305', 'Monday', '13:30:00', '15:20:00', 5, 'Natural Language Processing', '21AID305', 'AI & DS', 'B.Tech AI-DS (Sem 6)', false, 'Dr. Deepa S.'),
('AB2-210', 'Monday', '10:45:00', '12:35:00', 3, 'Embedded Systems & Sensor Lab', '21ECE304', 'ECE', 'B.Tech ECE-A (Sem 6)', true, 'Dr. Ramesh Babu');

INSERT INTO public.portal_pages (slug, title, subtitle, badge, icon_name, is_enabled, display_order)
VALUES
('classroom-occupancy', 'Classroom & Lab Occupancy', 'Real-time timetable index, room vacancies, and crowdsourced reporting', 'Live Matrix', 'Compass', true, 1),
('parent-epass', 'Parent Hostel Visit & Gate E-Pass', 'Digital pre-clearance, 1-click warden approvals & dynamic QR fast lane', 'E-Governance', 'ShieldCheck', true, 2),
('fablab-desk', 'FabLab Service Request Desk', 'Conversational AI triage for 3D printing and PCB fabrication work orders', 'Makerspace', 'Cpu', true, 3),
('admin-portal', 'CampusSync Admin Desk', 'Dynamic configuration, timetable overrides, and crowd report moderation', 'Admin Only', 'Sliders', true, 4);
