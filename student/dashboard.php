<?php require_once __DIR__ . "/../includes/student-guard.php"; ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dashboard — SecureAccess</title>
<link rel="stylesheet" href="../style/shared.css">
</head>

<body data-page="dashboard">

<div id="sidebar-overlay"></div>

<div class="app-shell">

  <aside id="sidebar"></aside>

  <div class="main-area">

    <div id="top-bar" data-title="Dashboard"></div>

    <div class="page-content fade-in">

      <!-- Page header -->
      <div class="page-header">
        <h1 id="dashboard-welcome">Welcome back</h1>
        <p>Here is an overview of your access permissions and recent activity.</p>
      </div>


      <!-- Stat cards -->
      <div class="gap-grid-4" style="margin-bottom:24px;">

        <!-- Active Accesses -->
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(99,102,241,.15);">
            <svg width="20" height="20" fill="none" stroke="var(--c-indigo-l)" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
          </div>

          <div>
            <p id="dashboard-active-accesses"
               style="font-size:22px;font-weight:800;color:#fff;margin:0;">0</p>
            <p style="font-size:12px;color:var(--c-500);margin:2px 0 0;">
              Active Accesses
            </p>
          </div>
        </div>


        <!-- Pending Review -->
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(251,191,36,.1);">
            <svg width="20" height="20" fill="none" stroke="var(--c-amber)" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>

          <div>
            <p id="dashboard-pending"
               style="font-size:22px;font-weight:800;color:#fff;margin:0;">0</p>
            <p style="font-size:12px;color:var(--c-500);margin:2px 0 0;">
              Pending Review
            </p>
          </div>
        </div>


        <!-- Expiring Soon -->
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(249,115,22,.1);">
            <svg width="20" height="20" fill="none" stroke="var(--c-orange)" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>

          <div>
            <p id="dashboard-expiring"
               style="font-size:22px;font-weight:800;color:#fff;margin:0;">0</p>
            <p style="font-size:12px;color:var(--c-500);margin:2px 0 0;">
              Expiring Soon
            </p>
          </div>
        </div>


        <!-- Total Requests -->
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(52,211,153,.1);">
            <svg width="20" height="20" fill="none" stroke="var(--c-green)" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>

          <div>
            <p id="dashboard-total-requests"
               style="font-size:22px;font-weight:800;color:#fff;margin:0;">0</p>
            <p style="font-size:12px;color:var(--c-500);margin:2px 0 0;">
              Total Requests
            </p>
          </div>
        </div>

      </div>


      <!-- Main dashboard cards -->
      <div class="student-dashboard-grid">

        <!-- Active accesses -->
        <div class="card">

          <div class="section-head">
            <h2>Active Access Permissions</h2>

            <a href="monitoring.php"
               style="font-size:12px;color:var(--c-indigo-l);text-decoration:none;">
              View all →
            </a>
          </div>

          <!-- Dynamically populated by dashboard.js -->
          <div id="dashboard-active-access-list"
               style="display:flex;flex-direction:column;gap:10px;">
          </div>

        </div>


        <!-- Recent requests -->
        <div class="card">

          <div class="section-head">
            <h2>Recent Requests</h2>

            <a href="history.php"
               style="font-size:12px;color:var(--c-indigo-l);text-decoration:none;">
              View all →
            </a>
          </div>

          <table class="tbl">

            <thead>
              <tr>
                <th>Resource</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <!-- Dynamically populated by dashboard.js -->
            <tbody id="dashboard-recent-tbody">
            </tbody>

          </table>

        </div>

      </div>


      <!-- Quick actions -->
      <div class="card" style="margin-top:20px;">

        <div class="section-head">
          <h2>Quick Actions</h2>
        </div>

        <div style="display:flex;gap:12px;flex-wrap:wrap;">

          <a href="submission-form.php" class="btn btn-primary">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4v16m8-8H4"/>
            </svg>
            New Access Request
          </a>


          <a href="access-requests.php" class="btn btn-ghost">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            View All Requests
          </a>


          <a href="monitoring.php" class="btn btn-ghost">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Access Monitoring
          </a>


          <a href="credential.php" class="btn btn-ghost">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/>
            </svg>
            My Credential
          </a>

        </div>

      </div>

    </div>
  </div>
</div>


<!-- Shared scripts -->
<script src="../script/shared.js"></script>
<script src="../script/supabase-client.js"></script>
<script src="../script/pages/dashboard.js"></script>

</body>
</html>