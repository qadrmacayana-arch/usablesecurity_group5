<?php require_once __DIR__ . "/../includes/student-guard.php"; ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Settings — SecureAccess</title>
<link rel="stylesheet" href="../style/shared.css">
</head>

<body data-page="settings">

<div id="sidebar-overlay"></div>

<div class="app-shell">

  <aside id="sidebar"></aside>

  <div class="main-area">

    <div id="top-bar" data-title="Settings"></div>

    <div class="page-content fade-in">

      <div class="page-header">
        <h1>Account Settings</h1>
        <p>Manage your profile, security, and notification preferences.</p>
      </div>


      <div style="display:grid;grid-template-columns:200px 1fr;gap:24px;max-width:900px;">

        <!-- Sidebar tabs -->
        <div>
          <div style="display:flex;flex-direction:column;gap:2px;">

            <button
              class="stab active"
              onclick="showTab('profile',this)">
              Profile
            </button>

            <button
              class="stab"
              onclick="showTab('security',this)">
              Security
            </button>

            <button
              class="stab"
              onclick="showTab('notifications',this)">
              Notifications
            </button>

            <button
              class="stab"
              onclick="showTab('privacy',this)">
              Privacy
            </button>

          </div>
        </div>


        <!-- Tab panels -->
        <div>


          <!-- =====================================================
               PROFILE
          ====================================================== -->

          <div id="tab-profile" class="tab-panel">

            <div class="card" style="margin-bottom:20px;">

              <h2 style="font-size:15px;font-weight:700;color:var(--c-100);margin:0 0 18px;">
                Profile Information
              </h2>


              <div style="display:flex;align-items:center;gap:16px;margin-bottom:22px;padding-bottom:20px;border-bottom:1px solid var(--c-800);">

                <div
                  id="profile-avatar"
                  class="avatar"
                  style="width:56px;height:56px;font-size:18px;">
                  —
                </div>

                <div>

                  <p
                    id="profile-display-name"
                    style="font-size:15px;font-weight:700;color:#fff;margin:0;">
                    Loading profile...
                  </p>

                  <p
                    id="profile-program"
                    style="font-size:12px;color:var(--c-500);margin:3px 0 0;">
                    Loading...
                  </p>

                  <p
                    id="profile-student-id"
                    style="font-size:12px;color:var(--c-500);margin:2px 0 0;"
                    class="mono">
                    Loading...
                  </p>

                </div>

              </div>


              <div class="gap-grid-2" style="margin-bottom:14px;">

                <div>

                  <label class="lbl">
                    First Name
                  </label>

                  <input
                    id="profile-first-name"
                    class="inp"
                    type="text"
                    value="">

                </div>


                <div>

                  <label class="lbl">
                    Surname
                  </label>

                  <input
                    id="profile-surname"
                    class="inp"
                    type="text"
                    value="">

                </div>

              </div>


              <div class="gap-grid-2" style="margin-bottom:14px;">

                <div>

                  <label class="lbl">
                    Middle Name
                  </label>

                  <input
                    id="profile-middle-name"
                    class="inp"
                    type="text"
                    value="">

                </div>


                <div>

                  <label class="lbl">
                    Suffix
                  </label>

                  <select
                    id="profile-suffix"
                    class="sel">

                    <option value="">
                      — None —
                    </option>

                    <option value="Jr.">
                      Jr.
                    </option>

                    <option value="Sr.">
                      Sr.
                    </option>

                    <option value="II">
                      II
                    </option>

                    <option value="III">
                      III
                    </option>

                    <option value="IV">
                      IV
                    </option>

                  </select>

                </div>

              </div>


              <div class="gap-grid-2" style="margin-bottom:14px;">

                <div>

                  <label class="lbl">
                    Email Address
                  </label>

                  <input
                    id="profile-email"
                    class="inp"
                    type="email"
                    value=""
                    readonly
                    style="opacity:.6;cursor:not-allowed;">

                </div>


                <div>

                  <label class="lbl">
                    Phone Number
                  </label>

                  <input
                    id="profile-phone"
                    class="inp"
                    type="tel"
                    value="">

                </div>

              </div>


              <!-- Profile message -->
              <div
                id="profile-message"
                style="display:none;font-size:12px;margin-bottom:12px;">
              </div>


              <div style="display:flex;justify-content:flex-end;gap:10px;">

                <button
                  class="btn btn-ghost"
                  onclick="resetProfileForm()">
                  Cancel
                </button>

                <button
                  class="btn btn-primary"
                  onclick="saveProfile()">
                  Save Changes
                </button>

              </div>

            </div>

          </div>



          <!-- =====================================================
               SECURITY
          ====================================================== -->

          <div
            id="tab-security"
            class="tab-panel"
            style="display:none;">

            <div class="card" style="margin-bottom:20px;">

              <h2 style="font-size:15px;font-weight:700;color:var(--c-100);margin:0 0 18px;">
                Change Password
              </h2>


              <div
                style="max-width:380px;display:flex;flex-direction:column;gap:14px;">

                <div>

                  <label class="lbl">
                    Current Password
                  </label>

                  <input
                    id="current-password"
                    class="inp"
                    type="password"
                    placeholder="••••••••">

                </div>


                <div>

                  <label class="lbl">
                    New Password
                  </label>

                  <input
                    id="new-password"
                    class="inp"
                    type="password"
                    placeholder="••••••••">

                </div>


                <div>

                  <label class="lbl">
                    Confirm New Password
                  </label>

                  <input
                    id="confirm-password"
                    class="inp"
                    type="password"
                    placeholder="••••••••">

                </div>


                <!-- Password message -->
                <div
                  id="password-message"
                  style="display:none;font-size:12px;">
                </div>


                <button
                  class="btn btn-primary"
                  style="align-self:flex-start;"
                  onclick="updatePassword()">
                  Update Password
                </button>

              </div>

            </div>



            <div class="card" style="margin-bottom:20px;">

              <h2 style="font-size:15px;font-weight:700;color:var(--c-100);margin:0 0 18px;">
                Two-Factor Authentication
              </h2>


              <div class="settings-row">

                <div>

                  <p
                    style="font-size:13px;font-weight:600;color:var(--c-300);margin:0 0 3px;">

                    Email OTP
                    <span id="otp-status">
                      (Active)
                    </span>

                  </p>

                  <p
                    id="otp-description"
                    style="font-size:12px;color:var(--c-500);margin:0;">

                    OTP codes are used during account verification.

                  </p>

                </div>


                <label class="toggle">

                  <input
                    id="email-otp-toggle"
                    type="checkbox"
                    checked
                    onchange="saveSecuritySettings()">

                  <div class="toggle-track"></div>

                  <div class="toggle-thumb"></div>

                </label>

              </div>

              <div
                id="security-message"
                style="display:none;font-size:12px;margin-top:12px;">
              </div>


              <div class="settings-row">

                <div>

                  <p
                    style="font-size:13px;font-weight:600;color:var(--c-300);margin:0 0 3px;">
                    Authenticator App
                  </p>

                  <p
                    style="font-size:12px;color:var(--c-500);margin:0;">
                    Use Google Authenticator or similar for enhanced security.
                  </p>

                </div>


                <label class="toggle">

                  <input
                    id="authenticator-toggle"
                    type="checkbox"
                    onchange="saveSecuritySettings()">

                  <div class="toggle-track"></div>

                  <div class="toggle-thumb"></div>

                </label>

              </div>

            </div>



            <div class="card">

              <h2
                style="font-size:15px;font-weight:700;color:var(--c-100);margin:0 0 18px;">
                Active Sessions
              </h2>


              <div
                style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:rgba(52,211,153,.07);border:1px solid rgba(52,211,153,.2);border-radius:8px;">

                <div>

                  <p
                    id="session-device"
                    style="font-size:13px;font-weight:600;color:var(--c-200);margin:0;">
                    Current browser session
                  </p>

                  <p
                    id="session-details"
                    style="font-size:11px;color:var(--c-500);margin:3px 0 0;">
                    This session • Active now
                  </p>

                </div>

                <span class="badge b-green">
                  Current
                </span>

              </div>

            </div>

          </div>



          <!-- =====================================================
               NOTIFICATIONS
          ====================================================== -->

          <div
            id="tab-notifications"
            class="tab-panel"
            style="display:none;">

            <div class="card">

              <h2
                style="font-size:15px;font-weight:700;color:var(--c-100);margin:0 0 18px;">
                Notification Preferences
              </h2>


              <div class="settings-row">

                <div>

                  <p
                    style="font-size:13px;font-weight:600;color:var(--c-300);margin:0 0 3px;">
                    Request Status Updates
                  </p>

                  <p
                    style="font-size:12px;color:var(--c-500);margin:0;">
                    Notify when access requests are approved, denied, or updated.
                  </p>

                </div>


                <label class="toggle">

                  <input
                    id="notify-request-status"
                    type="checkbox"
                    checked
                    onchange="saveNotificationSettings()">

                  <div class="toggle-track"></div>

                  <div class="toggle-thumb"></div>

                </label>

              </div>


              <div class="settings-row">

                <div>

                  <p
                    style="font-size:13px;font-weight:600;color:var(--c-300);margin:0 0 3px;">
                    Expiry Reminders
                  </p>

                  <p
                    style="font-size:12px;color:var(--c-500);margin:0;">
                    Alert me when accesses are about to expire (14, 7, 3 days).
                  </p>

                </div>


                <label class="toggle">

                  <input
                    id="notify-expiry"
                    type="checkbox"
                    checked
                    onchange="saveNotificationSettings()">

                  <div class="toggle-track"></div>

                  <div class="toggle-thumb"></div>

                </label>

              </div>


              <div class="settings-row">

                <div>

                  <p
                    style="font-size:13px;font-weight:600;color:var(--c-300);margin:0 0 3px;">
                    Security Alerts
                  </p>

                  <p
                    style="font-size:12px;color:var(--c-500);margin:0;">
                    Notify on new login activity and unauthorized access attempts.
                  </p>

                </div>


                <label class="toggle">

                  <input
                    id="notify-security"
                    type="checkbox"
                    checked
                    onchange="saveNotificationSettings()">

                  <div class="toggle-track"></div>

                  <div class="toggle-thumb"></div>

                </label>

              </div>


              <div class="settings-row">

                <div>

                  <p
                    style="font-size:13px;font-weight:600;color:var(--c-300);margin:0 0 3px;">
                    Email Notifications
                  </p>

                  <p
                    id="email-notification-description"
                    style="font-size:12px;color:var(--c-500);margin:0;">
                    Send notifications to your registered email address.
                  </p>

                </div>


                <label class="toggle">

                  <input
                    id="notify-email"
                    type="checkbox"
                    checked
                    onchange="saveNotificationSettings()">

                  <div class="toggle-track"></div>

                  <div class="toggle-thumb"></div>

                </label>

              </div>


              <div
                class="settings-row"
                style="border-bottom:none;">

                <div>

                  <p
                    style="font-size:13px;font-weight:600;color:var(--c-300);margin:0 0 3px;">
                    SMS Notifications
                  </p>

                  <p
                    id="sms-notification-description"
                    style="font-size:12px;color:var(--c-500);margin:0;">
                    No registered phone number is currently available.
                  </p>

                </div>


                <label class="toggle">

                  <input
                    id="notify-sms"
                    type="checkbox"
                    onchange="saveNotificationSettings()">

                  <div class="toggle-track"></div>

                  <div class="toggle-thumb"></div>

                </label>

              </div>

            </div>

          </div>



          <!-- =====================================================
               PRIVACY
          ====================================================== -->

          <div
            id="tab-privacy"
            class="tab-panel"
            style="display:none;">

            <div class="card">

              <h2
                style="font-size:15px;font-weight:700;color:var(--c-100);margin:0 0 18px;">
                Privacy &amp; Data
              </h2>


              <div class="settings-row">

                <div>

                  <p
                    style="font-size:13px;font-weight:600;color:var(--c-300);margin:0 0 3px;">
                    Session Logging
                  </p>

                  <p
                    style="font-size:12px;color:var(--c-500);margin:0;">
                    All portal sessions are logged as required by university policy. This cannot be disabled.
                  </p>

                </div>


                <span
                  class="badge b-slate"
                  style="flex-shrink:0;">
                  Required
                </span>

              </div>


              <div class="settings-row">

                <div>

                  <p
                    style="font-size:13px;font-weight:600;color:var(--c-300);margin:0 0 3px;">
                    Audit Trail Visibility
                  </p>

                  <p
                    style="font-size:12px;color:var(--c-500);margin:0;">
                    Allow administrators to view your full audit log for compliance reviews.
                  </p>

                </div>


                <label class="toggle">

                  <input
                    id="privacy-audit"
                    type="checkbox"
                    checked
                    onchange="savePrivacySettings()">

                  <div class="toggle-track"></div>

                  <div class="toggle-thumb"></div>

                </label>

              </div>


              <div
                class="settings-row"
                style="border-bottom:none;">

                <div>

                  <p
                    style="font-size:13px;font-weight:600;color:var(--c-300);margin:0 0 3px;">
                    Data Export
                  </p>

                  <p
                    style="font-size:12px;color:var(--c-500);margin:0;">
                    Download a copy of your request history and account activity.
                  </p>

                </div>


                <button
                  class="btn btn-ghost btn-sm"
                  onclick="exportUserData()">
                  Export
                </button>

              </div>

            </div>

          </div>


        </div>

      </div>

    </div>

  </div>

</div>



<style>

.stab {
  width: 100%;
  text-align: left;
  padding: 9px 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--c-500);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background .15s, color .15s;
  font-family: inherit;
}

.stab:hover {
  background: var(--c-800);
  color: var(--c-300);
}

.stab.active {
  background: rgba(99,102,241,.18);
  color: var(--c-indigo-l);
  font-weight: 600;
}

</style>



<!-- =========================================================
     SCRIPTS
========================================================== -->

<script src="../script/shared.js"></script>
<script src="../script/supabase-client.js"></script>
<script src="../script/pages/settings.js"></script>

</body>
</html>