/*
 * Create Eduardo Pilepe's confirmed demo Auth user without sending email.
 *
 * PowerShell:
 *   $env:SUPABASE_URL = "https://your-project.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key"
 *   $env:DEMO_USER_PASSWORD = "choose-a-password"
 *   node .\supabase\create-eduardo-pilepe-professor.mjs
 *
 * Never save these values in this file or commit them.
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

const email = 'eduardopilepe@prof.uni.edu.ph';
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
      full_name: 'Eduardo Pilepe'
    }
  })
});

if (!response.ok) {
  const body = await response.text();
  if (response.status === 422 && /already.*(registered|exists)|duplicate/i.test(body)) {
    throw new Error(
      `${email} already exists in Supabase Auth. Do not create it again; run the profile SQL, or use the Auth Admin API to reset its password if needed.`
    );
  }
  throw new Error(`Creating ${email} failed (${response.status}): ${body}`);
}

const result = await response.json();
console.log(`Created confirmed Auth user: ${email}`);
console.log(`Auth user ID (profile foreign key): ${result.id}`);
console.log('Next, run supabase/create-eduardo-pilepe-professor.sql in the SQL Editor.');
