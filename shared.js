// ─── SIDEBAR HTML ──────────────────────────────────────────────

var SIDEBAR_HTML = `
<div style="padding:20px;border-bottom:1px solid var(--c-800);flex-shrink:0;">
  <div style="display:flex;align-items:center;gap:12px;">
    <div style="width:36px;height:36px;border-radius:10px;background:var(--c-indigo-d);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
      <svg width="18" height="18" fill="none" stroke="#fff" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
    </div>
    <div>
      <p style="font-size:13px;font-weight:700;color:#fff;line-height:1;margin:0;">SecureAccess</p>
      <p style="font-size:11px;color:var(--c-500);margin:3px 0 0;">Student Portal</p>
    </div>
  </div>
</div>

<div style="padding:12px 16px;border-bottom:1px solid var(--c-800);flex-shrink:0;">
  <div class="profile-card">
    <div style="display:flex;align-items:center;gap:12px;">
      <div class="avatar">AC</div>
      <div class="min-w-0">
        <p style="font-size:14px;font-weight:600;color:#fff;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Alexandra Chen</p>
        <p style="font-size:11px;color:var(--c-400);margin:2px 0 0;">STU-2024-0847</p>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;">
      <div class="profile-meta"><p style="font-size:10px;color:var(--c-500);margin:0;">Program</p><p style="font-size:11px;font-weight:500;color:var(--c-300);margin:2px 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Comp. Science</p></div>
      <div class="profile-meta"><p style="font-size:10px;color:var(--c-500);margin:0;">Year</p><p style="font-size:11px;font-weight:500;color:var(--c-300);margin:2px 0 0;">3rd Year</p></div>
    </div>
    <div style="display:flex;align-items:center;gap:6px;margin-top:8px;">
      <div style="width:6px;height:6px;border-radius:50%;background:#34d399;animation:pulse 2s ease-in-out infinite;"></div>
      <p style="font-size:11px;color:#34d399;margin:0;">Active &middot; Identity Verified</p>
    </div>
  </div>
</div>

<nav style="flex:1;overflow-y:auto;padding:10px;" id="sidebar-nav">
  <div style="margin-bottom:10px;">
    <p class="nav-group-label">Overview</p>
    <a href="dashboard.html" class="nav-btn" data-page="dashboard">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
      Dashboard
    </a>
    <a href="notifications.html" class="nav-btn" data-page="notifications">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
      Notifications
      <span class="nav-badge" id="sb-notif-badge">3</span>
    </a>
  </div>
  <div style="margin-bottom:10px;">
    <p class="nav-group-label">Access Management</p>
    <a href="access-requests.html" class="nav-btn" data-page="access-requests">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
      Access Requests
      <span class="nav-badge" id="sb-pending-badge">1</span>
    </a>
    <a href="submission-form.html" class="nav-btn" data-page="submission-form">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 4v16m8-8H4"/></svg>
      Submission Form
    </a>
    <a href="history.html" class="nav-btn" data-page="history">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
      Request History
    </a>
    <a href="monitoring.html" class="nav-btn" data-page="monitoring">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
      Access Monitoring
      <span class="nav-badge orange" id="sb-expiring-badge">3</span>
    </a>
  </div>
  <div style="margin-bottom:10px;">
    <p class="nav-group-label">Academic</p>
    <a href="grades.html" class="nav-btn" data-page="grades">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
      Grades
    </a>
    <a href="documents.html" class="nav-btn" data-page="documents">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>
      Documents
    </a>
  </div>
  <div style="margin-bottom:10px;">
    <p class="nav-group-label">Security</p>
    <a href="audit-logs.html" class="nav-btn" data-page="audit-logs">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
      Audit Logs
    </a>
  </div>
  <div>
    <p class="nav-group-label">Account</p>
    <a href="settings.html" class="nav-btn" data-page="settings">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      Settings
    </a>
  </div>
</nav>

<div style="padding:10px;border-top:1px solid var(--c-800);flex-shrink:0;">
  <a href="login.html" class="logout-btn" style="text-decoration:none;">
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
    Log Out
  </a>
</div>
`;

// ─── TOPBAR HTML ──────────────────────────────────────────────

function buildTopBar(pageTitle, pageSubtitle) {
  return `
    <button id="menu-btn" onclick="openSidebar()">
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>
    <div style="flex:1;">
      <p style="font-size:11px;color:var(--c-500);margin:0;">Student Access Permission Request Process Improvement</p>
      <p style="font-size:14px;font-weight:600;color:var(--c-200);margin:2px 0 0;">${pageTitle || 'Management System'}</p>
    </div>
    <div style="display:flex;align-items:center;gap:10px;">
      <a href="notifications.html" style="position:relative;text-decoration:none;display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;color:var(--c-400);" onmouseover="this.style.background='var(--c-800)'" onmouseout="this.style.background='transparent'">
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
        <span style="position:absolute;top:6px;right:6px;width:6px;height:6px;border-radius:50%;background:#6366f1;"></span>
      </a>
      <div class="avatar-sm">AC</div>
    </div>
  `;
}

// ─── INIT ─────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
  // Inject sidebar
  var sb = document.getElementById('sidebar');
  if (sb) {
    sb.innerHTML = SIDEBAR_HTML;
    // Set active link
    var page = document.body.getAttribute('data-page');
    var links = sb.querySelectorAll('.nav-btn[data-page]');
    links.forEach(function (a) {
      if (a.getAttribute('data-page') === page) a.classList.add('active');
    });
  }

  // Build top bar
  var tb = document.getElementById('top-bar');
  if (tb) {
    var title = tb.getAttribute('data-title') || 'Management System';
    tb.innerHTML = buildTopBar(title);
  }

  // Sidebar overlay click
  var overlay = document.getElementById('sidebar-overlay');
  if (overlay) overlay.addEventListener('click', closeSidebar);
});

function openSidebar() {
  var sb = document.getElementById('sidebar');
  var ov = document.getElementById('sidebar-overlay');
  if (sb) sb.classList.add('open');
  if (ov) ov.style.display = 'block';
}
function closeSidebar() {
  var sb = document.getElementById('sidebar');
  var ov = document.getElementById('sidebar-overlay');
  if (sb) sb.classList.remove('open');
  if (ov) ov.style.display = 'none';
}

// ─── SHARED BADGE/PIP HELPERS ─────────────────────────────────

function badge(status) {
  var m = {
    'Active':'b-green','Approved':'b-green','Passed':'b-green','Success':'b-green',
    'Pending':'b-amber','Under Review':'b-amber','Pending Review':'b-amber',
    'Expiring Soon':'b-orange',
    'Rejected':'b-red','Denied':'b-red','Revoked':'b-red',
  };
  return '<span class="badge ' + (m[status] || 'b-slate') + '">' + status + '</span>';
}

function pip(level) {
  var m = { 'Standard':'pip-standard','Restricted':'pip-restricted','High Security':'pip-high','Classified':'pip-classified' };
  var lock = (level === 'High Security' || level === 'Classified')
    ? '<svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>'
    : '';
  return '<span class="pip ' + (m[level] || 'pip-standard') + '">' + lock + level + '</span>';
}

function catTag(cat) {
  var m = { 'Authentication':'cat-auth','Access Request':'cat-request','Access Control':'cat-control','Access Grant':'cat-grant' };
  return '<span class="cat-tag ' + (m[cat] || 'cat-auth') + '">' + cat + '</span>';
}

function icon(d, size) {
  size = size || 16;
  return '<svg width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="' + d + '"/></svg>';
}
