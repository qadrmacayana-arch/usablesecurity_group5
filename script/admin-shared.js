var ADMIN_REQUEST_KEY = 'secureAccessAdminRequest';
var ADMIN_MESSAGES_KEY = 'secureAccessAdminMessages';
var ADMIN_AUDIT_KEY = 'secureAccessAdminAudit';

function getAdminRequest() {
  var saved = localStorage.getItem(ADMIN_REQUEST_KEY);
  return saved ? JSON.parse(saved) : {
    id: 'REQ-2026-007',
    student: 'Alexandra Chen',
    studentId: 'STU-2024-0847',
    resource: 'Network Security Lab',
    type: 'Research',
    security: 'Restricted',
    submitted: 'Sep 1, 2026',
    status: 'Pending Review',
    decisionReason: ''
  };
}

function saveAdminRequest(request) {
  localStorage.setItem(ADMIN_REQUEST_KEY, JSON.stringify(request));
}

function getAdminMessages() {
  var saved = localStorage.getItem(ADMIN_MESSAGES_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveAdminMessages(messages) {
  localStorage.setItem(ADMIN_MESSAGES_KEY, JSON.stringify(messages));
}

function sendAdminMessage(message) {
  var messages = getAdminMessages();
  messages.unshift({
    text: message,
    sentAt: new Date().toLocaleString(),
    from: 'System Administrator'
  });
  saveAdminMessages(messages);
}

function recordAdminAudit(action, detail) {
  var entries = JSON.parse(localStorage.getItem(ADMIN_AUDIT_KEY) || '[]');
  entries.unshift({ action: action, detail: detail, at: new Date().toLocaleString() });
  localStorage.setItem(ADMIN_AUDIT_KEY, JSON.stringify(entries.slice(0, 50)));
}

function adminBadge(status) {
  var classes = {
    'Approved': 'b-green',
    'Rejected': 'b-red',
    'Pending Review': 'b-amber'
  };
  return '<span class="badge ' + (classes[status] || 'b-slate') + '">' + status + '</span>';
}

document.addEventListener('DOMContentLoaded', function () {
  var sidebar = document.getElementById('admin-sidebar');
  if (sidebar) {
    sidebar.innerHTML = `
      <div style="padding:20px;border-bottom:1px solid var(--c-800);">
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="avatar" style="background:linear-gradient(135deg,#0f766e,#14b8a6);">SA</div>
          <div><p style="font-size:13px;font-weight:700;color:#fff;margin:0;">SecureAccess</p>
          <p style="font-size:11px;color:var(--c-500);margin:3px 0 0;">Admin Console</p></div>
        </div>
      </div>
      <nav style="flex:1;padding:12px 10px;">
        <p class="nav-group-label">Administration</p>
        <a href="admin-dashboard.html" class="nav-btn" data-admin-page="dashboard">Overview</a>
        <a href="admin-requests.html" class="nav-btn" data-admin-page="requests">Access Requests <span class="nav-badge orange" id="admin-pending-badge">1</span></a>
        <a href="admin-students.html" class="nav-btn" data-admin-page="students">Students</a>
        <a href="admin-access.html" class="nav-btn" data-admin-page="access">Active Access</a>
        <a href="admin-messages.html" class="nav-btn" data-admin-page="messages">Messages</a>
        <a href="admin-audit.html" class="nav-btn" data-admin-page="audit">Audit Trail</a>
        <p class="nav-group-label" style="margin-top:20px;">Session</p>
        <a href="login.html" class="logout-btn">Return to Login</a>
      </nav>
    `;
    var page = document.body.getAttribute('data-admin-page');
    sidebar.querySelectorAll('[data-admin-page]').forEach(function (link) {
      if (link.getAttribute('data-admin-page') === page) link.classList.add('active');
    });
    var request = getAdminRequest();
    if (request.status !== 'Pending Review') {
      var badge = document.getElementById('admin-pending-badge');
      if (badge) badge.style.display = 'none';
    }
  }

  var topbar = document.getElementById('admin-top-bar');
  if (topbar) {
    topbar.innerHTML = '<div style="flex:1;"><p style="font-size:11px;color:var(--c-500);margin:0;">Student Access Permission Management</p><p style="font-size:14px;font-weight:600;color:var(--c-200);margin:2px 0 0;">' + topbar.getAttribute('data-title') + '</p></div><span class="badge b-blue">Administrator</span><div class="avatar-sm" style="background:linear-gradient(135deg,#0f766e,#14b8a6);">SA</div>';
  }
});
