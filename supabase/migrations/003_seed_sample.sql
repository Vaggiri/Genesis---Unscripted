-- =========================================================================
-- Amrita Yukti — 003_seed_sample.sql: Curated Sample Campus Data
-- =========================================================================

-- 1. PORTAL SETTINGS & PAGES
INSERT INTO public.portal_settings (id, campus_name, active_semester, flag_threshold, banner_message, banner_active, allow_student_reporting)
VALUES (
    'campus_config',
    'Amrita Vishwa Vidyapeetham — Coimbatore',
    'Even Semester 2026',
    2,
    '📢 Real-time Classroom & Lab Occupancy live. Submit reports for unannounced room takeovers.',
    true,
    true
)
ON CONFLICT (id) DO UPDATE SET
    campus_name = EXCLUDED.campus_name,
    active_semester = EXCLUDED.active_semester,
    banner_message = EXCLUDED.banner_message;

INSERT INTO public.portal_pages (slug, title, subtitle, badge, icon_name, is_enabled, display_order)
VALUES
    ('classroom-occupancy', 'Classroom & Lab Occupancy Locator', 'Live timetable cross-indexing, vacancy detection, and crowdsourced occupancy reporting', 'Live Space Matrix', 'Compass', true, 1),
    ('facility-booking', 'Innovation Facility & Lab Slot Booking', 'Conversational machine matching, drawer stock verification, and slot reservation', 'AI Allocation', 'Cpu', true, 2),
    ('fablab-desk', 'Digital Fabrication Work Order Intake', '3D printing & PCB CNC fabrication intake with automated file inspection', 'Job Desk', 'Cpu', true, 3),
    ('admin-portal', 'Amrita Yukti Administrative Console', 'Central access control, inventory imports, utilization analytics, and audit logging', 'Admin Console', 'Sliders', true, 4)
ON CONFLICT (slug) DO NOTHING;

-- 2. CLASSROOMS
INSERT INTO public.classrooms (id, room_number, block, floor, capacity, room_type, amenities)
VALUES
    ('AB1-101', '101', 'AB-1', 1, 65, 'lecture_hall', '["ac", "projector", "smartboard", "power_sockets"]'::jsonb),
    ('AB1-102', '102', 'AB-1', 1, 65, 'lecture_hall', '["ac", "projector", "power_sockets"]'::jsonb),
    ('AB1-204', '204', 'AB-1', 2, 70, 'lecture_hall', '["ac", "projector", "smartboard"]'::jsonb),
    ('AB2-105', '105', 'AB-2', 1, 80, 'lecture_hall', '["ac", "projector", "mic_system"]'::jsonb),
    ('AB2-201', '201', 'AB-2', 2, 120, 'seminar_hall', '["ac", "laser_projector", "dolby_audio", "dais"]'::jsonb),
    ('AB3-301', '301', 'AB-3', 3, 60, 'lecture_hall', '["projector", "power_sockets"]'::jsonb),
    ('AB3-305', '305', 'AB-3', 3, 60, 'lecture_hall', '["ac", "projector"]'::jsonb),
    ('CIR-AUD', 'Auditorium', 'CIR', 1, 250, 'seminar_hall', '["ac", "stage_lighting", "dual_projectors"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 3. TIMETABLES (Sample Weekly Schedule)
INSERT INTO public.timetables (room_id, day_of_week, start_time, end_time, slot_number, subject_name, subject_code, department, batch, is_lab, faculty_name)
VALUES
    ('AB1-101', 'Monday', '08:45:00', '09:35:00', 1, 'Data Structures & Algorithms', '21CSE201', 'CSE', 'B.Tech CSE-A (Sem 4)', false, 'Dr. K. Swaminathan'),
    ('AB1-101', 'Monday', '09:40:00', '10:30:00', 2, 'Computer Architecture & Org', '21CSE202', 'CSE', 'B.Tech CSE-A (Sem 4)', false, 'Dr. M. Sangeetha'),
    ('AB1-101', 'Monday', '10:45:00', '11:35:00', 3, 'Probability & Statistics', '21MAT205', 'MATH', 'B.Tech CSE-A (Sem 4)', false, 'Prof. R. Ramanathan'),
    ('AB1-101', 'Monday', '13:30:00', '15:15:00', 5, 'Data Structures Lab', '21CSE281', 'CSE', 'B.Tech CSE-A (Sem 4)', true, 'Dr. K. Swaminathan'),
    ('AB1-102', 'Monday', '08:45:00', '10:30:00', 1, 'Operating Systems Principles', '21CSE203', 'CSE', 'B.Tech CSE-B (Sem 4)', false, 'Dr. P. Venkataraman'),
    ('AB2-105', 'Monday', '10:45:00', '12:25:00', 3, 'Digital Signal Processing', '21ECE204', 'ECE', 'B.Tech ECE-A (Sem 4)', false, 'Dr. S. Radhakrishnan'),
    ('AB3-305', 'Monday', '08:45:00', '10:30:00', 1, 'Deep Learning Foundations', '22AIE301', 'AI & DS', 'B.Tech AIE (Sem 6)', false, 'Dr. Anand Kumar')
ON CONFLICT DO NOTHING;

-- 4. LABS
INSERT INTO public.labs (id, name, block, floor, category, capacity)
VALUES
    ('lab-ai-hpc', 'AI & High Performance Computing Lab', 'AB-3', 3, 'Computing & AI', 30),
    ('lab-fablab', 'Digital Fabrication & Prototyping Hub', 'AB-1', 1, 'Fabrication & 3D Print', 25),
    ('lab-iot-robotics', 'IoT, Robotics & Automation Centre', 'AB-2', 2, 'Robotics & Hardware', 35),
    ('lab-pcb-eda', 'PCB Prototyping & Microelectronics Fab', 'AB-1', 2, 'Electronics & EDA', 20),
    ('lab-mech-workshop', 'Mechanical Workshop & Machining Bay', 'AB-2', 0, 'Heavy Machining', 40)
ON CONFLICT (id) DO NOTHING;

-- 5. RESOURCES
INSERT INTO public.resources (id, lab_id, name, kind, status, requires_cert)
VALUES
    ('res-ws-rtx4090-01', 'lab-ai-hpc', 'Dell Precision 7960 (Dual RTX 4090)', 'workstation', 'ok', false),
    ('res-ws-rtx4090-02', 'lab-ai-hpc', 'Dell Precision 7960 (Dual RTX 4090)', 'workstation', 'ok', false),
    ('res-ws-a6000-01', 'lab-ai-hpc', 'NVIDIA RTX A6000 AI Research Rig', 'workstation', 'ok', false),
    ('res-3d-bambu-x1', 'lab-fablab', 'Bambu Lab X1-Carbon Combo (0.4mm nozzle)', 'printer_3d', 'ok', false),
    ('res-3d-prusa-mk4', 'lab-fablab', 'Prusa MK4 High-Speed CoreXY', 'printer_3d', 'ok', false),
    ('res-3d-creality-k1', 'lab-fablab', 'Creality K1 Max High-Volume 3D Printer', 'printer_3d', 'ok', false),
    ('res-laser-boss-65w', 'lab-fablab', 'Boss Laser CO2 65W Precision Cutter', 'laser', 'ok', false),
    ('res-pcb-voltera-v2', 'lab-pcb-eda', 'Voltera V-One Conductive Ink PCB Printer', 'pcb_mill', 'ok', false),
    ('res-pcb-bantam-cnc', 'lab-pcb-eda', 'Bantam Tools Desktop Precision PCB Mill', 'pcb_mill', 'ok', false),
    ('res-bench-rf-01', 'lab-pcb-eda', 'Keysight 6GHz Spectrum Analyzer & RF Bench', 'bench', 'ok', false),
    ('res-bench-emb-01', 'lab-iot-robotics', 'Rigol 4-Ch 100MHz Oscilloscope & Logic Analyzer Bench', 'bench', 'ok', false),
    ('res-lathe-jet-1221', 'lab-mech-workshop', 'Jet 1221VS Precision Metal Lathe', 'lathe', 'ok', true),
    ('res-weld-miller-211', 'lab-mech-workshop', 'Miller Millermatic 211 MIG/TIG Welder', 'welding', 'ok', true)
ON CONFLICT (id) DO NOTHING;

-- 6. INVENTORY ITEMS (Sample realistic component drawer stock)
INSERT INTO public.inventory_items (id, lab_id, name, part_no, category, quantity, location, updated_at)
VALUES
    ('inv-res-10k', 'lab-pcb-eda', '10k Ohm 1/4W Metal Film Resistors (Pack of 50)', 'RES-10K-025', 'Passives', 120, 'Drawer D-04 / Bin 12', NOW() - INTERVAL '2 days'),
    ('inv-res-220', 'lab-pcb-eda', '220 Ohm 1/4W Carbon Resistors (Pack of 50)', 'RES-220R-025', 'Passives', 95, 'Drawer D-04 / Bin 01', NOW() - INTERVAL '5 days'),
    ('inv-cap-100uf', 'lab-pcb-eda', '100uF 25V Electrolytic Capacitors', 'CAP-ELEC-100U', 'Passives', 48, 'Drawer D-05 / Bin 08', NOW() - INTERVAL '12 days'),
    ('inv-esp32-s3', 'lab-iot-robotics', 'ESP32-S3-WROOM-1 DevKit Dual Type-C', 'ESP32-S3-N8R8', 'Microcontrollers', 16, 'Drawer R-01 / Tray A', NOW() - INTERVAL '1 day'),
    ('inv-rpi-pico-w', 'lab-iot-robotics', 'Raspberry Pi Pico W with Pre-Soldered Headers', 'SC0918', 'Microcontrollers', 22, 'Drawer R-01 / Tray B', NOW() - INTERVAL '3 days'),
    ('inv-jetson-nano', 'lab-ai-hpc', 'NVIDIA Jetson Orin Nano Developer Kit (8GB)', '945-13766-0005', 'SBC / Edge AI', 6, 'Cabinet HPC-C2', NOW() - INTERVAL '4 days'),
    ('inv-fil-pla-black', 'lab-fablab', 'Polymaker PolyLite PLA 1.75mm Black (1kg spool)', 'PM-PLA-BLK', '3D Print Material', 14, 'Shelf FAB-MAT-01', NOW() - INTERVAL '1 day'),
    ('inv-fil-petg-gry', 'lab-fablab', 'eSUN PETG 1.75mm Grey (1kg spool)', 'ESUN-PETG-GRY', '3D Print Material', 9, 'Shelf FAB-MAT-01', NOW() - INTERVAL '6 days'),
    ('inv-copper-fr4', 'lab-pcb-eda', 'Single-Sided Copper Clad FR4 100x150mm (Pack of 5)', 'FR4-100150-1S', 'Raw PCB', 35, 'Drawer E-02 / Bin 04', NOW() - INTERVAL '40 days'), -- flagged as stale (>30 days)
    ('inv-imu-bno085', 'lab-iot-robotics', 'Adafruit BNO085 9-DOF Orientation IMU Sensor', 'ADA-4754', 'Sensors', 8, 'Drawer S-02 / Tray C', NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- 7. AUDIT LOG (Sample initialization record)
INSERT INTO public.audit_log (action, entity, entity_id, meta)
VALUES
    ('SYSTEM_INIT', 'schema', 'v1.0.0', '{"description": "Database initialized with core Amrita Yukti tables and sample seed data"}'::jsonb);
