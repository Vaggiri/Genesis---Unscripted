-- =========================================================================
-- CampusSync - Unified Campus E-Governance (Problem Statement #9)
-- Module: Classroom Occupancy & Live Study Space Locator Schema
-- Target: Supabase (PostgreSQL with RLS & Realtime)
-- =========================================================================

-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CLASSROOMS TABLE
CREATE TABLE IF NOT EXISTS public.classrooms (
    id TEXT PRIMARY KEY,                       -- e.g. 'AB1-101', 'AB3-305'
    room_number TEXT NOT NULL,                -- e.g. '101', '305', 'LAB-2'
    block TEXT NOT NULL,                      -- 'AB-1', 'AB-2', 'AB-3', 'CIR', 'Mechanical Block'
    floor INTEGER NOT NULL DEFAULT 1,         -- 0 (Ground), 1, 2, 3, 4
    capacity INTEGER NOT NULL DEFAULT 60,
    room_type TEXT NOT NULL DEFAULT 'lecture_hall', -- 'lecture_hall', 'lab_computer', 'lab_electronics', 'seminar_hall', 'project_room'
    amenities JSONB DEFAULT '["ac", "projector", "power_sockets"]'::jsonb,
    is_flagged BOOLEAN DEFAULT FALSE,         -- Permanently flagged if reported >= threshold (e.g. 2 times in a week)
    flag_reason TEXT DEFAULT NULL,
    flag_count INTEGER DEFAULT 0,
    flagged_batch TEXT DEFAULT NULL,          -- e.g. 'CSE-B 3rd Yr'
    flagged_department TEXT DEFAULT NULL,     -- e.g. 'Computer Science'
    flagged_purpose TEXT DEFAULT NULL,        -- e.g. 'Extra Remedial Lab'
    last_flagged_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MASTER TIMETABLE SCHEDULE TABLE
CREATE TABLE IF NOT EXISTS public.timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id TEXT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL,                -- 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    start_time TIME NOT NULL,                 -- e.g. '08:45:00'
    end_time TIME NOT NULL,                   -- e.g. '09:35:00'
    slot_number INTEGER NOT NULL,             -- 1 to 8
    subject_name TEXT NOT NULL,               -- e.g. 'Distributed Computing', 'VLSI Design Lab'
    subject_code TEXT DEFAULT '',             -- e.g. '21CSE312'
    department TEXT NOT NULL,                 -- 'CSE', 'ECE', 'AI & DS', 'MECH', 'CIVIL', 'MATH'
    batch TEXT NOT NULL,                      -- e.g. 'B.Tech CSE-A (Sem 6)', 'AI-DS 2024-28'
    is_lab BOOLEAN DEFAULT FALSE,
    faculty_name TEXT DEFAULT 'Faculty In-Charge',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CROWDSOURCED OCCUPANCY REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.occupancy_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id TEXT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL DEFAULT 'unscheduled_occupancy', -- 'unscheduled_occupancy', 'class_cancelled_empty', 'event_occupied'
    reported_batch TEXT NOT NULL,             -- e.g. 'ECE-B 2nd Yr'
    reported_department TEXT NOT NULL,        -- e.g. 'Electronics & Communication'
    is_lab_class BOOLEAN DEFAULT FALSE,
    purpose TEXT NOT NULL,                    -- 'Extra Lecture', 'Internal Hackathon', 'Lab Practicals', 'Club Activity'
    occupancy_level TEXT DEFAULT 'Full',      -- 'Full', 'Partial (<50%)', 'Empty'
    reporter_name TEXT DEFAULT 'Anonymous Student',
    reporter_roll_no TEXT DEFAULT '',
    reporter_role TEXT DEFAULT 'student',     -- 'student', 'class_representative', 'faculty'
    status TEXT DEFAULT 'active',             -- 'active', 'verified_by_admin', 'dismissed', 'resolved'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ADMIN & PORTAL DYNAMIC CONFIGURATION
CREATE TABLE IF NOT EXISTS public.portal_settings (
    id TEXT PRIMARY KEY DEFAULT 'campus_config',
    campus_name TEXT DEFAULT 'Amrita Vishwa Vidyapeetham — Coimbatore',
    active_semester TEXT DEFAULT 'Even Semester 2026',
    flag_threshold INTEGER DEFAULT 2,         -- >= 2 reports per week permanently flags the room
    banner_message TEXT DEFAULT 'Welcome to CampusSync. Real-time Classroom Occupancy & Dynamic Timetable Indexing Live.',
    banner_active BOOLEAN DEFAULT TRUE,
    allow_student_reporting BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DYNAMIC PORTAL PAGES (Allows Admin to edit any portal page dynamically without hardcoding)
CREATE TABLE IF NOT EXISTS public.portal_pages (
    slug TEXT PRIMARY KEY,                    -- 'classroom-occupancy', 'parent-epass', 'fablab-desk', 'gate-console'
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    badge TEXT NOT NULL,
    icon_name TEXT DEFAULT 'Layers',
    is_enabled BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 1,
    custom_content JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime publication enablement
ALTER PUBLICATION supabase_realtime ADD TABLE classrooms;
ALTER PUBLICATION supabase_realtime ADD TABLE occupancy_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE timetables;
ALTER PUBLICATION supabase_realtime ADD TABLE portal_settings;

-- SEED INITIAL DATA FOR AMRITA CAMPUS
INSERT INTO public.portal_settings (id, campus_name, active_semester, flag_threshold, banner_message, banner_active)
VALUES (
    'campus_config',
    'Amrita Vishwa Vidyapeetham — Coimbatore',
    'Spring Semester 2026',
    2,
    '📢 Live Occupancy Monitor active. If a classroom is taken by an unscheduled batch, submit a report to alert fellow students.',
    TRUE
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Insert Initial Classrooms Across Key Blocks (AB-1, AB-2, AB-3, CIR)
INSERT INTO public.classrooms (id, room_number, block, floor, capacity, room_type, amenities, is_flagged, flag_count)
VALUES 
('AB1-101', '101', 'AB-1', 1, 75, 'lecture_hall', '["ac", "projector", "power_sockets", "smart_board"]'::jsonb, false, 0),
('AB1-102', '102', 'AB-1', 1, 75, 'lecture_hall', '["projector", "power_sockets"]'::jsonb, false, 0),
('AB1-204', '204', 'AB-1', 2, 80, 'lecture_hall', '["ac", "projector", "power_sockets", "mic_audio"]'::jsonb, true, 3),
('AB1-205', '205', 'AB-1', 2, 60, 'lecture_hall', '["projector", "power_sockets"]'::jsonb, false, 1),
('AB2-108', '108', 'AB-2', 1, 40, 'project_room', '["ac", "power_sockets", "smart_board", "wifi_6"]'::jsonb, false, 0),
('AB2-210', '210 (IoT Lab)', 'AB-2', 2, 50, 'lab_electronics', '["ac", "power_sockets", "oscilloscope", "pcb_stations"]'::jsonb, false, 0),
('AB3-301', '301', 'AB-3', 3, 90, 'lecture_hall', '["ac", "projector", "power_sockets", "tiered_seating"]'::jsonb, false, 0),
('AB3-305', '305 (AI Lab)', 'AB-3', 3, 60, 'lab_computer', '["ac", "high_gpu_workstations", "power_sockets", "lan_gigabit"]'::jsonb, false, 1),
('AB3-402', '402', 'AB-3', 4, 70, 'lecture_hall', '["projector", "power_sockets"]'::jsonb, false, 0),
('CIR-SEM1', 'Seminar Hall 1', 'CIR', 1, 150, 'seminar_hall', '["ac", "dual_projectors", "mic_audio", "surround_sound"]'::jsonb, false, 0)
ON CONFLICT (id) DO NOTHING;

-- Flag details for AB1-204 (reported >= 2 times in a week)
UPDATE public.classrooms 
SET is_flagged = true, 
    flag_reason = 'Reported occupied >2 times this week by unscheduled batch for remedial test sessions.',
    flag_count = 3,
    flagged_batch = 'CSE-B (3rd Year)',
    flagged_department = 'Computer Science & Engineering',
    flagged_purpose = 'Unscheduled Remedial Coding Test',
    last_flagged_at = NOW()
WHERE id = 'AB1-204';

-- Seed Timetable Slots for Current Academic Schedule
INSERT INTO public.timetables (room_id, day_of_week, start_time, end_time, slot_number, subject_name, subject_code, department, batch, is_lab, faculty_name)
VALUES
-- AB1-101
('AB1-101', 'Monday', '08:45:00', '09:35:00', 1, 'Data Structures & Algorithms', '21CSE201', 'CSE', 'B.Tech CSE-A (Sem 4)', false, 'Dr. K. Swaminathan'),
('AB1-101', 'Monday', '09:40:00', '10:30:00', 2, 'Discrete Mathematics', '21MAT204', 'Mathematics', 'B.Tech CSE-A (Sem 4)', false, 'Prof. S. Ranganathan'),
('AB1-101', 'Monday', '10:45:00', '11:35:00', 3, 'Computer Architecture', '21CSE205', 'CSE', 'B.Tech CSE-A (Sem 4)', false, 'Dr. V. Priya'),

-- AB1-204 (Flagged Room)
('AB1-204', 'Monday', '08:45:00', '09:35:00', 1, 'Free Slot (Library/Self Study)', '', 'CSE', 'Self-Study', false, 'N/A'),
('AB1-204', 'Monday', '13:30:00', '16:15:00', 6, 'Cloud Computing Lab', '21CSE318', 'CSE', 'B.Tech CSE-B (Sem 6)', true, 'Dr. M. Suresh'),

-- AB3-305 (AI Lab)
('AB3-305', 'Monday', '08:45:00', '11:35:00', 1, 'Deep Learning & Neural Networks Lab', '21AID302', 'AI & DS', 'B.Tech AI-DS (Sem 6)', true, 'Dr. Anand Kumar'),
('AB3-305', 'Monday', '13:30:00', '15:20:00', 5, 'Natural Language Processing', '21AID305', 'AI & DS', 'B.Tech AI-DS (Sem 6)', false, 'Dr. Deepa S.'),

-- AB2-108 (Project Room - Frequently Vacant for Hackathon Teams)
('AB2-108', 'Monday', '13:30:00', '15:20:00', 5, 'Capstone Project Mentoring', '21CSE499', 'CSE', 'B.Tech Final Year', false, 'Dept Coordinators')
ON CONFLICT DO NOTHING;

-- Seed Portal Pages Config
INSERT INTO public.portal_pages (slug, title, subtitle, badge, icon_name, is_enabled, display_order)
VALUES
('classroom-occupancy', 'Classroom & Lab Occupancy', 'Live timetable index, room vacancies, and crowdsourced occupancy reporting', 'Live Matrix', 'Compass', true, 1),
('parent-epass', 'Parent Hostel Visit & Gate E-Pass', 'Digital pre-clearance, 1-click warden approvals & dynamic QR fast lane', 'E-Governance', 'ShieldCheck', true, 2),
('fablab-desk', 'AI FabLab Intake Desk', 'Conversational AI triage for 3D printing and PCB fabrication work orders', 'AI Service Desk', 'Cpu', true, 3),
('admin-portal', 'CampusSync Admin Console', 'Dynamic configuration, timetable overrides, and crowd-report moderation', 'Admin Only', 'Sliders', true, 4)
ON CONFLICT (slug) DO UPDATE SET updated_at = NOW();
