<?php require_once __DIR__ . "/../includes/admin-guard.php"; ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Access Requests — Admin Console</title>
    <link rel="stylesheet" href="../style/shared.css">
  </head>
  <body data-admin-page="requests">
    <div class="app-shell">
      <aside id="admin-sidebar"></aside>

      <main class="main-area">
        <div id="admin-top-bar" data-title="Access Requests"></div>

        <div class="page-content fade-in">
          <div class="page-header">
            <h1>Review access requests</h1>
            <p>Make a decision and send a clear explanation to the student.</p>
          </div>

          <div class="card" style="max-width:960px;margin-top:22px;">
           <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;border-bottom:1px solid var(--c-800);padding-bottom:18px;">
          <div>
            <p
              id="admin-request-number"
              class="mono"
              style="font-size:12px;color:var(--c-500);margin:0 0 6px;"
            >
              Loading request...
            </p>

            <h2
              id="admin-request-resource"
              style="font-size:18px;color:#fff;margin:0 0 5px;"
            >
              Loading resource...
            </h2>

            <p
              id="admin-request-student"
              style="font-size:12px;color:var(--c-500);margin:0;"
            >
              Loading student...
            </p>
          </div>

          <span id="admin-request-status"></span>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin:20px 0;">
          <div>
            <p class="lbl">Request type</p>
            <p
              id="admin-request-type"
              style="color:var(--c-200);"
            >
              —
            </p>
          </div>

          <div>
            <p class="lbl">Permission</p>
            <p id="admin-request-permission" style="color:var(--c-200);">—</p>
          </div>

          <div>
            <p class="lbl">Security level</p>
            <p
              id="admin-request-security"
              style="color:var(--c-200);"
            >
              —
            </p>
          </div>

          <div>
            <p class="lbl">Duration</p>
            <p id="admin-request-duration" style="color:var(--c-200);">—</p>
          </div>

          <div>
            <p class="lbl">Urgency</p>
            <p id="admin-request-urgency" style="color:var(--c-200);">—</p>
          </div>

          <div>
            <p class="lbl">Student program</p>
            <p id="admin-request-course" style="color:var(--c-200);">—</p>
          </div>

          <div>
            <p class="lbl">Submitted</p>
            <p
              id="admin-request-submitted"
              style="color:var(--c-200);"
            >
              —
            </p>
          </div>
        </div>

        <div style="background:rgba(99,102,241,.04);border:1px solid rgba(99,102,241,.14);border-radius:8px;padding:14px;margin-bottom:20px;">
          <p class="lbl">Additional message</p>
          <p id="admin-request-message" style="font-size:13px;color:var(--c-400);line-height:1.7;margin:0;">—</p>
        </div>

            <div style="background:rgba(99,102,241,.06);border:1px solid rgba(99,102,241,.2);border-radius:8px;padding:14px;margin-bottom:20px;">
              <p
                id="admin-request-justification"
                style="font-size:13px;color:var(--c-400);line-height:1.7;margin:0;"
              >
                Loading justification...
              </p>
            </div>

            <div id="decision-section">

              <p class="lbl">
                Decision note
                <span style="color:var(--c-600);font-weight:400;">
                  (required and shared with the student)
                </span>
              </p>

              <textarea
                id="decision-reason"
                class="textarea"
                maxlength="2000"
                placeholder="Explain the approval conditions or what needs to be corrected."
              ></textarea>

              <p
                id="decision-error"
                style="display:none;color:var(--c-red);font-size:12px;margin:8px 0 0;"
              ></p>

              <p
                id="decision-saved"
                style="display:none;color:var(--c-green);font-size:12px;margin:8px 0 0;"
              ></p>

            </div>

            <div id="request-actions" style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px;">
              <button class="btn btn-danger" onclick="decideRequest('Rejected')">Reject request</button>
              <button class="btn btn-primary" onclick="decideRequest('Approved')">Approve request</button>
            </div>

            <p id="admin-request-status-text" style="font-size:12px;color:var(--c-500);margin:16px 0 0;"></p>
          </div>
        </div>
      </main>
    </div>

    <script src="../script/supabase-client.js"></script>
    <script src="../script/admin-shared.js"></script>
    <script src="../script/pages/admin-requests.js"></script>
  </body>
</html>
