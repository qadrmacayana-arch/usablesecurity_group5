/*
 * Server-only Supabase Auth bootstrap.
 *
 * PowerShell:
 *   $env:SUPABASE_SERVICE_ROLE_KEY = "paste-your-service-role-key-here"
 *   $env:DEMO_USER_PASSWORD = "choose-a-temporary-password"
 *   node .\supabase\create-demo-students.mjs
 *
 * Never put either value in browser code, SQL files, Git, or README files.
 */

const supabaseUrl = process.env.SUPABASE_URL ||
  'https://hxzwypdepseficyrnbhd.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const temporaryPassword = process.env.DEMO_USER_PASSWORD;

if (!serviceRoleKey || !temporaryPassword) {
  throw new Error(
    'Set SUPABASE_SERVICE_ROLE_KEY and DEMO_USER_PASSWORD before running this script.'
  );
}

const students = [
  ['daniel.santos@university.edu.ph', '2024-112234', 'Daniel Santos'],
  ['sean.reyes@university.edu.ph', '2025-000192', 'Sean Reyes'],
  ['anne.dela-cruz@university.edu.ph', '2023-000441', 'Anne Dela Cruz'],
  ['mary.bautista@university.edu.ph', '2024-083517', 'Mary Bautista'],
  ['lizzie.garcia@university.edu.ph', '2022-167890', 'Lizzie Garcia'],
  ['allan.mendoza@university.edu.ph', '2025-204681', 'Allan Mendoza'],
  ['lorie.ramos@university.edu.ph', '2023-315702', 'Lorie Ramos'],
  ['alexandra.villanueva@university.edu.ph', '2024-426813', 'Alexandra Villanueva'],
  ['rowdy.navarro@university.edu.ph', '2022-537924', 'Rowdy Navarro'],
  ['cherry.ong@university.edu.ph', '2025-648135', 'Cherry Ong'],
  ['peter.mercado@university.edu.ph', '2023-759246', 'Peter Mercado']
];

const headers = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  'Content-Type': 'application/json'
};

async function request(path, options = {}) {
  const response = await fetch(`${supabaseUrl}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${options.method || 'GET'} ${path} failed (${response.status}): ${body}`);
  }

  return response.status === 204 ? null : response.json();
}

const existing = await request('/auth/v1/admin/users?per_page=1000');
const existingEmails = new Set(
  (existing.users || []).map(user => user.email?.toLowerCase()).filter(Boolean)
);

for (const [email, studentId, fullName] of students) {
  if (existingEmails.has(email)) {
    console.log(`Already exists: ${email}`);
    continue;
  }

  await request('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        student_id: studentId,
        full_name: fullName
      }
    })
  });

  console.log(`Created: ${email}`);
}

console.log('Finished creating demo student Auth users.');
