<?php
$personnelPage = 'requests';
$personnelTitle = 'Student requests';
$personnelScript = '../script/pages/staff-requests.js';
require __DIR__ . '/layout-start.php';
?>
<div class="page-content fade-in personnel-content">
  <section class="personnel-page-heading">
    <div><p class="personnel-eyebrow">Student support</p><h1>Requests assigned to you</h1>
      <p>Review requests directed to your account and provide context. Final approval or rejection is performed by an administrator.</p></div>
    <a class="btn btn-ghost" href="messages.php">Open messages</a>
  </section>
  <section class="personnel-request-tools" aria-label="Request filters">
    <label class="personnel-search">Search requests
      <input id="request-search" class="inp" type="search" placeholder="Student, request ID, resource…" autocomplete="off">
    </label>
    <label>Status
      <select id="request-status-filter" class="sel">
        <option value="all">All statuses</option><option value="pending">Pending</option>
        <option value="approved">Approved</option><option value="rejected">Rejected</option><option value="cancelled">Cancelled</option>
      </select>
    </label>
    <label>Priority
      <select id="request-priority-filter" class="sel"><option value="all">All priorities</option><option value="urgent">Urgent</option><option value="normal">Normal</option></select>
    </label>
    <label>Sort by
      <select id="request-sort" class="sel"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="urgent">Urgent first</option></select>
    </label>
  </section>
  <div id="staff-requests-status" class="personnel-status" role="status">Loading assigned requests…</div>
  <div class="personnel-panel personnel-table-card">
    <table class="tbl">
      <thead><tr><th>Request ID</th><th>Student</th><th>Resource &amp; permission</th><th>Justification</th><th>Priority</th><th>Submitted</th><th>Status</th></tr></thead>
      <tbody id="staff-requests-body"><tr><td colspan="7" class="personnel-empty-state">Loading assigned requests…</td></tr></tbody>
    </table>
  </div>
</div>
<?php require __DIR__ . '/layout-end.php'; ?>
