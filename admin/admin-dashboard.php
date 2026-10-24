<?php require_once __DIR__ . "/../includes/admin-guard.php"; ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Overview — SecureAccess</title>
    <link rel="stylesheet" href="../style/shared.css">
  </head>
  <body data-admin-page="dashboard">
    <div class="app-shell">
      <aside id="admin-sidebar"></aside>

      <main class="main-area">
        <div id="admin-top-bar" data-title="Admin Overview"></div>

        <div class="page-content fade-in">
          <div class="page-header">
            <h1>Good morning, Administrator</h1>
            <p>Review student access activity and keep requests moving.</p>
          </div>

          <div class="card" style="max-width:960px; margin: 18px 0 22px; background: linear-gradient(135deg, rgba(79,70,229,0.08), rgba(255,255,255,0.95)); border-color: rgba(99,102,241,0.16);">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;">
              <div>
                <p style="margin:0 0 6px;color:var(--c-indigo-l);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Operations snapshot</p>
                <h2 style="font-size:22px;color:var(--c-100);margin:0;letter-spacing:-0.03em;">Live access activity</h2>
              </div>
              <div style="display:flex;gap:10px;flex-wrap:wrap;">
                <a href="admin-requests.php" class="btn btn-primary">Review pending</a>
                <a href="admin-messages.php" class="btn btn-ghost">Messages</a>
              </div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px;margin:0 0 22px;">
            <div class="stat-card">
              <div class="stat-icon" style="background:rgba(251,191,36,.12);color:var(--c-amber);">!</div>
              <div>
                <p style="font-size:12px;color:var(--c-500);margin:0;">Pending requests</p>
                <strong id="pending-count" style="font-size:24px;color:var(--c-100);">0</strong>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="background:rgba(99,102,241,.12);color:var(--c-indigo-l);">↗</div>
              <div>
                <p style="font-size:12px;color:var(--c-500);margin:0;">Latest decision</p>
                <strong id="decision-count" style="font-size:16px;color:var(--c-100);">—</strong>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="background:rgba(52,211,153,.12);color:var(--c-green);">✉</div>
              <div>
                <p style="font-size:12px;color:var(--c-500);margin:0;">Messages sent</p>
                <strong id="message-count" style="font-size:24px;color:var(--c-100);">0</strong>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="background:rgba(96,165,250,.12);color:var(--c-blue);">●</div>
              <div>
                <p style="font-size:12px;color:var(--c-500);margin:0;">Active grants</p>
                <strong id="active-access-count" style="font-size:24px;color:var(--c-100);">0</strong>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="background:rgba(167,139,250,.12);color:var(--c-purple);">✓</div>
              <div>
                <p style="font-size:12px;color:var(--c-500);margin:0;">Review SLA</p>
                <strong id="review-rate" style="font-size:24px;color:var(--c-100);">0%</strong>
              </div>
            </div>
          </div>

          <div class="dashboard-grid">
            <div class="feature-panel feature-panel-wide">
              <div class="panel-header">
                <div>
                  <p class="panel-kicker">Priority review</p>
                  <h3>Student communication</h3>
                </div>
                <span id="request-status"></span>
              </div>

              <div class="panel-body">
                <p>Review the latest request and communicate with students through the connected message center.</p>
                <div class="action-row">
                  <a href="admin-requests.php" class="btn btn-primary">Review request</a>
                  <a href="admin-messages.php" class="btn btn-ghost">View message history</a>
                </div>
              </div>
            </div>

            <div class="feature-panel">
              <div class="panel-header compact">
                <div>
                  <p class="panel-kicker">Operations</p>
                  <h3>Quick actions</h3>
                </div>
              </div>
              <div class="quick-actions">
                <a href="admin-requests.php" class="quick-action primary">Approve requests</a>
                <a href="admin-students.php" class="quick-action">Student roster</a>
                <a href="admin-access.php" class="quick-action">Active access</a>
                <a href="admin-audit.php" class="quick-action">Audit logs</a>
              </div>
            </div>

            <div class="feature-panel">
              <div class="panel-header compact">
                <div>
                  <p class="panel-kicker">Live</p>
                  <h3>Priority queue</h3>
                </div>
              </div>
              <div class="status-list">
                <div class="status-item">
                  <span class="dot amber"></span>
                  <div>
                    <strong id="queue-pending-count">Loading pending requests…</strong>
                    <small>Requests awaiting an administrator decision</small>
                  </div>
                </div>
                <div class="status-item">
                  <span class="dot red"></span>
                  <div>
                    <strong id="queue-urgent-count">Loading urgent requests…</strong>
                    <small>Pending requests marked urgent</small>
                  </div>
                </div>
                <div class="status-item">
                  <span class="dot green"></span>
                  <div>
                    <strong id="queue-active-grants">Loading active grants…</strong>
                    <small>Currently active access grants</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <script src="../script/supabase-client.js"></script>
    <script src="../script/admin-shared.js"></script>
    <script src="../script/pages/admin-dashboard.js"></script>
  </body>
</html>
