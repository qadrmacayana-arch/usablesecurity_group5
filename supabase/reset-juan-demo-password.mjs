/*
 * Set a new password for Juan Dela Cruz's demo Auth user.
 *
 * PowerShell:
 *   $env:SUPABASE_URL = "https://your-project.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key"
 *   $env:DEMO_USER_PASSWORD = "your-new-password"
 *   node .\supabase\reset-juan-demo-password.mjs
 *
 * Never save these values in this file or commit them.
 */

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const newPassword = process.env.DEMO_USER_PASSWORD;

if (!supabaseUrl || !serviceRoleKey || !newPassword) {
  throw new Error(
    'Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and DEMO_USER_PASSWORD before running this script.'
  );
}

const projectUrl = new URL(supabaseUrl);
if (projectUrl.protocol !== 'https:' || !projectUrl.hostname.endsWith('.supabase.co')) {
  throw new Error('SUPABASE_URL must be an HTTPS Supabase project URL.');
}

const email = 'juan.delacruz@university.edu.ph';
const headers = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  'Content-Type': 'application/json'
};

let user = null;
const perPage = 1000;

for (let page = 1; ; page += 1) {
  const listResponse = await fetch(
    `${projectUrl.origin}/auth/v1/admin/users?per_page=${perPage}&page=${page}`,
    { headers }
  );

  if (!listResponse.ok) {
    const body = await listResponse.text();
    throw new Error(`Listing Auth users failed (${listResponse.status}): ${body}`);
  }

  const result = await listResponse.json();
  const users = result.users || [];
  user = users.find(candidate => candidate.email?.toLowerCase() === email);

  if (user || users.length < perPage) {
    break;
  }
}

if (!user) {
  throw new Error(`Auth user ${email} was not found. Create the account first.`);
}

const updateResponse = await fetch(
  `${projectUrl.origin}/auth/v1/admin/users/${encodeURIComponent(user.id)}`,
  {
    method: 'PUT',
    headers,
    body: JSON.stringify({ password: newPassword })
  }
);

if (!updateResponse.ok) {
  const body = await updateResponse.text();
  throw new Error(`Updating the password failed (${updateResponse.status}): ${body}`);
}

console.log(`Password updated for ${email}.`);
