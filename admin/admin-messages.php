<?php require_once __DIR__ . "/../includes/admin-guard.php"; ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Messages — Admin Console</title>
    <link rel="stylesheet" href="../style/shared.css">
  </head>

  <body data-admin-page="messages">

    <div class="app-shell">

      <aside id="admin-sidebar"></aside>

      <main class="main-area">

        <div id="admin-top-bar" data-title="Messages"></div>

        <div class="page-content fade-in">

          <div class="page-header">
            <h1>Message history</h1>
            <p>Direct conversations with students and faculty, alongside automated request updates.</p>
          </div>

          <section class="card admin-direct-messages" aria-labelledby="admin-direct-heading">
            <div class="section-head">
              <div><h2 id="admin-direct-heading">Direct messages</h2><p>Read and reply to messages from students and faculty.</p></div>
            </div>
            <div id="admin-direct-message-status" class="personnel-status" role="status">Loading direct messages…</div>
            <div class="admin-direct-message-grid">
              <div id="admin-direct-message-list" class="personnel-message-list" aria-live="polite">
                <p style="color:var(--c-500);font-size:13px;">Loading conversations…</p>
              </div>
              <form id="admin-direct-message-form" class="personnel-compose">
                <label for="admin-message-recipient">Recipient</label>
                <select id="admin-message-recipient" class="sel" required><option value="">Loading accounts…</option></select>
                <label for="admin-direct-message-body">Message</label>
                <textarea id="admin-direct-message-body" class="textarea" maxlength="4000" rows="4" required placeholder="Write a message…"></textarea>
                <button id="admin-direct-message-send" class="btn btn-primary" type="submit">Send message</button>
              </form>
            </div>
          </section>

          <div class="card" style="max-width:960px;margin-top:22px;">

            <div
              style="
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:10px;
                margin-bottom:18px;
              "
            >

              <div style="display:flex;align-items:center;gap:10px;">

                <div class="avatar" id="message-student-avatar">
                  --
                </div>

                <div>

                  <h2
                    id="message-student-name"
                    style="font-size:15px;color:#fff;margin:0;"
                  >
                    Message History
                  </h2>

                  <p
                    id="message-student-info"
                    style="
                      font-size:12px;
                      color:var(--c-500);
                      margin:2px 0 0;
                    "
                  >
                    Notifications from access request decisions
                  </p>

                </div>

              </div>

            </div>

            <div id="admin-message-list">

              <p
                style="
                  color:var(--c-500);
                  font-size:13px;
                "
              >
                Loading messages...
              </p>

            </div>

          </div>

        </div>

      </main>

    </div>

    <script src="../script/supabase-client.js"></script>
    <script src="../script/admin-shared.js"></script>
    <script src="../script/pages/admin-messages.js"></script>
    <script src="../script/pages/admin-conversations.js"></script>

  </body>
</html>