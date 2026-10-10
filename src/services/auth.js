// Centralized Authentication Service with Supabase & Demo Profiles
export const DEMO_USERS = {
  student: {
    id: 'usr-student-1',
    role: 'student',
    name: 'Adithya K.',
    roll_no: 'CB.EN.U4CSE23012',
    email: 'adithya@cb.students.amrita.edu',
    department: 'Computer Science & Engineering',
    batch: 'B.Tech CSE-B (2023-2027)',
    semester: 'Semester 6',
    hostel: 'Hostel D, Room 312',
    attendance: '88.4%',
    cgpa: '8.92'
  },
  parent: {
    id: 'usr-parent-1',
    role: 'parent',
    name: 'Lakshmi Narayanan',
    phone: '+91 98401 23456',
    email: 'lakshmi.parent@gmail.com',
    ward_name: 'Adithya K.',
    ward_roll: 'CB.EN.U4CSE23012',
    ward_dept: 'Computer Science & Engineering',
    ward_hostel: 'Hostel D, Room 312'
  },
  faculty: {
    id: 'usr-faculty-1',
    role: 'faculty',
    name: 'Dr. K. Swaminathan',
    emp_id: 'AMR-FAC-209',
    email: 'k_swaminathan@cb.amrita.edu',
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor & Lab In-Charge'
  },
  warden: {
    id: 'usr-warden-1',
    role: 'warden',
    name: 'Murugesh R.',
    emp_id: 'AMR-WRD-044',
    email: 'warden_dblock@cb.amrita.edu',
    hostel_block: 'D-Block (Senior Boys Hostel)',
    phone: '+91 94432 87654'
  },
  workers_manager: {
    id: 'usr-worker-1',
    role: 'workers_manager',
    name: 'Ramesh Kumar',
    emp_id: 'AMR-MTN-301',
    email: 'maintenance_mgr@cb.amrita.edu',
    department: 'Campus Facilities & Lab Maintenance'
  },
  admin: {
    id: 'usr-admin-1',
    role: 'admin',
    name: 'Chief Portal Administrator',
    emp_id: 'AMR-ADMIN-001',
    email: 'sysadmin@cb.amrita.edu',
    department: 'Office of E-Governance & Academic Infrastructure'
  }
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('campussync_auth_user');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse stored user:', e);
  }
  return null;
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('campussync_auth_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('campussync_auth_user');
  }
};
