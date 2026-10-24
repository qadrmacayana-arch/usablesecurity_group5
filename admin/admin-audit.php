<?php require_once __DIR__ . "/../includes/admin-guard.php"; ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Audit Trail — Admin Console</title>
    <link rel="stylesheet" href="../style/shared.css">
  </head>

  <body data-admin-page="audit">
    <div class="app-shell">
      <aside id="admin-sidebar"></aside>

      <main class="main-area">
        <div id="admin-top-bar" data-title="Audit Trail"></div>

        <div class="page-content fade-in">

          <div class="page-header">
            <h1>Administrator audit trail</h1>
            <p>
              Every decision and message is recorded for accountability.
            </p>
          </div>

          <div
            class="card"
            style="margin-top:22px;padding:0;overflow:hidden;"
          >
            <table class="tbl">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Reference</th>
                  <th>Timestamp</th>
                </tr>
              </thead>

              <tbody id="audit-list">
                <tr>
                  <td
                    colspan="3"
                    style="color:var(--c-500);"
                  >
                    Loading audit activity...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>

    <script src="../script/supabase-client.js"></script>
    <script src="../script/admin-shared.js"></script>
    <script src="../script/pages/admin-audit.js"></script>
  </body>
</html>