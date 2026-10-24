<?php require_once __DIR__ . '/../includes/student-guard.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Learning Materials — SecureAccess</title><link rel="stylesheet" href="../style/shared.css">
</head>
<body data-page="learning">
  <div id="sidebar-overlay"></div>
  <div class="app-shell">
    <aside id="sidebar"></aside>
    <main class="main-area">
      <div id="top-bar" data-title="Learning materials"></div>
      <div class="page-content fade-in">
        <div class="page-header"><h1>Learning materials</h1><p>Lessons and activities published by your teachers.</p></div>
        <div id="student-learning-status" class="personnel-status" role="status">Loading published materials…</div>
        <section id="student-learning-list" class="student-learning-grid" aria-live="polite">
          <p class="personnel-muted">Loading learning materials…</p>
        </section>
      </div>
    </main>
  </div>
  <script src="../script/supabase-client.js"></script>
  <script src="../script/shared.js"></script>
  <script src="../script/pages/student-learning.js"></script>
</body>
</html>
