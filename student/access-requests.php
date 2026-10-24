<?php require_once __DIR__ . "/../includes/student-guard.php"; ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Access Requests — SecureAccess</title>
    <link rel="stylesheet" href="../style/shared.css">
  </head>
  <body data-page="access-requests">
    <div id="sidebar-overlay"></div>

    <div class="app-shell">
      <aside id="sidebar"></aside>

      <main class="main-area">
        <div id="top-bar" data-title="Access Requests"></div>

        <div class="page-content fade-in">
          <div class="page-header" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:14px;">
            <div>
              <h1 style="font-size:22px;font-weight:800;color:#fff;margin:0 0 4px;">Access Requests</h1>
              <p style="font-size:13px;color:var(--c-500);margin:0;">Track and manage your permission requests.</p>
            </div>
            <a href="submission-form.php" class="btn btn-primary">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              New Request
            </a>
          </div>

          <div role="status" style="display:flex;gap:10px;align-items:flex-start;background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.25);border-radius:10px;padding:12px 14px;margin-bottom:18px;color:var(--c-300);font-size:12px;line-height:1.5;">
            <svg width="16" height="16" fill="none" stroke="var(--c-amber)" viewBox="0 0 24 24" style="flex:0 0 auto;margin-top:1px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v4m0 4h.01M10.29 3.86l-8.1 14a2 2 0 001.73 3h16.16a2 2 0 001.73-3l-8.1-14a2 2 0 00-3.46 0z"/></svg>
            <span><strong style="color:var(--c-amber);">Data source:</strong> authenticated requests are loaded from Supabase. If the connection fails, no local sample data is substituted.</span>
          </div>

          <div class="filter-tabs" style="margin-bottom:18px;">
            <button class="ftab active" onclick="filterReqs('all',this)">All</button>
            <button class="ftab" onclick="filterReqs('pending',this)">Pending</button>
            <button class="ftab" onclick="filterReqs('approved',this)">Approved</button>
            <button class="ftab" onclick="filterReqs('rejected',this)">Rejected</button>
          </div>

          <div class="card" style="padding:0;overflow:hidden;">
            <table class="tbl" id="req-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Resource</th>
                  <th>Type</th>
                  <th>Security</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="req-tbody">
                <tr>
                  <td
                    colspan="7"
                    style="text-align:center;color:var(--c-500);padding:30px;"
                  >
                    Loading access requests...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <script src="../script/shared.js"></script>
    <script src="../script/supabase-data.js"></script>
    <script src="../script/supabase-client.js"></script>
    <script src="../script/pages/access-requests.js"></script>
  </body>
</html>
