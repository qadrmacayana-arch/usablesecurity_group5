<?php require_once __DIR__ . "/../includes/student-guard.php"; ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Access Credential — SecureAccess</title>

<link rel="stylesheet" href="../style/shared.css">
</head>

<body data-page="monitoring">

<div id="sidebar-overlay"></div>

<div class="app-shell">

  <aside id="sidebar"></aside>

  <div class="main-area">

    <div id="top-bar" data-title="Access Credential"></div>

    <div class="page-content fade-in">

      <div class="page-header">
        <h1>Access Credential</h1>
        <p>Your active digital access pass for verified university resources.</p>
      </div>


      <!-- Loading message -->
      <div id="credential-loading" class="card" style="max-width:900px;">
        <p style="margin:0;color:var(--c-500);">
          Loading your access credential...
        </p>
      </div>


      <!-- Error message -->
      <div
        id="credential-error"
        class="card"
        style="max-width:900px;display:none;"
      >
        <h2 style="font-size:15px;color:var(--c-100);margin:0 0 8px;">
          Credential Unavailable
        </h2>

        <p
          id="credential-error-message"
          style="font-size:13px;color:var(--c-500);margin:0 0 16px;"
        >
          Unable to load your access credential.
        </p>

        <a
          href="access-requests.php"
          class="btn btn-ghost btn-sm"
        >
          Back to Access Requests
        </a>
      </div>


      <!-- Credential content -->
      <div
        id="credential-content"
        style="
          display:none;
          grid-template-columns:auto 1fr;
          gap:28px;
          align-items:start;
          max-width:900px;
        "
      >

        <!-- Credential card -->
        <div class="cred-card">

          <div
            style="
              display:flex;
              align-items:center;
              justify-content:space-between;
              margin-bottom:22px;
              position:relative;
              z-index:1;
            "
          >

            <div>
              <p
                style="
                  font-size:10px;
                  font-weight:700;
                  color:rgba(167,139,250,.7);
                  text-transform:uppercase;
                  letter-spacing:.1em;
                  margin:0;
                "
              >
                University SecureAccess
              </p>

              <p
                style="
                  font-size:13px;
                  font-weight:800;
                  color:#fff;
                  margin:4px 0 0;
                "
              >
                Student Access Pass
              </p>
            </div>

            <div
              style="
                width:32px;
                height:32px;
                border-radius:8px;
                background:rgba(99,102,241,.4);
                display:flex;
                align-items:center;
                justify-content:center;
              "
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="#a78bfa"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>

          </div>


          <!-- Student -->
          <div
            style="
              display:flex;
              align-items:center;
              gap:14px;
              margin-bottom:22px;
              position:relative;
              z-index:1;
            "
          >

            <div
              id="credential-avatar"
              class="avatar"
              style="
                width:48px;
                height:48px;
                font-size:16px;
              "
            >
              --
            </div>

            <div>

              <p
                id="credential-student-name"
                style="
                  font-size:16px;
                  font-weight:700;
                  color:#fff;
                  margin:0;
                "
              >
                Loading...
              </p>

              <p
                id="credential-student-id"
                style="
                  font-size:11px;
                  color:rgba(167,139,250,.8);
                  margin:3px 0 0;
                  font-family:'JetBrains Mono',monospace;
                "
              >
                --
              </p>

            </div>

          </div>


          <!-- QR / Status -->
          <div
            style="
              display:flex;
              align-items:center;
              gap:14px;
              margin-bottom:22px;
              position:relative;
              z-index:1;
            "
          >

            <div class="qr-box">

              <svg width="70" height="70" viewBox="0 0 7 7">
                <rect x="0" y="0" width="3" height="3" fill="#000"/>
                <rect x="1" y="1" width="1" height="1" fill="#fff"/>

                <rect x="4" y="0" width="3" height="3" fill="#000"/>
                <rect x="5" y="1" width="1" height="1" fill="#fff"/>

                <rect x="0" y="4" width="3" height="3" fill="#000"/>
                <rect x="1" y="5" width="1" height="1" fill="#fff"/>

                <rect x="3" y="3" width="1" height="1" fill="#000"/>
                <rect x="4" y="3" width="1" height="1" fill="#000"/>
                <rect x="3" y="4" width="1" height="1" fill="#000"/>
                <rect x="5" y="4" width="1" height="1" fill="#000"/>
                <rect x="4" y="5" width="2" height="1" fill="#000"/>
                <rect x="6" y="6" width="1" height="1" fill="#000"/>
              </svg>

            </div>


            <div>

              <div
                style="
                  display:flex;
                  align-items:center;
                  gap:6px;
                  margin-bottom:8px;
                "
              >

                <div
                  style="
                    width:7px;
                    height:7px;
                    border-radius:50%;
                    background:#34d399;
                    animation:pulse 2s infinite;
                  "
                ></div>

                <span
                  id="credential-status"
                  style="
                    font-size:11px;
                    font-weight:700;
                    color:#34d399;
                    text-transform:uppercase;
                    letter-spacing:.05em;
                  "
                >
                  Active
                </span>

              </div>


              <div class="days-ring">

                <p
                  id="credential-days-left"
                  style="
                    font-size:18px;
                    font-weight:800;
                    color:#34d399;
                    margin:0;
                    line-height:1;
                  "
                >
                  --
                </p>

                <p
                  style="
                    font-size:9px;
                    color:rgba(255,255,255,.5);
                    margin:2px 0 0;
                  "
                >
                  days left
                </p>

              </div>

            </div>

          </div>


          <!-- Credential summary -->
          <div
            style="
              border-top:1px solid rgba(255,255,255,.1);
              padding-top:14px;
              position:relative;
              z-index:1;
            "
          >

            <div
              style="
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:10px;
              "
            >

              <div>
                <p class="lbl">Resource</p>

                <p
                  id="credential-resource"
                  style="
                    font-size:11px;
                    font-weight:600;
                    color: #ffffff !important;
                    margin:3px 0 0;
                  "
                >
                  --
                </p>
              </div>


              <div>
                <p class="lbl">Access Level</p>

                <p
                  id="credential-permission"
                  style="
                    font-size:11px;
                    font-weight:600;
                    color: #ffffff !important;
                    margin:3px 0 0;
                  "
                >
                  --
                </p>
              </div>


              <div>
                <p class="lbl">Issued</p>

                <p
                  id="credential-start"
                  style="
                    font-size:11px;
                    font-weight:600;
                    color: #ffffff !important;
                    margin:3px 0 0;
                  "
                >
                  --
                </p>
              </div>


              <div>
                <p class="lbl">Expires</p>

                <p
                  id="credential-expires"
                  style="
                    font-size:11px;
                    font-weight:600;
                    color: #ffffff !important;
                    margin:3px 0 0;
                  "
                >
                  --
                </p>
              </div>

            </div>

          </div>

        </div>


        <!-- Information panel -->
        <div
          style="
            display:flex;
            flex-direction:column;
            gap:16px;
          "
        >

          <!-- Credential Details -->
          <div class="card">

            <h2
              style="
                font-size:15px;
                font-weight:700;
                color:var(--c-100);
                margin:0 0 16px;
              "
            >
              Credential Details
            </h2>


            <div
              style="
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:14px;
              "
            >

              <div>
                <p class="lbl">Credential ID</p>

                <p
                  id="credential-id"
                  class="mono"
                  style="
                    color:var(--c-300);
                    font-size:12px;
                  "
                >
                  --
                </p>
              </div>


              <div>
                <p class="lbl">Status</p>

                <div style="margin-top:4px;">

                  <span
                    id="credential-detail-status"
                    class="badge b-green"
                  >
                    Active
                  </span>

                </div>
              </div>


              <div>
                <p class="lbl">Holder</p>

                <p
                  id="credential-detail-name"
                  style="
                    color:var(--c-300);
                    font-size:13px;
                  "
                >
                  --
                </p>
              </div>


              <div>
                <p class="lbl">Student ID</p>

                <p
                  id="credential-detail-student-id"
                  class="mono"
                  style="
                    color:var(--c-300);
                    font-size:13px;
                  "
                >
                  --
                </p>
              </div>


              <div>
                <p class="lbl">Resource</p>

                <p
                  id="credential-detail-resource"
                  style="
                    color:var(--c-300);
                    font-size:13px;
                  "
                >
                  --
                </p>
              </div>


              <div>
                <p class="lbl">Security Level</p>

                <div style="margin-top:4px;">

                  <span
                    id="credential-security"
                    class="pip pip-standard"
                  >
                    --
                  </span>

                </div>
              </div>


              <div>
                <p class="lbl">Permission</p>

                <p
                  id="credential-detail-permission"
                  style="
                    color:var(--c-300);
                    font-size:13px;
                  "
                >
                  --
                </p>
              </div>


              <div>
                <p class="lbl">Request Reference</p>

                <p
                  id="credential-request"
                  class="mono"
                  style="
                    color:var(--c-300);
                    font-size:12px;
                  "
                >
                  --
                </p>
              </div>

            </div>

          </div>


          <!-- Expiration -->
          <div class="card">

            <h2
              style="
                font-size:14px;
                font-weight:700;
                color:var(--c-100);
                margin:0 0 12px;
              "
            >
              Expiration &amp; Renewal
            </h2>


            <div style="margin-bottom:12px;">

              <div
                style="
                  display:flex;
                  justify-content:space-between;
                  margin-bottom:6px;
                "
              >

                <span
                  style="
                    font-size:12px;
                    color:var(--c-500);
                  "
                >
                  Time remaining
                </span>

                <span
                  id="credential-time-used"
                  style="
                    font-size:12px;
                    color:var(--c-orange);
                    font-weight:600;
                  "
                >
                  --
                </span>

              </div>


              <div
                style="
                  height:6px;
                  background:var(--c-800);
                  border-radius:99px;
                  overflow:hidden;
                "
              >

                <div
                  id="credential-progress"
                  style="
                    height:100%;
                    width:0%;
                    background:var(--c-green);
                    border-radius:99px;
                  "
                ></div>

              </div>

            </div>


            <p
              id="credential-expiration-message"
              style="
                font-size:12px;
                color:var(--c-500);
                margin:0 0 12px;
              "
            >
              Loading expiration information...
            </p>


            <a
              href="submission-form.php"
              class="btn btn-ghost btn-sm"
            >
              Request Renewal
            </a>

          </div>


          <!-- Usage Policy -->
          <div class="card">

            <h2
              style="
                font-size:14px;
                font-weight:700;
                color:var(--c-100);
                margin:0 0 12px;
              "
            >
              Usage Policy Reminder
            </h2>

            <ul
              style="
                font-size:12px;
                color:var(--c-500);
                line-height:1.8;
                padding-left:16px;
                margin:0;
              "
            >

              <li>
                Use this credential for authorized academic purposes only
              </li>

              <li>
                Do not share or transfer access to other individuals
              </li>

              <li>
                All sessions are logged and monitored
              </li>

              <li>
                Report any unauthorized use immediately to IT Security
              </li>

            </ul>

          </div>

        </div>

      </div>

    </div>

  </div>

</div>


<!-- Supabase must load before credential.js -->
<script src="../script/shared.js"></script>
<script src="../script/supabase-client.js"></script>
<script src="../script/pages/credential.js"></script>
</body>
</html>