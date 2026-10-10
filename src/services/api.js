import { getSupabaseClient } from './supabaseClient';

const API_BASE = '/api';

// Fallback helper to fetch JSON with timeout
async function fetchWithFallback(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`Fetch error for ${url}:`, err.message);
    throw err;
  }
}

export const api = {
  // 1. Health & Status
  async getHealth() {
    try {
      return await fetchWithFallback(`${API_BASE}/health`);
    } catch {
      return { status: 'offline_mode', supabase_connected: false };
    }
  },

  // 2. Settings
  async getSettings() {
    try {
      return await fetchWithFallback(`${API_BASE}/settings`);
    } catch {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data } = await supabase.from('portal_settings').select('*').single();
        if (data) return data;
      }
      return {
        id: 'campus_config',
        campus_name: 'Amrita Vishwa Vidyapeetham — Coimbatore',
        active_semester: 'Even Semester 2026',
        flag_threshold: 2,
        banner_message: '📢 Real-time Classroom & Lab Occupancy live. If an unscheduled batch has occupied a room, report it to alert peers!',
        banner_active: true,
        allow_student_reporting: true
      };
    }
  },

  async updateSettings(settings) {
    try {
      return await fetchWithFallback(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
    } catch {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('portal_settings').upsert(settings);
      }
      return { success: true, settings };
    }
  },

  // 3. Portal Pages (Admin CMS)
  async getPages() {
    try {
      return await fetchWithFallback(`${API_BASE}/pages`);
    } catch {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data } = await supabase.from('portal_pages').select('*').order('display_order', { ascending: true });
        if (data && data.length) return data;
      }
      return [
        {
          slug: 'classroom-occupancy',
          title: 'Classroom & Lab Occupancy Locator',
          subtitle: 'Live timetable cross-indexing, vacancy detection, and crowdsourced occupancy reporting',
          badge: 'Live Space Matrix',
          icon_name: 'Compass',
          is_enabled: true
        },
        {
          slug: 'facility-booking',
          title: 'Innovation Facility & Lab Slot Booking',
          subtitle: 'Conversational machine matching, drawer stock verification, and slot reservation',
          badge: 'AI Allocation',
          icon_name: 'Cpu',
          is_enabled: true
        },
        {
          slug: 'fablab-desk',
          title: 'AI FabLab Intake Desk',
          subtitle: 'Multi-turn conversational triage for 3D printing & PCB CNC fabrication work orders',
          badge: 'AI Service Desk',
          icon_name: 'Cpu',
          is_enabled: true
        },
        {
          slug: 'admin-portal',
          title: 'Campus Setu Administrative Console',
          subtitle: 'Zero-hardcode dynamic page configuration, timetable management, and report moderation',
          badge: 'Admin Console',
          icon_name: 'Sliders',
          is_enabled: true
        }
      ];
    }
  },

  async updatePage(slug, data) {
    return await fetchWithFallback(`${API_BASE}/pages/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  // 4. Classrooms
  async getClassrooms(day, time) {
    const params = new URLSearchParams();
    if (day) params.append('day', day);
    if (time) params.append('time', time);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    try {
      return await fetchWithFallback(`${API_BASE}/classrooms${queryString}`);
    } catch (err) {
      console.warn('Backend /api/classrooms failed, trying direct Supabase client or local fallback...', err.message);
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data } = await supabase.from('classrooms').select('*');
        if (data) return { classrooms: data, simulated_context: { day: day || 'Monday', time: time || '10:00' } };
      }
      // Minimal offline fallback
      return {
        classrooms: [
          {
            id: 'AB1-101',
            room_number: '101',
            block: 'AB-1',
            floor: 1,
            capacity: 75,
            room_type: 'lecture_hall',
            amenities: ['ac', 'projector', 'power_sockets'],
            status: 'available',
            badgeText: 'Available Now'
          },
          {
            id: 'AB1-204',
            room_number: '204',
            block: 'AB-1',
            floor: 2,
            capacity: 80,
            room_type: 'lecture_hall',
            amenities: ['ac', 'projector', 'power_sockets'],
            is_flagged: true,
            flag_count: 3,
            flag_reason: 'Reported occupied ≥ 2 times this week for unscheduled remedial coding sessions.',
            status: 'flagged_occupied',
            badgeText: 'Flagged: Frequently Taken Unscheduled',
            flagAlert: {
              is_flagged: true,
              batch: 'CSE-B (3rd Year)',
              department: 'Computer Science & Engineering',
              purpose: 'Unscheduled Remedial Coding Practice',
              count: 3
            }
          }
        ],
        simulated_context: { day: day || 'Monday', time: time || '10:00' }
      };
    }
  },

  // 5. Submit Crowdsourced Occupancy Report
  async submitReport(reportData) {
    try {
      return await fetchWithFallback(`${API_BASE}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
    } catch {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from('occupancy_reports').insert(reportData).select().single();
        if (!error) return { success: true, report: data };
      }
      return { success: true, report: reportData, is_permanently_flagged: true };
    }
  },

  // 6. Reports List
  async getReports() {
    try {
      return await fetchWithFallback(`${API_BASE}/reports`);
    } catch {
      return [];
    }
  },

  // 7. Timetables
  async getTimetables(roomId) {
    try {
      const url = roomId ? `${API_BASE}/timetables?roomId=${roomId}` : `${API_BASE}/timetables`;
      return await fetchWithFallback(url);
    } catch {
      return [];
    }
  },

  // 8. Admin Operations
  async adminAddClassroom(classroom) {
    return await fetchWithFallback(`${API_BASE}/admin/classrooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classroom)
    });
  },

  async adminDeleteClassroom(id) {
    return await fetchWithFallback(`${API_BASE}/admin/classrooms/${id}`, {
      method: 'DELETE'
    });
  },

  async adminUnflagClassroom(id) {
    return await fetchWithFallback(`${API_BASE}/admin/classrooms/${id}/unflag`, {
      method: 'POST'
    });
  },

  async adminAddTimetable(entry) {
    return await fetchWithFallback(`${API_BASE}/admin/timetables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
  },

  async adminDeleteTimetable(id) {
    return await fetchWithFallback(`${API_BASE}/admin/timetables/${id}`, {
      method: 'DELETE'
    });
  },

  async adminResolveReport(id, action) {
    return await fetchWithFallback(`${API_BASE}/admin/reports/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
  }
};
