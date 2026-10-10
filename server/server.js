import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Supabase if credentials are present
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Connected to Supabase Cloud Database at:', supabaseUrl);
  } catch (err) {
    console.warn('⚠️ Supabase initialization error, falling back to local store:', err.message);
  }
} else {
  console.log('ℹ️ Running in Local In-Memory Fallback mode. Add SUPABASE_URL & SUPABASE_KEY to .env for direct cloud sync.');
}

// -----------------------------------------------------------------------------
// LOCAL STATE STORE (Acts as reliable zero-fail fallback & mock engine)
// -----------------------------------------------------------------------------
const state = {
  settings: {
    id: 'campus_config',
    campus_name: 'Amrita Vishwa Vidyapeetham — Coimbatore',
    active_semester: 'Even Semester 2026',
    flag_threshold: 2,
    banner_message: '📢 Real-time Classroom & Lab Occupancy live. If an unscheduled batch has occupied a room, report it to alert peers!',
    banner_active: true,
    allow_student_reporting: true,
    updated_at: new Date().toISOString()
  },

  pages: [
    {
      slug: 'classroom-occupancy',
      title: 'Classroom & Lab Occupancy Locator',
      subtitle: 'Live timetable cross-indexing, vacancy detection, and crowdsourced occupancy reporting',
      badge: 'Live Space Matrix',
      icon_name: 'Compass',
      is_enabled: true,
      display_order: 1
    },
    {
      slug: 'parent-epass',
      title: 'Parent Hostel Visit & Gate E-Pass',
      subtitle: 'Pre-clearance QR fast lane, warden 1-click approvals, and secure digital gate logs',
      badge: 'E-Governance',
      icon_name: 'ShieldCheck',
      is_enabled: true,
      display_order: 2
    },
    {
      slug: 'fablab-desk',
      title: 'AI FabLab Intake Desk',
      subtitle: 'Multi-turn conversational triage for 3D printing & PCB CNC fabrication work orders',
      badge: 'AI Service Desk',
      icon_name: 'Cpu',
      is_enabled: true,
      display_order: 3
    },
    {
      slug: 'admin-portal',
      title: 'Campus Setu Administrative Console',
      subtitle: 'Zero-hardcode dynamic page configuration, timetable management, and report moderation',
      badge: 'Admin Console',
      icon_name: 'Sliders',
      is_enabled: true,
      display_order: 4
    }
  ],

  innovation_bookings: [
    {
      id: 'req-101',
      studentName: 'Akash Kumar',
      studentRoll: 'CB.EN.U4AIE23045',
      labId: 'lab-ai-hpc',
      labName: 'AI & High Performance Computing Lab',
      projectTitle: 'Autonomous Drone Obstacle Avoidance via YOLOv8',
      projectType: 'Computer Vision & Deep Learning',
      requirements: 'Dell Precision RTX 4090 Workstation, PyTorch 2.3, CUDA 12.4',
      slotTime: 'Today 02:00 - 04:30 PM',
      status: 'pending',
      submittedAt: 'Today, 02:45 AM',
      facultyAssigned: 'Dr. K. Swaminathan (AMR-FAC-209)'
    },
    {
      id: 'req-102',
      studentName: 'Meera R.',
      studentRoll: 'CB.EN.U4ECE23048',
      labId: 'lab-vlsi-embedded',
      labName: 'VLSI, Embedded Systems & Circuit Design Lab',
      projectTitle: 'Bio-Sensor Analog Front-End with LM741 & STM32',
      projectType: 'Hardware / Circuit',
      requirements: 'Bench DSO 100MHz, LM741 IC, STM32CubeIDE, Altium Designer',
      slotTime: 'Today 03:00 - 05:00 PM',
      status: 'approved',
      submittedAt: 'Yesterday, 04:15 PM',
      facultyAssigned: 'Dr. Priya M. (AMR-FAC-184)'
    },
    {
      id: 'req-103',
      studentName: 'Gowtham M.',
      studentRoll: 'CB.EN.U4MEE23019',
      labId: 'lab-fablab-proto',
      labName: 'FabLab & Rapid Prototyping Workshop',
      projectTitle: 'Lightweight Hexacopter Arm Bracket (PLA / PETG)',
      projectType: 'Rapid Prototyping',
      requirements: 'Prusa MK4 3D Printer, 85g PETG filament, 2.5h print run',
      slotTime: 'Today 01:00 - 02:30 PM (Idle Gap Matched)',
      status: 'pending',
      submittedAt: 'Today, 01:20 AM',
      facultyAssigned: 'Er. Rajesh V. (AMR-FAC-112)'
    }
  ],

  classrooms: [
    {
      id: 'AB1-101',
      room_number: '101',
      block: 'AB-1',
      floor: 1,
      capacity: 75,
      room_type: 'lecture_hall',
      amenities: ['ac', 'projector', 'power_sockets', 'smart_board'],
      is_flagged: false,
      flag_reason: null,
      flag_count: 0,
      flagged_batch: null,
      flagged_department: null,
      flagged_purpose: null,
      last_flagged_at: null
    },
    {
      id: 'AB1-102',
      room_number: '102',
      block: 'AB-1',
      floor: 1,
      capacity: 75,
      room_type: 'lecture_hall',
      amenities: ['projector', 'power_sockets'],
      is_flagged: false,
      flag_reason: null,
      flag_count: 0,
      flagged_batch: null,
      flagged_department: null,
      flagged_purpose: null,
      last_flagged_at: null
    },
    {
      id: 'AB1-204',
      room_number: '204',
      block: 'AB-1',
      floor: 2,
      capacity: 80,
      room_type: 'lecture_hall',
      amenities: ['ac', 'projector', 'power_sockets', 'mic_audio'],
      is_flagged: true,
      flag_reason: 'Reported occupied ≥2 times this week for unscheduled remedial coding sessions.',
      flag_count: 3,
      flagged_batch: 'CSE-B (3rd Year)',
      flagged_department: 'Computer Science & Engineering',
      flagged_purpose: 'Unscheduled Remedial Coding Practice',
      last_flagged_at: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'AB1-205',
      room_number: '205',
      block: 'AB-1',
      floor: 2,
      capacity: 60,
      room_type: 'lecture_hall',
      amenities: ['projector', 'power_sockets'],
      is_flagged: false,
      flag_reason: null,
      flag_count: 1,
      flagged_batch: null,
      flagged_department: null,
      flagged_purpose: null,
      last_flagged_at: null
    },
    {
      id: 'AB2-108',
      room_number: '108 (Project Pod)',
      block: 'AB-2',
      floor: 1,
      capacity: 35,
      room_type: 'project_room',
      amenities: ['ac', 'power_sockets', 'smart_board', 'wifi_6'],
      is_flagged: false,
      flag_reason: null,
      flag_count: 0,
      flagged_batch: null,
      flagged_department: null,
      flagged_purpose: null,
      last_flagged_at: null
    },
    {
      id: 'AB2-210',
      room_number: '210 (IoT Hardware Lab)',
      block: 'AB-2',
      floor: 2,
      capacity: 50,
      room_type: 'lab_electronics',
      amenities: ['ac', 'power_sockets', 'oscilloscope', 'pcb_stations'],
      is_flagged: false,
      flag_reason: null,
      flag_count: 0,
      flagged_batch: null,
      flagged_department: null,
      flagged_purpose: null,
      last_flagged_at: null
    },
    {
      id: 'AB3-301',
      room_number: '301',
      block: 'AB-3',
      floor: 3,
      capacity: 90,
      room_type: 'lecture_hall',
      amenities: ['ac', 'projector', 'power_sockets', 'tiered_seating'],
      is_flagged: false,
      flag_reason: null,
      flag_count: 0,
      flagged_batch: null,
      flagged_department: null,
      flagged_purpose: null,
      last_flagged_at: null
    },
    {
      id: 'AB3-305',
      room_number: '305 (AI & Deep Learning Lab)',
      block: 'AB-3',
      floor: 3,
      capacity: 60,
      room_type: 'lab_computer',
      amenities: ['ac', 'high_gpu_workstations', 'power_sockets', 'lan_gigabit'],
      is_flagged: false,
      flag_reason: null,
      flag_count: 1,
      flagged_batch: null,
      flagged_department: null,
      flagged_purpose: null,
      last_flagged_at: null
    },
    {
      id: 'AB3-402',
      room_number: '402',
      block: 'AB-3',
      floor: 4,
      capacity: 70,
      room_type: 'lecture_hall',
      amenities: ['projector', 'power_sockets'],
      is_flagged: false,
      flag_reason: null,
      flag_count: 0,
      flagged_batch: null,
      flagged_department: null,
      flagged_purpose: null,
      last_flagged_at: null
    },
    {
      id: 'CIR-SEM1',
      room_number: 'Seminar Hall 1',
      block: 'CIR',
      floor: 1,
      capacity: 150,
      room_type: 'seminar_hall',
      amenities: ['ac', 'dual_projectors', 'mic_audio', 'surround_sound'],
      is_flagged: false,
      flag_reason: null,
      flag_count: 0,
      flagged_batch: null,
      flagged_department: null,
      flagged_purpose: null,
      last_flagged_at: null
    }
  ],

  timetables: [
    {
      id: 'tt-1',
      room_id: 'AB1-101',
      day_of_week: 'Monday',
      start_time: '08:45',
      end_time: '09:35',
      slot_number: 1,
      subject_name: 'Data Structures & Algorithms',
      subject_code: '21CSE201',
      department: 'CSE',
      batch: 'B.Tech CSE-A (Sem 4)',
      is_lab: false,
      faculty_name: 'Dr. K. Swaminathan'
    },
    {
      id: 'tt-2',
      room_id: 'AB1-101',
      day_of_week: 'Monday',
      start_time: '09:40',
      end_time: '10:30',
      slot_number: 2,
      subject_name: 'Discrete Mathematics',
      subject_code: '21MAT204',
      department: 'Mathematics',
      batch: 'B.Tech CSE-A (Sem 4)',
      is_lab: false,
      faculty_name: 'Prof. S. Ranganathan'
    },
    {
      id: 'tt-3',
      room_id: 'AB1-101',
      day_of_week: 'Monday',
      start_time: '10:45',
      end_time: '11:35',
      slot_number: 3,
      subject_name: 'Computer Architecture',
      subject_code: '21CSE205',
      department: 'CSE',
      batch: 'B.Tech CSE-A (Sem 4)',
      is_lab: false,
      faculty_name: 'Dr. V. Priya'
    },
    {
      id: 'tt-4',
      room_id: 'AB1-204',
      day_of_week: 'Monday',
      start_time: '13:30',
      end_time: '16:15',
      slot_number: 6,
      subject_name: 'Cloud Computing Lab',
      subject_code: '21CSE318',
      department: 'CSE',
      batch: 'B.Tech CSE-B (Sem 6)',
      is_lab: true,
      faculty_name: 'Dr. M. Suresh'
    },
    {
      id: 'tt-5',
      room_id: 'AB3-305',
      day_of_week: 'Monday',
      start_time: '08:45',
      end_time: '11:35',
      slot_number: 1,
      subject_name: 'Deep Learning & Neural Networks Lab',
      subject_code: '21AID302',
      department: 'AI & DS',
      batch: 'B.Tech AI-DS (Sem 6)',
      is_lab: true,
      faculty_name: 'Dr. Anand Kumar'
    },
    {
      id: 'tt-6',
      room_id: 'AB3-305',
      day_of_week: 'Monday',
      start_time: '13:30',
      end_time: '15:20',
      slot_number: 5,
      subject_name: 'Natural Language Processing',
      subject_code: '21AID305',
      department: 'AI & DS',
      batch: 'B.Tech AI-DS (Sem 6)',
      is_lab: false,
      faculty_name: 'Dr. Deepa S.'
    },
    {
      id: 'tt-7',
      room_id: 'AB2-210',
      day_of_week: 'Monday',
      start_time: '10:45',
      end_time: '12:35',
      slot_number: 3,
      subject_name: 'Embedded Systems & Sensor Lab',
      subject_code: '21ECE304',
      department: 'ECE',
      batch: 'B.Tech ECE-A (Sem 6)',
      is_lab: true,
      faculty_name: 'Dr. Ramesh Babu'
    }
  ],

  reports: [
    {
      id: 'rep-1',
      room_id: 'AB1-204',
      report_type: 'unscheduled_occupancy',
      reported_batch: 'CSE-B (3rd Year)',
      reported_department: 'Computer Science & Engineering',
      is_lab_class: false,
      purpose: 'Unscheduled Remedial Coding Test',
      occupancy_level: 'Full',
      reporter_name: 'Adithya K. (S6 CSE)',
      reporter_roll_no: 'CB.EN.U4CSE23012',
      reporter_role: 'student',
      status: 'active',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'rep-2',
      room_id: 'AB1-204',
      report_type: 'unscheduled_occupancy',
      reported_batch: 'CSE-B (3rd Year)',
      reported_department: 'Computer Science & Engineering',
      is_lab_class: true,
      purpose: 'Extra Practical Session',
      occupancy_level: 'Full',
      reporter_name: 'Meera Nair',
      reporter_roll_no: 'CB.EN.U4CSE23045',
      reporter_role: 'student',
      status: 'active',
      created_at: new Date(Date.now() - 3600000 * 28).toISOString()
    },
    {
      id: 'rep-3',
      room_id: 'AB1-205',
      report_type: 'class_cancelled_empty',
      reported_batch: 'Mech-A 2nd Yr',
      reported_department: 'Mechanical',
      is_lab_class: false,
      purpose: 'Class was cancelled by faculty, room is completely free!',
      occupancy_level: 'Empty',
      reporter_name: 'Siddharth M.',
      reporter_roll_no: 'CB.EN.U4ME24018',
      reporter_role: 'student',
      status: 'active',
      created_at: new Date(Date.now() - 1800000).toISOString()
    }
  ]
};

// -----------------------------------------------------------------------------
// HELPER: Compute Live Status for a Room given day and time
// -----------------------------------------------------------------------------
function computeRoomStatus(room, day, timeStr, reports, timetables) {
  const roomReports = reports.filter(r => r.room_id === room.id && r.status === 'active');
  const emptyReport = roomReports.find(r => r.report_type === 'class_cancelled_empty');
  const unscheduledReports = roomReports.filter(r => r.report_type === 'unscheduled_occupancy' || r.report_type === 'event_occupied');

  const roomTimetables = timetables.filter(t => t.room_id === room.id && t.day_of_week === day);
  const currentSlot = roomTimetables.find(t => {
    return timeStr >= t.start_time && timeStr <= t.end_time;
  });

  const upcomingSlots = roomTimetables
    .filter(t => t.start_time > timeStr)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
  const nextSlot = upcomingSlots[0] || null;

  let status = 'available';
  let badgeText = 'Available Now';
  let currentSession = null;
  let flagAlert = null;

  if (room.is_flagged || unscheduledReports.length >= 2) {
    status = 'flagged_occupied';
    badgeText = 'Flagged: Frequently Taken Unscheduled';
    const latestRep = unscheduledReports[0] || {};
    flagAlert = {
      is_flagged: true,
      reason: room.flag_reason || 'Reported occupied ≥ 2 times this week without timetable schedule.',
      count: Math.max(room.flag_count, unscheduledReports.length),
      batch: room.flagged_batch || latestRep.reported_batch || 'Unspecified Batch',
      department: room.flagged_department || latestRep.reported_department || 'Unspecified Dept',
      purpose: room.flagged_purpose || latestRep.purpose || 'Unscheduled Class / Lab Activity',
      is_lab: latestRep.is_lab_class || false
    };
  } else if (unscheduledReports.length === 1) {
    status = 'reported_occupied';
    badgeText = 'Reported Occupied';
    const rep = unscheduledReports[0];
    currentSession = {
      subject_name: rep.purpose,
      department: rep.reported_department,
      batch: rep.reported_batch,
      is_lab: rep.is_lab_class,
      is_unscheduled: true,
      reported_at: rep.created_at
    };
  } else if (emptyReport) {
    status = 'available';
    badgeText = 'Reported Free (Class Cancelled)';
  } else if (currentSlot) {
    status = 'occupied';
    badgeText = currentSlot.is_lab ? 'Occupied (Lab Class)' : 'Occupied (Lecture)';
    currentSession = currentSlot;
  } else {
    status = 'available';
    badgeText = 'Available Now';
  }

  return {
    ...room,
    status,
    badgeText,
    currentSession,
    nextSlot,
    flagAlert,
    active_reports_count: roomReports.length,
    recent_reports: roomReports.slice(0, 3)
  };
}

// -----------------------------------------------------------------------------
// EXPRESS ROUTER (Mounted on both /api and / for seamless Vercel compatibility)
// -----------------------------------------------------------------------------
const router = express.Router();

// 1. Health & Config Status
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabase_connected: Boolean(supabase),
    total_classrooms: state.classrooms.length,
    total_timetables: state.timetables.length,
    total_reports: state.reports.length
  });
});

// 2. Settings
router.get('/settings', async (req, res) => {
  if (supabase) {
    const { data, error } = await supabase.from('portal_settings').select('*').single();
    if (!error && data) return res.json(data);
  }
  res.json(state.settings);
});

router.put('/settings', async (req, res) => {
  state.settings = { ...state.settings, ...req.body, updated_at: new Date().toISOString() };
  if (supabase) {
    await supabase.from('portal_settings').upsert(state.settings);
  }
  res.json({ success: true, settings: state.settings });
});

// 3. Dynamic Portal Pages (Admin CMS)
router.get('/pages', async (req, res) => {
  if (supabase) {
    const { data, error } = await supabase.from('portal_pages').select('*').order('display_order', { ascending: true });
    if (!error && data && data.length > 0) return res.json(data);
  }
  res.json(state.pages);
});

router.put('/pages/:slug', async (req, res) => {
  const { slug } = req.params;
  const idx = state.pages.findIndex(p => p.slug === slug);
  if (idx !== -1) {
    state.pages[idx] = { ...state.pages[idx], ...req.body, updated_at: new Date().toISOString() };
    if (supabase) {
      await supabase.from('portal_pages').upsert(state.pages[idx]);
    }
    return res.json({ success: true, page: state.pages[idx] });
  }
  res.status(404).json({ error: 'Page slug not found' });
});

// 4. Classrooms with Live Occupancy Calculation
router.get('/classrooms', async (req, res) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const day = req.query.day || days[now.getDay()] || 'Monday';
  
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeStr = req.query.time || `${hours}:${minutes}`;

  let classroomsList = state.classrooms;
  let timetablesList = state.timetables;
  let reportsList = state.reports;

  if (supabase) {
    try {
      const [roomsRes, ttRes, repRes] = await Promise.all([
        supabase.from('classrooms').select('*'),
        supabase.from('timetables').select('*'),
        supabase.from('occupancy_reports').select('*')
      ]);
      if (!roomsRes.error && roomsRes.data) classroomsList = roomsRes.data;
      if (!ttRes.error && ttRes.data) timetablesList = ttRes.data;
      if (!repRes.error && repRes.data) reportsList = repRes.data;
    } catch (e) {
      console.warn('Supabase fetch failed, using local state:', e.message);
    }
  }

  const enrichedClassrooms = classroomsList.map(room => 
    computeRoomStatus(room, day, timeStr, reportsList, timetablesList)
  );

  res.json({
    simulated_context: { day, time: timeStr },
    classrooms: enrichedClassrooms
  });
});

// 5. Admin Classroom CRUD
router.post('/admin/classrooms', async (req, res) => {
  const newRoom = {
    id: req.body.id || `${req.body.block.replace(/[^A-Za-z0-9]/g, '')}-${req.body.room_number}`,
    room_number: req.body.room_number,
    block: req.body.block,
    floor: Number(req.body.floor) || 1,
    capacity: Number(req.body.capacity) || 60,
    room_type: req.body.room_type || 'lecture_hall',
    amenities: req.body.amenities || ['projector', 'power_sockets'],
    is_flagged: false,
    flag_reason: null,
    flag_count: 0,
    flagged_batch: null,
    flagged_department: null,
    flagged_purpose: null,
    last_flagged_at: null,
    created_at: new Date().toISOString()
  };

  const existingIdx = state.classrooms.findIndex(r => r.id === newRoom.id);
  if (existingIdx !== -1) {
    state.classrooms[existingIdx] = { ...state.classrooms[existingIdx], ...newRoom };
  } else {
    state.classrooms.push(newRoom);
  }

  if (supabase) {
    await supabase.from('classrooms').upsert(newRoom);
  }

  res.json({ success: true, classroom: newRoom });
});

router.delete('/admin/classrooms/:id', async (req, res) => {
  const { id } = req.params;
  state.classrooms = state.classrooms.filter(r => r.id !== id);
  state.timetables = state.timetables.filter(t => t.room_id !== id);
  state.reports = state.reports.filter(r => r.room_id !== id);

  if (supabase) {
    await supabase.from('classrooms').delete().eq('id', id);
  }
  res.json({ success: true, deletedId: id });
});

router.post('/admin/classrooms/:id/unflag', async (req, res) => {
  const { id } = req.params;
  const room = state.classrooms.find(r => r.id === id);
  if (room) {
    room.is_flagged = false;
    room.flag_reason = null;
    room.flag_count = 0;
    room.flagged_batch = null;
    room.flagged_department = null;
    room.flagged_purpose = null;
    room.last_flagged_at = null;

    state.reports.forEach(rep => {
      if (rep.room_id === id) rep.status = 'resolved';
    });

    if (supabase) {
      await supabase.from('classrooms').update({
        is_flagged: false,
        flag_reason: null,
        flag_count: 0,
        flagged_batch: null,
        flagged_department: null,
        flagged_purpose: null,
        last_flagged_at: null
      }).eq('id', id);
      await supabase.from('occupancy_reports').update({ status: 'resolved' }).eq('room_id', id);
    }

    return res.json({ success: true, message: `Room ${id} flag cleared successfully` });
  }
  res.status(404).json({ error: 'Classroom not found' });
});

// 6. Timetables CRUD
router.get('/timetables', (req, res) => {
  const { roomId } = req.query;
  if (roomId) {
    return res.json(state.timetables.filter(t => t.room_id === roomId));
  }
  res.json(state.timetables);
});

router.post('/admin/timetables', async (req, res) => {
  const newEntry = {
    id: req.body.id || `tt-${Date.now()}`,
    room_id: req.body.room_id,
    day_of_week: req.body.day_of_week || 'Monday',
    start_time: req.body.start_time,
    end_time: req.body.end_time,
    slot_number: Number(req.body.slot_number) || 1,
    subject_name: req.body.subject_name,
    subject_code: req.body.subject_code || '',
    department: req.body.department,
    batch: req.body.batch,
    is_lab: Boolean(req.body.is_lab),
    faculty_name: req.body.faculty_name || 'Faculty In-Charge'
  };

  const existingIdx = state.timetables.findIndex(t => t.id === newEntry.id);
  if (existingIdx !== -1) {
    state.timetables[existingIdx] = newEntry;
  } else {
    state.timetables.push(newEntry);
  }

  if (supabase) {
    await supabase.from('timetables').upsert(newEntry);
  }

  res.json({ success: true, timetable: newEntry });
});

router.delete('/admin/timetables/:id', async (req, res) => {
  const { id } = req.params;
  state.timetables = state.timetables.filter(t => t.id !== id);
  if (supabase) {
    await supabase.from('timetables').delete().eq('id', id);
  }
  res.json({ success: true, deletedId: id });
});

// 7. Crowdsourced Occupancy Reports & Dynamic Flagging
router.get('/reports', (req, res) => {
  res.json(state.reports);
});

router.post('/reports', async (req, res) => {
  const {
    room_id,
    report_type = 'unscheduled_occupancy',
    reported_batch = 'Unspecified Batch',
    reported_department = 'General',
    is_lab_class = false,
    purpose = 'Occupied without timetable schedule',
    occupancy_level = 'Full',
    reporter_name = 'Student',
    reporter_roll_no = '',
    reporter_role = 'student'
  } = req.body;

  if (!room_id) {
    return res.status(400).json({ error: 'room_id is required' });
  }

  const newReport = {
    id: `rep-${Date.now()}`,
    room_id,
    report_type,
    reported_batch,
    reported_department,
    is_lab_class: Boolean(is_lab_class),
    purpose,
    occupancy_level,
    reporter_name,
    reporter_roll_no,
    reporter_role,
    status: 'active',
    created_at: new Date().toISOString()
  };

  state.reports.unshift(newReport);

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentReportsForRoom = state.reports.filter(r => 
    r.room_id === room_id && 
    (r.report_type === 'unscheduled_occupancy' || r.report_type === 'event_occupied') &&
    new Date(r.created_at).getTime() >= oneWeekAgo &&
    r.status === 'active'
  );

  const threshold = state.settings.flag_threshold || 2;
  let newlyFlagged = false;

  const targetRoom = state.classrooms.find(r => r.id === room_id);
  if (targetRoom) {
    targetRoom.flag_count = recentReportsForRoom.length;
    if (recentReportsForRoom.length >= threshold) {
      targetRoom.is_flagged = true;
      targetRoom.flag_reason = `Reported occupied ${recentReportsForRoom.length} times this week by unscheduled batch.`;
      targetRoom.flagged_batch = reported_batch;
      targetRoom.flagged_department = reported_department;
      targetRoom.flagged_purpose = purpose;
      targetRoom.last_flagged_at = new Date().toISOString();
      newlyFlagged = true;
      console.log(`🚨 Auto-flagged room ${room_id} (Count: ${recentReportsForRoom.length})`);
    }
  }

  if (supabase) {
    try {
      await supabase.from('occupancy_reports').insert(newReport);
      if (targetRoom && newlyFlagged) {
        await supabase.from('classrooms').update({
          is_flagged: true,
          flag_reason: targetRoom.flag_reason,
          flag_count: targetRoom.flag_count,
          flagged_batch: targetRoom.flagged_batch,
          flagged_department: targetRoom.flagged_department,
          flagged_purpose: targetRoom.flagged_purpose,
          last_flagged_at: targetRoom.last_flagged_at
        }).eq('id', room_id);
      }
    } catch (e) {
      console.warn('Supabase report sync failed:', e.message);
    }
  }

  res.json({
    success: true,
    report: newReport,
    total_active_reports: recentReportsForRoom.length,
    threshold,
    is_permanently_flagged: targetRoom ? targetRoom.is_flagged : false
  });
});

router.post('/admin/reports/:id/resolve', async (req, res) => {
  const { id } = req.params;
  const { action = 'resolve' } = req.body;
  const rep = state.reports.find(r => r.id === id);
  if (rep) {
    rep.status = action === 'dismiss' ? 'dismissed' : 'resolved';
    if (supabase) {
      await supabase.from('occupancy_reports').update({ status: rep.status }).eq('id', id);
    }
    return res.json({ success: true, report: rep });
  }
  res.status(404).json({ error: 'Report not found' });
});

// -----------------------------------------------------------------------------
// INNOVATION FACILITY BOOKINGS (Synchronizes Student Requests & Faculty Approvals)
// -----------------------------------------------------------------------------
router.get('/innovation/bookings', (req, res) => {
  res.json({
    success: true,
    bookings: state.innovation_bookings || []
  });
});

router.post('/innovation/bookings', (req, res) => {
  const newBooking = req.body;
  if (!newBooking || !newBooking.labId) {
    return res.status(400).json({ error: 'Missing booking details' });
  }
  const booking = {
    id: newBooking.id || `req-${Date.now()}`,
    status: 'pending',
    submittedAt: 'Just now',
    ...newBooking
  };
  state.innovation_bookings = [booking, ...(state.innovation_bookings || [])];
  res.json({ success: true, booking });
});

router.patch('/innovation/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const idx = (state.innovation_bookings || []).findIndex(b => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  state.innovation_bookings[idx] = {
    ...state.innovation_bookings[idx],
    status: status || state.innovation_bookings[idx].status
  };
  res.json({ success: true, booking: state.innovation_bookings[idx] });
});

// -----------------------------------------------------------------------------
// OMNIROUTE AI INTEGRATION (Model: 'vag', Endpoint: http://localhost:20128/v1)
// -----------------------------------------------------------------------------
router.post('/ai/chat', async (req, res) => {
  try {
    const { messages, userRole, userName } = req.body;
    const omniBase = process.env.OMNIROUTE_BASE_URL || 'http://localhost:20128/v1';
    const model = process.env.OMNIROUTE_MODEL || 'vag';
    const apiKey = process.env.OMNIROUTE_API_KEY || 'sk-omniroute';

    const systemPrompt = `You are "Amrita InnovateX AI", the intelligent facility operating system for Amrita Vishwa Vidyapeetham Coimbatore Campus.
Your goal is to converse with students and faculty, analyze project requirements, suggest optimal campus labs and machines, verify component stocks and software toolchains, and seamlessly help book facilities without requiring manual form filling.

Campus Innovation Facilities:
1. "AI & High Performance Computing Lab" (AB-3, Room 304, In-Charge: Dr. K. Swaminathan).
   - Workstations: 30x Dell Precision i9, 64GB RAM, RTX 4090 (24GB VRAM), NVIDIA DGX A100 Cluster.
   - Toolchains: PyTorch 2.3, TensorFlow 2.16, CUDA 12.4, Ubuntu 22.04 LTS, ROS 2 Humble, MATLAB 2024a.
   - Best for: Deep Learning, Computer Vision, LLMs, AI Robotics, Big Data, Autonomous Systems.
   - Available slots: "09:00 - 11:00 AM", "02:00 - 04:30 PM", "05:00 - 08:00 PM (Late Innovator Slot)".

2. "VLSI, Embedded Systems & Circuit Design Lab" (AB-1, Room 212, In-Charge: Dr. Priya M.).
   - Equipment: Tektronix 100MHz 4-Ch DSO, Rigol Waveform Gen, Keysight 3GHz Spectrum Analyzer, SMD Rework Stations.
   - Toolchains: Cadence Virtuoso, Xilinx Vivado 2023.2, Altium Designer 24, KiCad 8.0, Keil uVision 5, STM32CubeIDE.
   - Bench Stock: LM741 Op-Amps (120 in stock, Drawer #4), NE555 Timers (85 in stock), STM32F401 Black Pill MCUs (24 available), ESP32-WROOM-32 (35 available), Xilinx Spartan-7 FPGA (15 available), 10k Resistors, 100uF Capacitors.
   - Best for: Analog Circuits, FPGA / Verilog Synthesis, Biomedical Sensors, IoT Hardware, PCB Design.
   - Available slots: "11:30 AM - 01:30 PM", "03:00 - 05:00 PM", "05:30 - 07:30 PM".

3. "FabLab & Rapid Prototyping Workshop" (TBI Central Tech Bay, Ground Floor, In-Charge: Er. Rajesh V.).
   - Equipment: 4x Prusa MK4 3D Printers (PLA/PETG), Formlabs Form 3+ SLA Resin, Epilog 60W CO2 Laser Cutter, Bantam Tools Desktop PCB CNC.
   - Raw Materials: PLA 1.75mm (18 spools in stock), PETG High-Tensile (6 spools), FR4 Copper Clads (45 pcs), Acrylic sheets.
   - Toolchains: Autodesk Fusion 360, SolidWorks 2024, PrusaSlicer, LightBurn.
   - Best for: Drone Frames, Chassis, Enclosures, Robotic Grippers, Custom PCB Milling.
   - Available slots: "01:00 - 02:30 PM (Idle Gap Match)", "04:00 - 06:30 PM".

4. "IoT & Autonomous Robotics Sandbox" (AB-3, Room 118, In-Charge: Dr. Murali Mohan).
   - Equipment: Robotics Drone Flight Cage, TurtleBot 4 ROS2 Rovers, LoRaWAN Gateway & RF Anechoic Chamber.
   - Bench Stock: LoRa SX1278 Modules (30 in stock), L298N Motor Drivers, Raspberry Pi 4 (4GB), LiPo 3S 2200mAh Batteries.
   - Best for: Swarm Robotics, ROS 2 Navigation, LoRaWAN IoT, Smart Agriculture.
   - Available slots: "10:00 - 12:00 PM", "02:00 - 04:00 PM", "04:30 - 07:00 PM".

Interaction Rules:
- Be concise, friendly, and practical.
- If the user describes their project or components (e.g. "I want to train a model" or "I am building an ECG circuit"), determine which lab is the best match, summarize the hardware/software specs that match, confirm stock, and suggest an available slot.
- Include a structured JSON block in your response if you are recommending a specific facility booking action, using this exact format:
\`\`\`json
{
  "recommendedLabId": "lab-ai-hpc" | "lab-vlsi-embedded" | "lab-fablab-proto" | "lab-iot-robotics",
  "recommendedLabName": "Name of Lab",
  "recommendedSlot": "Selected Slot Time",
  "detectedSpecs": ["Item 1", "Item 2"],
  "readyToBook": true
}
\`\`\`
- Keep text informative and professional with Amrita campus context.`;

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...(messages || []).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }))
    ];

    const response = await fetch(`${omniBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('OmniRoute error response:', response.status, errText);
      return res.status(502).json({ error: 'OmniRoute error', details: errText });
    }

    const data = await response.json();
    const replyContent = data.choices?.[0]?.message?.content || 'I have analyzed your request.';

    return res.json({
      success: true,
      model,
      reply: replyContent
    });
  } catch (err) {
    console.error('Error proxying to OmniRoute:', err.message);
    res.status(500).json({ error: 'Failed to reach OmniRoute AI', message: err.message });
  }
});

// Mount router on BOTH '/api' AND '/' for zero-friction Vercel & local development
app.use('/api', router);
app.use('/', router);

// Start standalone server only when run directly (not when imported as a serverless function)
const isDirectExecution = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectExecution || (!process.env.VERCEL && process.env.NODE_ENV !== 'production')) {
  app.listen(PORT, () => {
    console.log(`🚀 Campus Setu Node.js Backend Server running on http://localhost:${PORT}`);
  });
}

export default app;
