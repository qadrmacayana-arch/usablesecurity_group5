<?php
$personnelPage = 'dashboard';
$personnelTitle = 'Faculty overview';
$personnelScript = '../script/pages/personnel-dashboard.js';
require __DIR__ . '/layout-start.php';
?>
<div class="page-content fade-in personnel-content">
  <section class="personnel-welcome">
    <div>
      <p class="personnel-eyebrow">Your teaching hub</p>
      <h1>Good day, <span id="welcome-name">Professor</span></h1>
      <p>Manage learning materials, follow student requests, and stay connected with your students and administrator.</p>
    </div>
    <a class="btn btn-primary" href="content.php">Create learning material</a>
  </section>

  <div id="personnel-dashboard-status" class="personnel-status" role="status">Loading your workspace…</div>

  <section class="personnel-stat-grid" aria-label="Workspace summary">
    <article class="personnel-stat-card">
      <span class="personnel-stat-icon">↗</span>
      <p>Pending requests</p><strong id="stat-pending">—</strong>
      <a href="access-requests.php">Review student requests</a>
    </article>
    <article class="personnel-stat-card">
      <span class="personnel-stat-icon">▤</span>
      <p>Learning materials</p><strong id="stat-content">—</strong>
      <a href="content.php">Manage lessons &amp; activities</a>
    </article>
    <article class="personnel-stat-card">
      <span class="personnel-stat-icon">✓</span>
      <p>Grade records</p><strong id="stat-grades">—</strong>
      <a href="grades.php">Open gradebook</a>
    </article>
    <article class="personnel-stat-card">
      <span class="personnel-stat-icon">✉</span>
      <p>Unread messages</p><strong id="stat-unread">—</strong>
      <a href="messages.php">Open inbox</a>
    </article>
  </section>

  <section class="personnel-dashboard-grid">
    <article class="personnel-panel">
      <div class="personnel-panel-heading">
        <div><p class="personnel-eyebrow">Student support</p><h2>Recent requests</h2></div>
        <a href="access-requests.php">View all</a>
      </div>
      <div id="dashboard-requests" class="personnel-activity-list">
        <p class="personnel-muted">Loading requests…</p>
      </div>
    </article>
    <article class="personnel-panel personnel-quick-panel">
      <p class="personnel-eyebrow">Quick actions</p>
      <h2>Keep your class moving</h2>
      <a href="content.php"><span>＋</span><span><strong>Publish a lesson or activity</strong><small>Share materials with students</small></span></a>
      <a href="grades.php"><span>✓</span><span><strong>Record a grade</strong><small>Maintain your student gradebook</small></span></a>
      <a href="messages.php"><span>✉</span><span><strong>Contact a student or admin</strong><small>Continue a direct conversation</small></span></a>
    </article>
  </section>
</div>
<?php require __DIR__ . '/layout-end.php'; ?>
