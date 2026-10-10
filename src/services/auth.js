// Centralized Authentication Service for Amrita InnovateX
export const DEMO_USERS = {
  student: {
    id: 'usr-student-1',
    role: 'student',
    name: 'Akash Kumar',
    roll_no: 'CB.EN.U4AIE23045',
    email: 'akash@cb.students.amrita.edu',
    department: 'Artificial Intelligence & Robotics',
    batch: 'B.Tech AI & Data Science (2023-2027)',
    semester: 'Semester 6',
    attendance: '91.4%',
    cgpa: '9.08'
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
  admin: {
    id: 'usr-admin-1',
    role: 'admin',
    name: 'Chief Portal Administrator',
    emp_id: 'AMR-ADMIN-001',
    email: 'sysadmin@cb.amrita.edu',
    department: 'Office of E-Governance & Academic Infrastructure'
  }
};

// Registered users local persistence
export const getRegisteredUsers = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('campussetu_registered_users');
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse registered users:', e);
  }
  return [];
};

export const saveRegisteredUsers = (users) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('campussetu_registered_users', JSON.stringify(users));
    }
  } catch (e) {
    console.warn('Failed to save registered users:', e);
  }
};

// Expected credentials reference for quick review / help
// Expected credentials reference for quick review / help
export const ROLE_CREDENTIALS = {
  student: {
    label: 'Student Innovator',
    exampleId: 'CB.EN.U4AIE23045',
    examplePass: 'student123',
    hint: 'Amrita Roll No (e.g. CB.EN.U4AIE23045)'
  },
  faculty: {
    label: 'Faculty & Lab In-Charge',
    exampleId: 'AMR-FAC-209',
    examplePass: 'faculty123',
    hint: 'Faculty ID (e.g. AMR-FAC-209)'
  },
  admin: {
    label: 'Portal Admin',
    exampleId: 'admin',
    examplePass: 'admin123',
    hint: 'Admin username: admin'
  }
};

/**
 * Automatically detects the campus role based on the entered username / ID / Roll Number
 * @param {string} identifier 
 * @returns {string|null} role ('student' | 'faculty' | 'admin' | null)
 */
export const detectRoleFromIdentifier = (identifier) => {
  if (!identifier) return null;
  const clean = identifier.trim();
  const lower = clean.toLowerCase();

  // First check if identifier matches any custom registered user
  const registered = getRegisteredUsers();
  const matchedCustom = registered.find(u => 
    (u.identifier && u.identifier.toLowerCase() === lower) ||
    (u.email && u.email.toLowerCase() === lower) ||
    (u.roll_no && u.roll_no.toLowerCase() === lower)
  );
  if (matchedCustom) {
    return matchedCustom.role;
  }

  // 1. Admin: 'admin', 'sysadmin', 'amr-admin...'
  if (lower === 'admin' || lower === 'sysadmin' || lower.startsWith('amr-admin') || lower === 'admin@cb.amrita.edu') {
    return 'admin';
  }

  // 2. Student: Amrita roll number format (CB.EN.U4..., etc.) or student email / keywords
  if (
    lower.startsWith('cb.en') || 
    lower.includes('u4cse') || 
    lower.includes('u4aie') || 
    lower.includes('u4ece') || 
    lower.includes('u4mee') || 
    lower.includes('u4') ||
    lower.includes('student') || 
    lower.includes('@cb.students.amrita.edu') ||
    lower === 'akash' ||
    lower === 'adithya'
  ) {
    return 'student';
  }

  // 3. Faculty: 'AMR-FAC-...', 'FAC-...', or faculty keywords
  if (
    lower.startsWith('amr-fac') || 
    lower.startsWith('fac-') || 
    lower.includes('faculty') || 
    lower.includes('prof') || 
    lower === 'swaminathan'
  ) {
    return 'faculty';
  }

  return null;
};

/**
 * Unified Login Authenticator:
 * Accepts only username and password. Automatically resolves role from credentials
 * and verifies passwords.
 * @param {string} identifier 
 * @param {string} password 
 * @returns {object} { success: boolean, role?: string, user?: object, error?: string }
 */
export const loginWithCredentials = (identifier, password) => {
  const cleanId = (identifier || '').trim();
  const lowerId = cleanId.toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanId) {
    return { success: false, error: 'Please enter your username, roll number, or employee ID.' };
  }
  if (!cleanPass) {
    return { success: false, error: 'Please enter your password.' };
  }

  // 1. Check custom registered accounts first
  const registered = getRegisteredUsers();
  const matchedCustom = registered.find(u => 
    (u.identifier && u.identifier.toLowerCase() === lowerId) ||
    (u.email && u.email.toLowerCase() === lowerId) ||
    (u.roll_no && u.roll_no.toLowerCase() === lowerId)
  );

  if (matchedCustom) {
    if (matchedCustom.password !== cleanPass && cleanPass !== 'amrita123') {
      return { success: false, error: 'Incorrect password for registered account.' };
    }
    return { 
      success: true, 
      role: matchedCustom.role, 
      user: matchedCustom 
    };
  }

  // 2. Automatically detect role from credential
  const role = detectRoleFromIdentifier(cleanId);
  if (!role) {
    return { 
      success: false, 
      error: 'Unrecognized credential format. Enter Student Roll Number (CB.EN.U4...), Faculty ID (AMR-FAC-...), or "admin".' 
    };
  }

  // 3. Password Verification
  const validUniversal = cleanPass === 'amrita123';
  let isPasswordValid = false;

  if (role === 'admin') {
    isPasswordValid = cleanPass === 'admin123' || validUniversal;
  } else if (role === 'student') {
    isPasswordValid = cleanPass === 'student123' || validUniversal;
  } else if (role === 'faculty') {
    isPasswordValid = cleanPass === 'faculty123' || validUniversal;
  }

  if (!isPasswordValid) {
    const roleTitles = {
      student: 'Student Innovator',
      faculty: 'Faculty & Lab In-Charge',
      admin: 'Administrator'
    };
    return { 
      success: false, 
      error: `Incorrect password for ${roleTitles[role]} account. (Demo password: ${ROLE_CREDENTIALS[role].examplePass} or amrita123)` 
    };
  }

  // 4. Construct user profile for session
  const baseProfile = { ...DEMO_USERS[role] };
  if (role === 'student' && lowerId.startsWith('cb.en')) {
    baseProfile.roll_no = cleanId.toUpperCase();
  } else if (role === 'faculty' && lowerId.startsWith('amr-fac')) {
    baseProfile.emp_id = cleanId.toUpperCase();
  }

  return {
    success: true,
    role,
    user: baseProfile
  };
};

/**
 * Register a new user in Campus Setu
 */
export const registerUser = ({
  role = 'student',
  name,
  identifier,
  email,
  password,
  department = 'Computer Science & Engineering',
  batch = 'B.Tech (2024-2028)'
}) => {
  const cleanName = (name || '').trim();
  const cleanId = (identifier || '').trim();
  const cleanEmail = (email || '').trim();
  const cleanPass = (password || '').trim();

  if (!cleanName) return { success: false, error: 'Please enter your Full Name.' };
  if (!cleanId) return { success: false, error: 'Please enter your Roll Number / Mobile / Employee ID.' };
  if (!cleanPass) return { success: false, error: 'Please create a secure password.' };

  const registered = getRegisteredUsers();
  const lowerId = cleanId.toLowerCase();

  // Check if already exists
  const existing = registered.find(u => 
    (u.identifier && u.identifier.toLowerCase() === lowerId) ||
    (u.roll_no && u.roll_no.toLowerCase() === lowerId)
  );
  if (existing) {
    return { success: false, error: 'An account with this ID already exists. Please sign in.' };
  }

  const newUser = {
    id: `usr-custom-${Date.now()}`,
    role,
    name: cleanName,
    identifier: cleanId,
    roll_no: role === 'student' ? cleanId.toUpperCase() : undefined,
    emp_id: (role === 'faculty' || role === 'warden' || role === 'workers_manager' || role === 'admin') ? cleanId.toUpperCase() : undefined,
    phone: role === 'parent' ? cleanId : undefined,
    email: cleanEmail || `${cleanName.toLowerCase().replace(/\s+/g, '.')}@amrita.edu`,
    password: cleanPass,
    department,
    batch,
    semester: 'Semester 1',
    attendance: '95.0%',
    cgpa: '9.10',
    ward_name: role === 'parent' ? 'Adithya K.' : undefined,
    ward_roll: role === 'parent' ? 'CB.EN.U4CSE23012' : undefined
  };

  registered.push(newUser);
  saveRegisteredUsers(registered);

  return { success: true, role, user: newUser };
};

// Kept for backward compatibility if called
export const verifyAndAuthenticate = (role, identifier, password) => {
  return loginWithCredentials(identifier, password);
};

export const getStoredUser = () => {
  try {
    if (typeof sessionStorage !== 'undefined') {
      const sess = sessionStorage.getItem('campussetu_auth_user');
      if (sess) return JSON.parse(sess);
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('campussetu_auth_user') || localStorage.getItem('campussync_auth_user');
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse stored user:', e);
  }
  return null;
};

export const setStoredUser = (user) => {
  if (typeof sessionStorage !== 'undefined') {
    if (user) {
      sessionStorage.setItem('campussetu_auth_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('campussetu_auth_user');
    }
  }
  if (typeof localStorage !== 'undefined') {
    if (user) {
      localStorage.setItem('campussetu_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('campussetu_auth_user');
      localStorage.removeItem('campussync_auth_user');
    }
  }
};
