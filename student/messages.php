<?php require_once __DIR__ . '/../includes/student-guard.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Messages — SecureAccess</title><link rel="stylesheet" href="../style/shared.css">
</head>
<body data-page="messages">
  <div id="sidebar-overlay"></div>
  <div class="app-shell">
    <aside id="sidebar"></aside>
    <main class="main-area">
      <div id="top-bar" data-title="Messages"></div>
      <div class="page-content fade-in">
        <div class="page-header"><h1>Messages</h1><p>Direct conversations with your teachers and administrator.</p></div>
        <div id="student-message-status" class="personnel-status" role="status">Loading your inbox…</div>
        <section class="personnel-message-layout student-message-layout">
          <article class="personnel-panel personnel-message-panel">
            <div class="personnel-panel-heading"><div><p class="personnel-eyebrow">Inbox &amp; sent</p><h2>Conversation</h2></div></div>
            <label class="personnel-message-contact">Conversation
              <select id="student-message-contact" class="sel"><option value="">Loading staff…</option></select>
            </label>
            <div id="student-message-list" class="personnel-message-list" aria-live="polite"><p class="personnel-muted">Loading messages…</p></div>
            <form id="student-message-form" class="personnel-compose">
              <label for="student-message-body">Write a message</label>
              <textarea id="student-message-body" class="textarea" maxlength="4000" rows="3" required placeholder="Ask a question or reply to your staff…"></textarea>
              <div class="personnel-compose-footer"><small>Up to 4,000 characters</small><button id="student-message-send" class="btn btn-primary" type="submit">Send message</button></div>
            </form>
          </article>
          <aside class="personnel-panel personnel-message-info"><span class="personnel-info-icon">✉</span><h2>Talk to your support team</h2><p>Messages are private to you and the staff member you contact.</p><ul><li>Teachers can help with lessons, grades, and requests.</li><li>Contact the administrator for account or access-request questions.</li></ul></aside>
        </section>
      </div>
    </main>
  </div>
  <script src="../script/supabase-client.js"></script>
  <script src="../script/shared.js"></script>
  <script src="../script/pages/student-messages.js"></script>
</body>
</html>
