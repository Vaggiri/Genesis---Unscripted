import { getSupabaseClient } from './supabaseClient';

const API_BASE = '/api';

/**
 * Standard fetch helper that automatically attaches Supabase JWT Bearer token
 * and handles errors transparently without silent fallbacks.
 */
async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const headers = { ...options.headers };

  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Attach access token from Supabase session if available
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    } catch {
      // Ignore session retrieval errors
    }
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.message || data?.error || `HTTP error ${res.status}`;
    const err = new Error(errorMsg);
    // @ts-ignore
    err.status = res.status;
    // @ts-ignore
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // 1. Health & Status
  async getHealth() {
    return await apiRequest('/health');
  },

  // 2. Settings & CMS
  async getSettings() {
    return await apiRequest('/settings');
  },

  async updateSettings(settings) {
    return await apiRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  async getPages() {
    return await apiRequest('/pages');
  },

  async updatePage(slug, data) {
    return await apiRequest(`/pages/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // 3. Classrooms & Space Radar
  async getClassrooms(day, time) {
    const params = new URLSearchParams();
    if (day) params.append('day', day);
    if (time) params.append('time', time);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await apiRequest(`/classrooms${queryString}`);
  },

  async getTimetables(roomId) {
    const query = roomId ? `?roomId=${roomId}` : '';
    return await apiRequest(`/timetables${query}`);
  },

  async getReports() {
    return await apiRequest('/reports');
  },

  async submitReport(reportData) {
    return await apiRequest('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData)
    });
  },

  // 4. Facility Bookings & Resources (§4.2)
  async getResources(lab) {
    const query = lab ? `?lab=${lab}` : '';
    return await apiRequest(`/resources${query}`);
  },

  async getAvailability(resourceId, date) {
    const params = new URLSearchParams();
    if (resourceId) params.append('resourceId', resourceId);
    if (date) params.append('date', date);
    return await apiRequest(`/availability?${params.toString()}`);
  },

  async suggestBooking(payload) {
    return await apiRequest('/bookings/suggest', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async createBooking(bookingData) {
    return await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  },

  async updateBookingStatus(id, status) {
    return await apiRequest(`/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async checkInBooking(id) {
    return await apiRequest(`/bookings/${id}/checkin`, {
      method: 'POST'
    });
  },

  async getInnovationBookings() {
    return await apiRequest('/innovation/bookings');
  },

  // 5. Inventory & Drawer Stock (§5.1)
  async getInventory(params = {}) {
    const q = new URLSearchParams();
    if (params.lab) q.append('lab', params.lab);
    if (params.search) q.append('search', params.search);
    if (params.category) q.append('category', params.category);
    const str = q.toString() ? `?${q.toString()}` : '';
    return await apiRequest(`/inventory${str}`);
  },

  async importInventory(importData) {
    return await apiRequest('/inventory/import', {
      method: 'POST',
      body: JSON.stringify(importData)
    });
  },

  async getPurchaseRequests() {
    return await apiRequest('/inventory/purchase-requests');
  },

  async createPurchaseRequest(payload) {
    return await apiRequest('/inventory/purchase-requests', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updatePurchaseRequest(id, status) {
    return await apiRequest(`/inventory/purchase-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // 6. Digital Fabrication Jobs (§5.2)
  async getJobs() {
    return await apiRequest('/jobs');
  },

  async createJob(jobData) {
    return await apiRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
  },

  async updateJob(id, updates) {
    return await apiRequest(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  async verifyFileContent(kind, base64Header) {
    return await apiRequest('/jobs/verify-content', {
      method: 'POST',
      body: JSON.stringify({ kind, base64Header })
    });
  },

  // 7. Faculty Free-Room Booking (§7.1)
  async getFreeRooms(date, slot) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (slot) params.append('slot', slot);
    return await apiRequest(`/rooms/free?${params.toString()}`);
  },

  async bookRoom(bookingData) {
    return await apiRequest('/room-bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  },

  async getMyRoomBookings() {
    return await apiRequest('/room-bookings/mine');
  },

  async cancelRoomBooking(id) {
    return await apiRequest(`/room-bookings/${id}`, {
      method: 'DELETE'
    });
  },

  // 8. Chatbot (§6)
  async sendChatMessage(message, preferredLanguage = 'en') {
    return await apiRequest('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, preferredLanguage })
    });
  },

  // 9. Analytics & Utilization (§8.1)
  async getUtilization(from, to) {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const q = params.toString() ? `?${params.toString()}` : '';
    return await apiRequest(`/analytics/utilization${q}`);
  },

  // 10. Admin Console
  async adminAddClassroom(classroom) {
    return await apiRequest('/admin/classrooms', {
      method: 'POST',
      body: JSON.stringify(classroom)
    });
  },

  async adminDeleteClassroom(id) {
    return await apiRequest(`/admin/classrooms/${id}`, {
      method: 'DELETE'
    });
  },

  async adminUnflagClassroom(id) {
    return await apiRequest(`/admin/classrooms/${id}/unflag`, {
      method: 'POST'
    });
  },

  async adminAddTimetable(entry) {
    return await apiRequest('/admin/timetables', {
      method: 'POST',
      body: JSON.stringify(entry)
    });
  },

  async adminDeleteTimetable(id) {
    return await apiRequest(`/admin/timetables/${id}`, {
      method: 'DELETE'
    });
  },

  async adminImportTimetables(entries) {
    return await apiRequest('/admin/timetables/import', {
      method: 'POST',
      body: JSON.stringify({ entries })
    });
  },

  async adminResolveReport(id, action) {
    return await apiRequest(`/admin/reports/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
  },

  async adminGetUsers() {
    return await apiRequest('/admin/users');
  },

  async adminUpdateUserRole(id, role) {
    return await apiRequest(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
  },

  async adminGetAuditLog() {
    return await apiRequest('/admin/audit-log');
  }
};
