<?php require_once __DIR__ . "/../includes/admin-guard.php"; ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Active Access — Admin Console</title>
    <link rel="stylesheet" href="../style/shared.css">

  </head>

  <body data-admin-page="access">
    <div class="app-shell">
      <aside id="admin-sidebar"></aside>

      <main class="main-area">
        <div id="admin-top-bar" data-title="Active Access"></div>

        <div class="page-content fade-in">
          <div class="page-header">
            <h1>Active access monitoring</h1>
            <p>Monitor grants, expiration risk, and revoke access when necessary.</p>
          </div>

          <div class="card" style="margin-top:22px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <h2 style="font-size:15px;color:#fff;margin:0;">Current grants</h2>

              <select
                id="access-filter"
                class="sel"
                onchange="filterAccess()"
                style="width:auto;"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="expiring">Expiring soon</option>
              </select>
            </div>

            <table class="tbl">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Resource</th>
                  <th>Granted</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody id="access-list">
                <tr>
                  <td
                    colspan="6"
                    style="text-align:center;padding:30px;color:var(--c-500);"
                  >
                    Loading active access grants...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
<!-- Grant Details Modal -->
<div
  id="grant-details-modal"
  class="modal-backdrop"
  onclick="if (event.target === this) closeGrantDetails()"
>
  <div class="modal">

    <div class="modal-header">
      <h2>Access Grant Details</h2>

      <button
        type="button"
        class="close-btn"
        onclick="closeGrantDetails()"
        aria-label="Close"
      >
        &times;
      </button>
    </div>

    <div id="grant-details-content" class="modal-body">
      <!-- Grant details will be inserted here -->
    </div>

    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-ghost"
        onclick="closeGrantDetails()"
      >
        Close
      </button>

      <button
        type="button"
        id="grant-revoke-button"
        class="btn btn-danger"
        style="display:none;"
      >
        Revoke Access
      </button>
    </div>

  </div>
</div>



    <script src="../script/supabase-client.js"></script>
    <script src="../script/admin-shared.js"></script>
    <script src="../script/pages/admin-access.js"></script>
  </body>
</html>