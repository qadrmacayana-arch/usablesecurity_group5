<?php
$personnelPage = 'messages';
$personnelTitle = 'Messages';
$personnelScript = '../script/pages/personnel-messages.js';
require __DIR__ . '/layout-start.php';
?>
<div class="page-content fade-in personnel-content">
  <section class="personnel-page-heading">
    <div><p class="personnel-eyebrow">Direct communication</p><h1>Messages</h1>
      <p>Contact the administrator or students connected to your requests and gradebook.</p></div>
    <span class="personnel-context-pill">Private conversations</span>
  </section>
  <div id="personnel-message-status" class="personnel-status" role="status">Loading your inbox…</div>
  <section class="personnel-message-layout">
    <article class="personnel-panel personnel-message-panel">
      <div class="personnel-panel-heading"><div><p class="personnel-eyebrow">Inbox &amp; sent</p><h2>Conversation</h2></div></div>
      <label class="personnel-message-contact">Conversation
        <select id="message-contact" class="sel"><option value="">Loading contacts…</option></select>
      </label>
      <div id="personnel-message-list" class="personnel-message-list" aria-live="polite">
        <p class="personnel-muted">Loading messages…</p>
      </div>
      <form id="personnel-message-form" class="personnel-compose">
        <label for="personnel-message-body">Write a message</label>
        <textarea id="personnel-message-body" class="textarea" maxlength="4000" rows="3" required placeholder="Keep your message clear and respectful…"></textarea>
        <div class="personnel-compose-footer"><small>Up to 4,000 characters</small><button id="personnel-message-send" class="btn btn-primary" type="submit">Send message</button></div>
      </form>
    </article>
    <aside class="personnel-panel personnel-message-info">
      <span class="personnel-info-icon">✉</span><h2>Stay in the loop</h2>
      <p>Use messages to clarify student requests, share class updates, or contact your administrator.</p>
      <ul><li>Students can reply from their Messages page.</li><li>Administrators can reply from the Admin Console.</li><li>Only connected students and active staff are available here.</li></ul>
    </aside>
  </section>
</div>
<?php require __DIR__ . '/layout-end.php'; ?>
