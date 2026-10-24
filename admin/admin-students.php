<?php require_once __DIR__ . "/../includes/admin-guard.php"; ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Students — Admin Console</title>
    <link rel="stylesheet" href="../style/shared.css">
  </head>
  <body data-admin-page="students">
    <div class="app-shell">
      <aside id="admin-sidebar"></aside>

      <main class="main-area">
        <div id="admin-top-bar" data-title="Students"></div>

        <div class="page-content fade-in">
          <div class="page-header">
            <h1>Student directory</h1>
            <p>Review identity, clearance, and request activity before granting access.</p>
          </div>

          <div class="card" style="margin-top:22px;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:14px;margin-bottom:12px;">
              <h2 style="font-size:15px;color:#fff;margin:0;">Registered students</h2>
              <input id="student-search" class="inp" oninput="filterStudents()" placeholder="Search students..." style="max-width:260px;">
            </div>
            <p id="student-list-status" class="personnel-muted" role="status">Loading student profiles…</p>

            <table class="tbl">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Program</th>
                  <th>Clearance</th>
                  <th>Requests</th>
                  <th>Account</th>
                </tr>
              </thead>
              <tbody id="student-list">
                <tr>
                  <td colspan="5" class="personnel-empty-state">Loading student records…</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <script src="../script/supabase-client.js"></script>
    <script src="../script/admin-shared.js"></script>
    <script src="../script/pages/admin-students.js"></script>
  </body>
</html>
