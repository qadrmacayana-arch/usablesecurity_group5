<?php require_once __DIR__ . "/../includes/student-guard.php"; ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Grades — SecureAccess</title>
<link rel="stylesheet" href="../style/shared.css">
</head>
<body data-page="grades">
<div id="sidebar-overlay"></div>
<div class="app-shell">
  <aside id="sidebar"></aside>
  <div class="main-area">
    <div id="top-bar" data-title="Grades"></div>
    <div class="page-content fade-in">
      <div class="page-header">
        <h1>Academic Grades</h1>
        <p id="grades-profile-summary">Scores published by your teachers.</p>
      </div>

      <section class="personnel-panel student-published-grades">
        <div class="personnel-panel-heading">
          <div><p class="personnel-eyebrow">Teacher gradebook</p><h2>Published scores</h2></div>
        </div>
        <div id="student-grades-status" class="personnel-muted" role="status">Loading grades published by your teachers…</div>
        <div class="personnel-table-wrap">
          <table class="tbl personnel-grade-table">
            <thead><tr><th>Lesson or activity</th><th>Teacher</th><th>Score</th><th>Published</th></tr></thead>
            <tbody id="student-published-grade-list"><tr><td colspan="4" class="personnel-empty-state">Loading…</td></tr></tbody>
          </table>
        </div>
      </section>

      <div style="background:rgba(99,102,241,.07);border:1px solid rgba(99,102,241,.2);border-radius:8px;padding:12px 16px;margin-top:20px;">
        <p style="font-size:12px;color:var(--c-500);margin:0;">
          <strong style="color:var(--c-400);">Note:</strong> This page shows scores teachers publish in SecureAccess. Official course grades, GPA, and enrollment standing are not connected to an external student-information system.
        </p>
      </div>
    </div>
  </div>
</div>
<script src="../script/supabase-client.js"></script>
<script src="../script/shared.js"></script>
<script src="../script/pages/student-grades.js"></script>
</body>
</html>
