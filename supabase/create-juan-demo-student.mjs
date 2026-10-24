/*
 * Create Juan Dela Cruz's demo Auth user.
 *
 * PowerShell:
 *   $env:SUPABASE_URL = "https://your-project.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key"
 *   $env:DEMO_USER_PASSWORD = "set-a-temporary-password"
 *   node .\supabase\create-juan-demo-student.mjs
 *
 * Never save these values in this file or commit them. After creating the
 * Auth user, run insert-demo-records.sql in the Supabase SQL Editor.
 */

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.DEMO_USER_PASSWORD;

if (!supabaseUrl || !serviceRoleKey || !password) {
  throw new Error(
    'Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and DEMO_USER_PASSWORD before running this script.'
  );
}

const projectUrl = new URL(supabaseUrl);
if (projectUrl.protocol !== 'https:' || !projectUrl.hostname.endsWith('.supabase.co')) {
  throw new Error('SUPABASE_URL must be an HTTPS Supabase project URL.');
}

const email = 'juan.delacruz@university.edu.ph';

const response = await fetch(`${projectUrl.origin}/auth/v1/admin/users`, {
  method: 'POST',
  headers: {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      student_id: '2026-864291',
      full_name: 'Juan Dela Cruz'
    }
  })
});

if (!response.ok) {
  const body = await response.text();
  throw new Error(`Creating ${email} failed (${response.status}): ${body}`);
}

console.log(`Created Auth user: ${email}`);
console.log('Next, run supabase/insert-demo-records.sql in the Supabase SQL Editor.');
