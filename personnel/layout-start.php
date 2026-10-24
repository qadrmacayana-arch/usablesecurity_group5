<?php
require_once __DIR__ . '/../includes/personnel-guard.php';
$personnelPage = $personnelPage ?? 'dashboard';
$personnelTitle = $personnelTitle ?? 'Faculty workspace';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($personnelTitle, ENT_QUOTES, 'UTF-8') ?> — SecureAccess</title>
  <link rel="stylesheet" href="../style/shared.css">
</head>
<body class="personnel-page" data-personnel-page="<?= htmlspecialchars($personnelPage, ENT_QUOTES, 'UTF-8') ?>">
  <div class="app-shell">
    <aside class="personnel-sidebar">
      <a class="personnel-brand" href="dashboard.php">
        <span class="personnel-brand-mark">SA</span>
        <span>
          <strong>SecureAccess</strong>
          <span>Faculty workspace</span>
        </span>
      </a>
      <div class="personnel-profile">
        <span class="personnel-avatar" id="personnel-avatar">—</span>
        <span class="personnel-profile-copy">
          <strong id="personnel-name">Loading profile…</strong>
          <span>Teacher account</span>
        </span>
      </div>
      <nav class="personnel-nav" aria-label="Faculty navigation">
        <p class="nav-group-label">Teaching</p>
        <a class="nav-btn" data-personnel-link="dashboard" href="dashboard.php">
          <svg class="personnel-nav-icon" aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
          <span>Overview</span>
        </a>
        <a class="nav-btn" data-personnel-link="content" href="content.php">
          <svg class="personnel-nav-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16M8 7h8m-8 4h8m-8 4h5"/></svg>
          <span>Lessons &amp; activities</span>
        </a>
        <a class="nav-btn" data-personnel-link="grades" href="grades.php">
          <svg class="personnel-nav-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M4 19V5m0 14h17"/><path d="m7 15 4-4 3 2 5-6"/></svg>
          <span>Gradebook</span>
        </a>
        <p class="nav-group-label">Communication</p>
        <a class="nav-btn" data-personnel-link="requests" href="access-requests.php">
          <svg class="personnel-nav-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M8 3h8l4 4v14H4V3z"/><path d="M8 11h8m-8 4h8m-8 4h5M16 3v5h4"/></svg>
          <span>Student requests</span>
        </a>
        <a class="nav-btn" data-personnel-link="messages" href="messages.php">
          <svg class="personnel-nav-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></svg>
          <span>Messages</span>
          <span class="personnel-nav-count" id="personnel-unread-count" hidden></span>
        </a>
      </nav>
      <div class="personnel-sidebar-footer">
        <a class="logout-btn" href="../api/logout.php">Sign out</a>
      </div>
    </aside>
    <main class="main-area">
      <header class="personnel-topbar">
        <div>
          <p class="personnel-eyebrow">SecureAccess · Faculty</p>
          <h2><?= htmlspecialchars($personnelTitle, ENT_QUOTES, 'UTF-8') ?></h2>
        </div>
        <span class="personnel-role">Teacher</span>
      </header>
