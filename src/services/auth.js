// Centralized Authentication Service for Campus Setu
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

// Expected credentials reference for each role
export const ROLE_CREDENTIALS = {
  student: {
    exampleId: 'CB.EN.U4CSE23012',
    examplePass: 'student123',
    hint: 'Student Roll No (e.g. CB.EN.U4CSE23012)'
  },
  parent: {
    exampleId: '9840123456',
    examplePass: 'parent123',
    hint: 'Registered 10-digit Mobile (e.g. 9840123456)'
  },
  faculty: {
    exampleId: 'AMR-FAC-209',
    examplePass: 'faculty123',
    hint: 'Faculty Employee ID (e.g. AMR-FAC-209)'
  },
  warden: {
    exampleId: 'AMR-WRD-044',
    examplePass: 'warden123',
    hint: 'Warden ID (e.g. AMR-WRD-044)'
  },
  workers_manager: {
    exampleId: 'AMR-MTN-301',
    examplePass: 'worker123',
    hint: 'Facility Manager ID (e.g. AMR-MTN-301)'
  },
  admin: {
    exampleId: 'admin',
    examplePass: 'admin123',
    hint: 'Admin Username (e.g. admin)'
  }
};

// Verifies credentials strictly based on the selected role and input
export const verifyAndAuthenticate = (role, identifier, password) => {
  const cleanId = (identifier || '').trim();
  const lowerId = cleanId.toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanId) {
    return { success: false, error: 'Please enter your ID, Roll number or Username.' };
  }
  if (!cleanPass) {
    return { success: false, error: 'Please enter your password.' };
  }

  // Cross-role safety checks: inform user if they entered credentials of a different role
  if (role !== 'admin' && (lowerId === 'admin' || lowerId.startsWith('amr-admin'))) {
    return {
      success: false,
      error: 'Administrator credentials entered. Please select the "Admin" role card above to sign in.'
    };
  }
  if (role !== 'student' && (lowerId.startsWith('cb.en') || lowerId.includes('u4cse') || lowerId.includes('student'))) {
    return {
      success: false,
      error: 'Student Roll Number entered. Please select the "Student" role card above to sign in.'
    };
  }
  if (role !== 'faculty' && lowerId.startsWith('amr-fac')) {
    return {
      success: false,
      error: 'Faculty Employee ID entered. Please select the "Faculty" role card above to sign in.'
    };
  }
  if (role !== 'warden' && lowerId.startsWith('amr-wrd')) {
    return {
      success: false,
      error: 'Warden ID entered. Please select the "Warden" role card above to sign in.'
    };
  }
  if (role !== 'workers_manager' && lowerId.startsWith('amr-mtn')) {
    return {
      success: false,
      error: 'Workers Manager ID entered. Please select the "Workers Mgr" role card above to sign in.'
    };
  }
  if (role !== 'parent' && /^[6-9]\d{9}$/.test(lowerId)) {
    return {
      success: false,
      error: 'Parent phone number entered. Please select the "Parent" role card above to sign in.'
    };
  }

  // Role-specific verification:
  if (role === 'student') {
    const isStudentFormat = lowerId.includes('cb.en') || lowerId.includes('u4') || lowerId === 'adithya' || lowerId === 'student';
    if (!isStudentFormat) {
      return { 
        success: false, 
        error: 'Invalid Student Roll Number format. Expected format: CB.EN.U4CSE23012' 
      };
    }
    if (cleanPass !== 'student123' && cleanPass !== 'amrita123') {
      return { 
        success: false, 
        error: 'Incorrect password for Student portal. (Demo password: student123 or amrita123)' 
      };
    }
    const user = { ...DEMO_USERS.student };
    if (lowerId.includes('cb.en')) {
      user.roll_no = cleanId.toUpperCase();
    }
    return { success: true, user };
  }

  if (role === 'parent') {
    const isPhone = /^[0-9+\s-]{8,15}$/.test(lowerId) || lowerId === 'parent';
    if (!isPhone) {
      return { 
        success: false, 
        error: 'Invalid Mobile Number. Enter 10-digit mobile number (e.g. 9840123456).' 
      };
    }
    if (cleanPass !== 'parent123' && cleanPass !== 'amrita123') {
      return { 
        success: false, 
        error: 'Incorrect password for Parent portal. (Demo password: parent123 or amrita123)' 
      };
    }
    const user = { ...DEMO_USERS.parent };
    if (/^[0-9]{10}$/.test(lowerId)) {
      user.phone = `+91 ${lowerId.slice(0, 5)} ${lowerId.slice(5)}`;
    }
    return { success: true, user };
  }

  if (role === 'faculty') {
    const isFac = lowerId.startsWith('amr-fac') || lowerId.includes('faculty') || lowerId === 'dr. swaminathan';
    if (!isFac) {
      return { 
        success: false, 
        error: 'Invalid Faculty Employee ID. Expected format: AMR-FAC-209' 
      };
    }
    if (cleanPass !== 'faculty123' && cleanPass !== 'amrita123') {
      return { 
        success: false, 
        error: 'Incorrect password for Faculty portal. (Demo password: faculty123 or amrita123)' 
      };
    }
    return { success: true, user: DEMO_USERS.faculty };
  }

  if (role === 'warden') {
    const isWrd = lowerId.startsWith('amr-wrd') || lowerId.includes('warden');
    if (!isWrd) {
      return { 
        success: false, 
        error: 'Invalid Warden ID. Expected format: AMR-WRD-044' 
      };
    }
    if (cleanPass !== 'warden123' && cleanPass !== 'amrita123') {
      return { 
        success: false, 
        error: 'Incorrect password for Warden portal. (Demo password: warden123 or amrita123)' 
      };
    }
    return { success: true, user: DEMO_USERS.warden };
  }

  if (role === 'workers_manager') {
    const isMtn = lowerId.startsWith('amr-mtn') || lowerId.includes('worker') || lowerId.includes('maintenance');
    if (!isMtn) {
      return { 
        success: false, 
        error: 'Invalid Workers Manager ID. Expected format: AMR-MTN-301' 
      };
    }
    if (cleanPass !== 'worker123' && cleanPass !== 'amrita123') {
      return { 
        success: false, 
        error: 'Incorrect password for Workers Manager portal. (Demo password: worker123 or amrita123)' 
      };
    }
    return { success: true, user: DEMO_USERS.workers_manager };
  }

  if (role === 'admin') {
    const isAdmin = lowerId === 'admin' || lowerId === 'amr-admin-001' || lowerId === 'sysadmin';
    if (!isAdmin) {
      return { 
        success: false, 
        error: 'Invalid Administrator username. Expected: admin' 
      };
    }
    if (cleanPass !== 'admin123') {
      return { 
        success: false, 
        error: 'Incorrect Administrator password. (Demo password: admin123)' 
      };
    }
    return { success: true, user: DEMO_USERS.admin };
  }

  return { success: false, error: 'Unknown campus role selected.' };
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('campussetu_auth_user') || localStorage.getItem('campussync_auth_user');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse stored user:', e);
  }
  return null;
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('campussetu_auth_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('campussetu_auth_user');
    localStorage.removeItem('campussync_auth_user');
  }
};

