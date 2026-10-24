<?php require_once __DIR__ . "/../includes/student-guard.php"; ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Request Under Review — SecureAccess</title>
<link rel="stylesheet" href="../style/shared.css">
</head>

<body data-page="access-requests">

<div id="sidebar-overlay"></div>

<div class="app-shell">

  <aside id="sidebar"></aside>

  <div class="main-area">

    <div id="top-bar" data-title="Request Detail"></div>

    <div class="page-content fade-in">

      <!-- Breadcrumb -->
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
        <a href="access-requests.php" class="btn btn-ghost btn-sm">← Back</a>
        <span style="color:var(--c-600);">/</span>

        <span
          id="pending-request-id"
          style="font-size:13px;color:var(--c-400);"
          class="mono"
        >
          Loading request…
        </span>
      </div>


      <div style="display:grid;grid-template-columns:1fr 340px;gap:20px;align-items:start;">

        <!-- Main detail -->
        <div>

          <div class="card" style="margin-bottom:20px;">

            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:20px;">

              <div>

                <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">

                  <h1
                    id="pending-resource"
                    style="font-size:20px;font-weight:800;color:#fff;margin:0;"
                  >
                    Loading resource…
                  </h1>

                  <span
                    id="pending-security"
                    class="pip pip-restricted"
                  >
                    Loading…
                  </span>

                </div>

                <p
                  id="pending-request-meta"
                  class="mono"
                  style="font-size:12px;color:var(--c-500);margin:0;"
                >
                  Loading request details…
                </p>

              </div>

              <div style="text-align:right;">

                <span
                  id="request-detail-status"
                  class="stamp stamp-pending"
                >
                  Under Review
                </span>

              </div>

            </div>


            <!-- Review timeline -->
            <div style="background:rgba(251,191,36,.06);border:1px solid rgba(251,191,36,.2);border-radius:10px;padding:16px;margin-bottom:20px;">

              <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">

                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="var(--c-amber)"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>

                <span
                  style="font-size:13px;font-weight:600;color:var(--c-amber);"
                >
                  Request Under Review
                </span>

              </div>


              <p
                id="admin-decision-note"
                style="display:none;font-size:12px;color:var(--c-400);margin:0 0 12px;background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.2);padding:10px;border-radius:7px;"
              >
                Administrator note:
                <span></span>
              </p>


              <p
                id="request-status-message"
                style="font-size:12px;color:var(--c-500);margin:0 0 12px;"
              >
                Your request is currently being reviewed by the system administrator.
                Expected decision:
                <span id="pending-expected-decision-text">
                  2–3 business days.
                </span>
              </p>


              <!-- Progress steps -->
              <div id="request-progress" style="display:flex;gap:0;align-items:center;">

                <!-- Submitted -->
                <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">

                  <div
                    id="progress-submitted-circle"
                    style="width:24px;height:24px;border-radius:50%;background:var(--c-indigo);display:flex;align-items:center;justify-content:center;"
                  >
                    <svg
                      width="12"
                      height="12"
                      fill="none"
                      stroke="#fff"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>

                  <span
                    id="progress-submitted-label"
                    style="font-size:10px;color:var(--c-500);white-space:nowrap;"
                  >
                    Submitted
                  </span>

                </div>


                <!-- Connector 1 -->
                <div
                  id="progress-line-1"
                  style="flex:1;height:2px;background:var(--c-indigo);margin:0 6px 16px;"
                ></div>


                <!-- In Review -->
                <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">

                  <div
                    id="progress-review-circle"
                    style="width:24px;height:24px;border-radius:50%;background:var(--c-800);border:2px solid var(--c-700);display:flex;align-items:center;justify-content:center;"
                  >
                  </div>

                  <span
                    id="progress-review-label"
                    style="font-size:10px;color:var(--c-600);white-space:nowrap;"
                  >
                    In Review
                  </span>

                </div>


                <!-- Connector 2 -->
                <div
                  id="progress-line-2"
                  style="flex:1;height:2px;background:var(--c-800);margin:0 6px 16px;"
                ></div>


                <!-- Decision -->
                <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">

                  <div
                    id="progress-decision-circle"
                    style="width:24px;height:24px;border-radius:50%;background:var(--c-800);border:2px solid var(--c-700);display:flex;align-items:center;justify-content:center;"
                  >
                  </div>

                  <span
                    id="progress-decision-label"
                    style="font-size:10px;color:var(--c-600);white-space:nowrap;"
                  >
                    Decision
                  </span>

                </div>


                <!-- Connector 3 -->
                <div
                  id="progress-line-3"
                  style="flex:1;height:2px;background:var(--c-800);margin:0 6px 16px;"
                ></div>


                <!-- Access -->
                <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">

                  <div
                    id="progress-access-circle"
                    style="width:24px;height:24px;border-radius:50%;background:var(--c-800);border:2px solid var(--c-700);display:flex;align-items:center;justify-content:center;"
                  >
                  </div>

                  <span
                    id="progress-access-label"
                    style="font-size:10px;color:var(--c-600);white-space:nowrap;"
                  >
                    Access
                  </span>

                </div>

              </div>

            </div>


            <!-- Request Details -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">

              <div>
                <p class="lbl">Permission Type</p>

                <p
                  id="pending-permission"
                  style="color:var(--c-200);font-size:13px;"
                >
                  Read/Write
                </p>
              </div>


              <div>
                <p class="lbl">Requested Duration</p>

                <p
                  id="pending-duration"
                  style="color:var(--c-200);font-size:13px;"
                >
                  30 days
                </p>
              </div>


              <div>
                <p class="lbl">Request Type</p>

                <p
                  id="pending-type"
                  style="color:var(--c-200);font-size:13px;"
                >
                  Research
                </p>
              </div>


              <div>
                <p class="lbl">Urgency</p>

                <p
                  id="pending-urgency"
                  style="color:var(--c-200);font-size:13px;"
                >
                  Normal
                </p>
              </div>

            </div>

          </div>


          <!-- Access Justification -->
          <div class="card">

            <h2
              style="font-size:14px;font-weight:700;color:var(--c-100);margin:0 0 12px;"
            >
              Access Justification
            </h2>

            <p
              id="pending-justification"
              style="font-size:13px;color:var(--c-400);line-height:1.7;margin:0;"
            >
              I am conducting research on network security protocols as part of my thesis on intrusion detection systems. Access to the Network Security Lab environment is required to run controlled simulations and collect empirical data. This work is supervised by Prof. Ramirez and will contribute to the university's cybersecurity research output.
            </p>

          </div>

        </div>


        <!-- Sidebar info -->
        <div style="display:flex;flex-direction:column;gap:16px;">


          <!-- Request Info -->
          <div class="card">

            <h3
              style="font-size:13px;font-weight:700;color:var(--c-300);margin:0 0 14px;"
            >
              Request Info
            </h3>

            <div style="display:flex;flex-direction:column;gap:10px;">

              <div>

                <p
                  style="font-size:11px;color:var(--c-500);margin:0;"
                >
                  Status
                </p>

                <div style="margin-top:4px;">

                  <span
                    id="request-sidebar-status"
                    class="badge b-amber"
                  >
                    Pending Review
                  </span>

                </div>

              </div>


              <div>

                <p
                  style="font-size:11px;color:var(--c-500);margin:0;"
                >
                  Submitted
                </p>

                <p
                  id="pending-sidebar-submitted"
                  style="font-size:13px;color:var(--c-300);margin:4px 0 0;"
                >
                  Sep 1, 2026 at 10:24 AM
                </p>

              </div>


              <div>

                <p
                  style="font-size:11px;color:var(--c-500);margin:0;"
                >
                  Reviewer
                </p>

                <p
                  style="font-size:13px;color:var(--c-300);margin:4px 0 0;"
                >
                  System Administrator
                </p>

              </div>


              <div>

                <p
                  style="font-size:11px;color:var(--c-500);margin:0;"
                >
                  Expected Decision
                </p>

                <p
                  id="pending-expected-decision"
                  style="font-size:13px;color:var(--c-300);margin:4px 0 0;"
                >
                  Sep 3–4, 2026
                </p>

              </div>

            </div>

          </div>


          <!-- Student -->
          <div class="card">

            <h3
              style="font-size:13px;font-weight:700;color:var(--c-300);margin:0 0 12px;"
            >
              Student
            </h3>

            <div
              style="display:flex;align-items:center;gap:10px;margin-bottom:10px;"
            >

              <div
                id="pending-avatar"
                class="avatar"
              >
                AC
              </div>

              <div>

                <p
                  id="pending-student-name"
                  style="font-size:13px;font-weight:600;color:var(--c-200);margin:0;"
                >
                  Loading student profile…
                </p>

                <p
                  id="pending-student-id"
                  style="font-size:11px;color:var(--c-500);margin:2px 0 0;"
                >
                  2024-112234
                </p>

              </div>

            </div>


            <p
              id="pending-student-course"
              style="font-size:11px;color:var(--c-500);margin:0;"
            >
              3rd Year — Computer Science
            </p>

          </div>


          <!-- Back -->
          <div style="display:flex;flex-direction:column;gap:8px;">

            <a
              href="access-requests.php"
              class="btn btn-ghost"
              style="justify-content:center;"
            >
              ← Back to Requests
            </a>

          </div>

        </div>

      </div>

    </div>

  </div>

</div>


<script src="../script/supabase-client.js"></script>
<script src="../script/shared.js"></script>
<script src="../script/pages/request-pending.js"></script>

</body>
</html>