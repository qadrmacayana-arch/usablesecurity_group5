(function () {
  'use strict';

  function loadPendingCount() {
    window.secureAccessSupabaseReady
      .then(function (supabase) {
        return supabase
          .from('access_requests')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending');
      })
      .then(function (result) {
        if (result.error) throw result.error;
        var badge = document.getElementById('admin-pending-badge');
        if (!badge) return;
        var count = result.count || 0;
        badge.textContent = String(count);
        badge.hidden = count === 0;
      })
      .catch(function (error) {
        console.error('Unable to load pending request count:', error);
        var badge = document.getElementById('admin-pending-badge');
        if (badge) badge.hidden = true;
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var sidebar = document.getElementById('admin-sidebar');
    if (sidebar) {
      sidebar.innerHTML = `
        <div class="admin-brand-wrap">
          <div class="admin-brand-mark">SA</div>
          <div>
            <p class="admin-brand-name">SecureAccess</p>
            <p class="admin-brand-subtitle">Admin Console</p>
          </div>
        </div>

        <nav class="admin-nav">
          <p class="nav-group-label">Administration</p>
          <a href="admin-dashboard.php" class="nav-btn" data-admin-page="dashboard">Overview</a>
          <a href="admin-requests.php" class="nav-btn" data-admin-page="requests">Access Requests <span class="nav-badge orange" id="admin-pending-badge" hidden></span></a>
          <a href="admin-students.php" class="nav-btn" data-admin-page="students">Students</a>
          <a href="admin-access.php" class="nav-btn" data-admin-page="access">Active Access</a>
          <a href="admin-messages.php" class="nav-btn" data-admin-page="messages">Messages</a>
          <a href="admin-audit.php" class="nav-btn" data-admin-page="audit">Audit Trail</a>

          <p class="nav-group-label section-spacer">Session</p>
          <a href="../api/logout.php" class="logout-btn">Return to Login</a>
        </nav>
      `;

      var page = document.body.getAttribute('data-admin-page');
      sidebar.querySelectorAll('[data-admin-page]').forEach(function (link) {
        if (link.getAttribute('data-admin-page') === page) link.classList.add('active');
      });
      loadPendingCount();
    }

    var topbar = document.getElementById('admin-top-bar');
    if (topbar) {
      var title = document.createElement('h2');
      title.textContent = topbar.getAttribute('data-title') || 'Admin Console';

      var titleWrap = document.createElement('div');
      titleWrap.className = 'admin-topbar-title-wrap';
      var eyebrow = document.createElement('p');
      eyebrow.className = 'admin-eyebrow';
      eyebrow.textContent = 'Student Access Permission Management';
      titleWrap.append(eyebrow, title);

      var actions = document.createElement('div');
      actions.className = 'admin-topbar-actions';
      var pill = document.createElement('span');
      pill.className = 'admin-page-pill';
      pill.textContent = 'Administrator';
      var avatar = document.createElement('div');
      avatar.className = 'admin-mini-avatar';
      avatar.textContent = 'SA';
      actions.append(pill, avatar);
      topbar.replaceChildren(titleWrap, actions);
    }
  });
})();
