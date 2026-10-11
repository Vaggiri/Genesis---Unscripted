/**
 * scripts/seed-demo-users.mjs
 * 
 * Creates official demo accounts in Supabase Auth & public.profiles using the Service Role Key.
 * Passwords are read strictly from DEMO_PASSWORD env variable.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const demoPassword = process.env.DEMO_PASSWORD;

if (!demoPassword || demoPassword.length < 12) {
  console.error('❌ Error: set DEMO_PASSWORD (min 12 chars) in .env. No default is provided.');
  process.exit(1);
}

if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('YOUR-PROJECT')) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be provided in .env to seed demo users.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const demoAccounts = [
  {
    email: 'student.demo@cb.students.amrita.edu',
    role: 'student',
    full_name: 'Adithya K.',
    roll_no: 'CB.EN.U4AIE23045',
    department: 'AI & Data Science',
    batch: '2023-2027',
    preferred_language: 'en'
  },
  {
    email: 'faculty.demo@cb.amrita.edu',
    role: 'faculty',
    full_name: 'Dr. K. Swaminathan',
    emp_id: 'AMR-FAC-209',
    department: 'Computer Science & Engineering',
    batch: 'Faculty Staff',
    preferred_language: 'en'
  },
  {
    email: 'incharge.demo@cb.amrita.edu',
    role: 'lab_incharge',
    full_name: 'Er. Rajesh V.',
    emp_id: 'AMR-STAFF-112',
    department: 'Digital Fabrication Hub',
    batch: 'Lab In-Charge',
    preferred_language: 'ta'
  },
  {
    email: 'admin.demo@cb.amrita.edu',
    role: 'admin',
    full_name: 'Prof. Ramachandran N.',
    emp_id: 'AMR-ADM-001',
    department: 'Academic Administration',
    batch: 'System Administrator',
    preferred_language: 'en'
  }
];

async function seed() {
  console.log('🌱 Starting demo user provisioning for Amrita Yukti...');

  for (const acc of demoAccounts) {
    try {
      // 1. Create or get user in Supabase Auth
      const { data: userRes, error: userErr } = await supabase.auth.admin.createUser({
        email: acc.email,
        password: demoPassword,
        email_confirm: true,
        user_metadata: {
          full_name: acc.full_name
        }
      });

      let userId;
      if (userErr) {
        if (userErr.message.includes('already registered')) {
          console.log(`ℹ️  User ${acc.email} already exists in auth.users. Updating password...`);
          const { data: listData } = await supabase.auth.admin.listUsers();
          const existing = listData?.users.find(u => u.email === acc.email);
          if (existing) {
            userId = existing.id;
            await supabase.auth.admin.updateUserById(userId, { password: demoPassword });
          }
        } else {
          console.error(`❌ Failed to create auth user ${acc.email}:`, userErr.message);
          continue;
        }
      } else {
        userId = userRes.user.id;
      }

      // 2. Upsert profile row with designated role
      if (userId) {
        const { error: profErr } = await supabase.from('profiles').upsert({
          id: userId,
          role: acc.role,
          full_name: acc.full_name,
          roll_no: acc.roll_no || '',
          emp_id: acc.emp_id || '',
          department: acc.department,
          batch: acc.batch,
          preferred_language: acc.preferred_language,
          updated_at: new Date().toISOString()
        });

        if (profErr) {
          console.error(`⚠️ Profile sync error for ${acc.email}:`, profErr.message);
        } else {
          console.log(`✅ Provisioned: [${acc.role.toUpperCase()}] ${acc.full_name} (${acc.email})`);
        }
      }
    } catch (e) {
      console.error(`Error processing ${acc.email}:`, e.message);
    }
  }

  console.log('\n✨ Demo user seeding completed successfully.');
  console.log('All demo account passwords set from DEMO_PASSWORD.');
}

seed();
