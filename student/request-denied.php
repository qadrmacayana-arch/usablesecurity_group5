<?php require_once __DIR__ . "/../includes/student-guard.php"; ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Request Denied — SecureAccess</title>
<link rel="stylesheet" href="../style/shared.css">
</head>
<body data-page="access-requests">
<div id="sidebar-overlay"></div>
<div class="app-shell">
  <aside id="sidebar"></aside>

  <div class="main-area">
    <div id="top-bar" data-title="Request Detail"></div>

    <div class="page-content fade-in">

      <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
        <a href="access-requests.php" class="btn btn-ghost btn-sm">← Back</a>
        <span style="color:var(--c-600);">/</span>
        <span
          id="denied-request-id"
          style="font-size:13px;color:var(--c-400);"
          class="mono"
        ></span>
      </div>

      <div style="display:grid;grid-template-columns:1fr 340px;gap:20px;align-items:start;">

        <div>

          <div class="card" style="margin-bottom:20px;">

            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:20px;">

              <div>

                <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                  <h1
                    id="denied-resource"
                    style="font-size:20px;font-weight:800;color:#fff;margin:0;"
                  ></h1>

                  <span
                    id="denied-security"
                    class="pip pip-high"
                  ></span>
                </div>

                <p
                  id="denied-request-meta"
                  class="mono"
                  style="font-size:12px;color:var(--c-500);margin:0;"
                ></p>

              </div>

              <div style="text-align:right;">
                <span class="stamp stamp-denied">Denied</span>
              </div>

            </div>

            <!-- Denial notice -->
            <div style="background:rgba(248,113,113,.07);border:1px solid rgba(248,113,113,.25);border-radius:10px;padding:16px;margin-bottom:20px;">

              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <svg width="16" height="16" fill="none" stroke="var(--c-red)" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>

                <span style="font-size:13px;font-weight:600;color:var(--c-red);">
                  Request Denied
                </span>
              </div>

              <p style="font-size:12px;color:var(--c-500);margin:0 0 12px;">
                Your request was reviewed and denied. Please see the rejection reason below. You may reapply after addressing the concerns raised.
              </p>

              <div style="display:flex;gap:0;align-items:center;">

                <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
                  <div style="width:24px;height:24px;border-radius:50%;background:var(--c-indigo);display:flex;align-items:center;justify-content:center;">
                    <svg width="12" height="12" fill="none" stroke="#fff" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                        d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <span style="font-size:10px;color:var(--c-500);">Submitted</span>
                </div>

                <div style="flex:1;height:2px;background:var(--c-indigo);margin:0 6px 16px;"></div>

                <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
                  <div style="width:24px;height:24px;border-radius:50%;background:var(--c-indigo);display:flex;align-items:center;justify-content:center;">
                    <svg width="12" height="12" fill="none" stroke="#fff" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                        d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <span style="font-size:10px;color:var(--c-500);">Reviewed</span>
                </div>

                <div style="flex:1;height:2px;background:var(--c-red);margin:0 6px 16px;"></div>

                <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
                  <div style="width:24px;height:24px;border-radius:50%;background:var(--c-red);display:flex;align-items:center;justify-content:center;">
                    <svg width="12" height="12" fill="none" stroke="#fff" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </div>
                  <span style="font-size:10px;color:var(--c-red);font-weight:600;">Denied</span>
                </div>

              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">

              <div>
                <p class="lbl">Permission Requested</p>
                <p
                  id="denied-permission"
                  style="color:var(--c-200);font-size:13px;"
                ></p>
              </div>

              <div>
                <p class="lbl">Duration Requested</p>
                <p
                  id="denied-duration"
                  style="color:var(--c-200);font-size:13px;"
                ></p>
              </div>

              <div>
                <p class="lbl">Reviewed By</p>
                <p
                  id="denied-reviewed-by"
                  style="color:var(--c-200);font-size:13px;"
                ></p>
              </div>

              <div>
                <p class="lbl">Decision Date</p>
                <p
                  id="denied-decision-date"
                  style="color:var(--c-200);font-size:13px;"
                ></p>
              </div>

            </div>
          </div>


          <!-- Rejection reason -->
          <div class="card" style="margin-bottom:20px;border-color:rgba(248,113,113,.3);">

            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
              <svg width="16" height="16" fill="none" stroke="var(--c-red)" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>

              <h2 style="font-size:14px;font-weight:700;color:var(--c-red);margin:0;">
                Rejection Reason
              </h2>
            </div>

            <p
              id="denied-reason"
              style="font-size:13px;color:var(--c-400);line-height:1.7;margin:0 0 14px;"
            ></p>

            <div style="background:rgba(251,191,36,.07);border:1px solid rgba(251,191,36,.2);border-radius:8px;padding:12px;">
              <p style="font-size:12px;color:var(--c-amber);margin:0;">
                <strong>Next Steps:</strong>
                You may request access to another appropriate resource that may have the data you need. Contact the IT Help Desk if you require further guidance.
              </p>
            </div>

          </div>


          <div class="card">

            <h2 style="font-size:14px;font-weight:700;color:var(--c-100);margin:0 0 12px;">
              Original Justification
            </h2>

            <p
              id="denied-justification"
              style="font-size:13px;color:var(--c-400);line-height:1.7;margin:0;"
            ></p>

          </div>

        </div>


        <!-- Sidebar -->
        <div style="display:flex;flex-direction:column;gap:16px;">

          <div class="card">

            <h3 style="font-size:13px;font-weight:700;color:var(--c-300);margin:0 0 14px;">
              Request Info
            </h3>

            <div style="display:flex;flex-direction:column;gap:10px;">

              <div>
                <p style="font-size:11px;color:var(--c-500);margin:0;">
                  Status
                </p>

                <div style="margin-top:4px;">
                  <span class="badge b-red">Rejected</span>
                </div>
              </div>

              <div>
                <p style="font-size:11px;color:var(--c-500);margin:0;">
                  Denied On
                </p>

                <p
                  id="denied-on"
                  style="font-size:13px;color:var(--c-300);margin:4px 0 0;"
                ></p>
              </div>

              <div>
                <p style="font-size:11px;color:var(--c-500);margin:0;">
                  Can Reapply
                </p>

                <p style="font-size:13px;color:var(--c-300);margin:4px 0 0;">
                  Contact IT Help Desk
                </p>
              </div>

            </div>
          </div>


          <div class="card">

            <h3 style="font-size:13px;font-weight:700;color:var(--c-300);margin:0 0 12px;">
              Student
            </h3>

            <div style="display:flex;align-items:center;gap:10px;">

              <div
                id="denied-avatar"
                class="avatar"
              ></div>

              <div>

                <p
                  id="denied-student-name"
                  style="font-size:13px;font-weight:600;color:var(--c-200);margin:0;"
                ></p>

                <p
                  id="denied-student-id"
                  style="font-size:11px;color:var(--c-500);margin:2px 0 0;"
                ></p>

              </div>

            </div>
          </div>


          <a href="submission-form.php" class="btn btn-primary" style="justify-content:center;">

            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>

            Submit New Request

          </a>

          <a href="access-requests.php" class="btn btn-ghost" style="justify-content:center;">
            ← Back to Requests
          </a>

        </div>

      </div>
    </div>
  </div>
</div>

<script src="../script/shared.js"></script>
<script src="../script/supabase-data.js"></script>
<script src="../script/supabase-client.js"></script>
<script src="../script/pages/request-denied.js"></script>

</body>
</html>