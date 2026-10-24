<?php require_once __DIR__ . "/../includes/student-guard.php"; ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Access Monitoring — SecureAccess</title>
<link rel="stylesheet" href="../style/shared.css">
</head>
<body data-page="monitoring">
<div id="sidebar-overlay"></div>
<div class="app-shell">
  <aside id="sidebar"></aside>
  <div class="main-area">
    <div id="top-bar" data-title="Access Monitoring"></div>
    <div class="page-content fade-in">

      <div class="page-header">
        <h1>Access Monitoring</h1>
        <p>Monitor your active access permissions, expiration dates, and usage.</p>
      </div>

      <!-- Expiration alert banner -->
      <div
        id="expiration-banner"
        style="
          background:rgba(249,115,22,.08);
          border:1px solid rgba(249,115,22,.3);
          border-radius:10px;
          padding:14px 18px;
          margin-bottom:24px;
          display:none;
          align-items:center;
          gap:12px;
        "
      >
        <svg
          width="18"
          height="18"
          fill="none"
          stroke="var(--c-orange)"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>

        <p
          id="expiration-message"
          style="
            font-size:13px;
            color:var(--c-300);
            margin:0;
          "
        ></p>

        <a
          href="submission-form.php"
          class="btn btn-ghost btn-sm"
          style="margin-left:auto;white-space:nowrap;"
        >
          Request Renewal
        </a>
      </div>

      <!-- Active accesses grid -->
      <div class="section-head">
        <h2 id="active-access-title">
          Active Access Permissions (0)
        </h2>
      </div>

      <div
        style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:16px;
          margin-bottom:28px;
        "
        id="access-grid"
      >
        <!-- monitoring.js loads the real Supabase grants here -->
      </div>


      <!-- Revoke modal -->
      <div class="modal-backdrop" id="revoke-modal">
        <div class="modal" style="max-width:420px;">
          <div class="modal-header">
            <h2 style="font-size:16px;font-weight:700;color:var(--c-red);margin:0;">Revoke Access</h2>
            <button class="close-btn" onclick="closeRevoke()">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <p style="font-size:14px;color:var(--c-300);margin:0 0 16px;">You are about to revoke your own access to <strong id="revoke-name" style="color:#fff;"></strong>. This action cannot be undone.</p>
            <div style="background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.2);border-radius:8px;padding:12px;">
              <p style="font-size:12px;color:var(--c-400);margin:0;">After revoking, you will lose access immediately and will need to submit a new request to regain it.</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeRevoke()">Cancel</button>
            <button class="btn btn-danger" onclick="confirmRevoke()">Confirm Revoke</button>
          </div>
        </div>
      </div>

<script src="../script/supabase-client.js"></script>
<script src="../script/shared.js"></script>
<script src="../script/pages/monitoring.js"></script>
</body>
</html>
