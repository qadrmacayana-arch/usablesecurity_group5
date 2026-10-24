(function () {
  'use strict';

  var supabase = null;
  var currentProfile = null;
  var currentRevokeGrant = null;

  document.addEventListener('DOMContentLoaded', function () {
    initializeMonitoring();
  });

  async function initializeMonitoring() {
    try {
      supabase = await window.secureAccessSupabaseReady;

      if (!supabase) {
        throw new Error('Supabase client is not available.');
      }

      await loadCurrentProfile();
      await loadMonitoringData();

    } catch (error) {
      console.error('Monitoring initialization failed:', error);
      showMonitoringError(error.message || 'Unable to load access monitoring.');
    }
  }

  async function loadCurrentProfile() {
    var sessionResult = await supabase.auth.getSession();

    if (sessionResult.error) {
      throw sessionResult.error;
    }

    var session = sessionResult.data.session;

    if (!session || !session.user) {
      window.location.href = '../auth/login.php';
      return;
    }

    var profileResult = await supabase
      .from('profiles')
      .select(`
        id,
        student_id,
        full_name,
        email,
        program,
        year_level,
        clearance_level,
        role,
        account_active
      `)
      .eq('id', session.user.id)
      .maybeSingle();

    if (profileResult.error) {
      throw profileResult.error;
    }

    if (!profileResult.data) {
      throw new Error('Student profile not found.');
    }

    currentProfile = profileResult.data;

    if (currentProfile.account_active === false) {
      throw new Error('Your account is currently inactive.');
    }
  }

  async function loadMonitoringData() {
    var result = await supabase
      .from('access_grants')
      .select(`
        id,
        request_id,
        student_id,
        resource_id,
        permission,
        status,
        starts_at,
        expires_at,
        revoked_at,
        revoked_by,
        revoke_reason,
        created_at,
        access_requests (
          id,
          request_number,
          permission,
          duration,
          status,
          submitted_at,
          decided_at,
          resources (
            id,
            name,
            category,
            minimum_clearance,
            description
          )
        )
      `)
      .eq('student_id', currentProfile.id)
      .eq('status', 'active')
      .order('expires_at', { ascending: true });

    if (result.error) {
      throw result.error;
    }

    var grants = result.data || [];

    renderMonitoring(grants);
  }

  function renderMonitoring(grants) {
    var title = document.getElementById('active-access-title');
    var grid = document.getElementById('access-grid');

    if (!title || !grid) {
      console.error('Monitoring HTML elements were not found.');
      return;
    }

    title.textContent =
      'Active Access Permissions (' + grants.length + ')';

    grid.innerHTML = '';

    if (grants.length === 0) {
      grid.innerHTML = createEmptyState();

      updateExpirationBanner([]);

      return;
    }

    grants.forEach(function (grant) {
      grid.appendChild(createGrantCard(grant));
    });

    updateExpirationBanner(grants);
  }

  function createGrantCard(grant) {
    var request = normalizeObject(grant.access_requests);
    var resource = normalizeObject(request.resources);

    var resourceName =
      resource.name || 'Unknown Resource';

    var category =
      resource.category || 'Standard';

    var permission =
      grant.permission ||
      request.permission ||
      'Access';

    var expiresAt =
      grant.expires_at || null;

    var startsAt =
      grant.starts_at || null;

    var daysLeft =
      calculateDaysLeft(expiresAt);

    var expiringSoon =
      daysLeft >= 0 && daysLeft <= 30;

    var card = document.createElement('div');

    card.className = 'monitor-card';

    if (expiringSoon) {
      card.style.borderColor = 'rgba(249,115,22,.3)';
    }

    var requestNumber = Number(request.request_number);

    var requestDisplay = '';

    if (Number.isFinite(requestNumber)) {
      requestDisplay =
        'REQ-2026-' +
        String(requestNumber).padStart(3, '0');
    }

    var icon = getResourceIcon(resourceName);

    var expiryText = formatDate(expiresAt);

    var statusText = expiringSoon
      ? 'Expiring'
      : 'Active';

    var statusClass = expiringSoon
      ? 'b-orange'
      : 'b-green';

    var daysText = '';

    if (daysLeft < 0) {
      daysText = 'Expired';
    } else if (daysLeft === 0) {
      daysText = 'Expires today';
    } else if (daysLeft === 1) {
      daysText = '1 day left';
    } else {
      daysText = daysLeft + ' days left';
    }

    var progressWidth =
      calculateProgressWidth(startsAt, expiresAt);

    var progressColor =
      expiringSoon
        ? 'var(--c-orange)'
        : 'var(--c-green)';

    var credentialButton = '';

    if (requestDisplay) {
      credentialButton =
        '<a href="credential.php?request=' +
        encodeURIComponent(requestDisplay) +
        '" class="btn btn-ghost btn-sm">View Credential</a>';
    }

    card.innerHTML = `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;border-radius:8px;background:rgba(99,102,241,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${icon}
          </div>

          <div>
            <p style="font-size:14px;font-weight:700;color:var(--c-200);margin:0;">
              ${escapeHtml(resourceName)}
            </p>

            <p style="font-size:11px;color:var(--c-500);margin:2px 0 0;">
              ${escapeHtml(permission)} &bull; ${escapeHtml(category)}
            </p>
          </div>
        </div>

        <span class="badge ${statusClass}">
          ${statusText}
        </span>
      </div>

      <div style="margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
          <span style="font-size:11px;color:var(--c-500);">
            Expires ${escapeHtml(expiryText)}
          </span>

          <span style="font-size:11px;color:${expiringSoon ? 'var(--c-orange)' : 'var(--c-green)'};font-weight:600;">
            ${escapeHtml(daysText)}
          </span>
        </div>

        <div style="height:5px;background:var(--c-800);border-radius:99px;overflow:hidden;">
          <div style="height:100%;width:${progressWidth}%;background:${progressColor};border-radius:99px;transition:width .3s;"></div>
        </div>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${credentialButton}

        <button
          class="btn btn-danger btn-sm revoke-grant-btn"
          type="button"
        >
          Revoke
        </button>
      </div>
    `;

    var revokeButton =
      card.querySelector('.revoke-grant-btn');

    if (revokeButton) {
      revokeButton.addEventListener('click', function () {
        openRevokeForGrant(grant, resourceName);
      });
    }

    return card;
  }

  function createEmptyState() {
    return `
      <div
        style="
          grid-column:1 / -1;
          border:1px dashed var(--c-700);
          border-radius:12px;
          padding:40px 24px;
          text-align:center;
        "
      >
        <div
          style="
            width:44px;
            height:44px;
            margin:0 auto 12px;
            border-radius:10px;
            background:rgba(99,102,241,.12);
            display:flex;
            align-items:center;
            justify-content:center;
          "
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="var(--c-indigo-l)"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 15v2m0-8v4m0-10a9 9 0 110 18 9 9 0 010-18z"
            />
          </svg>
        </div>

        <p
          style="
            font-size:14px;
            font-weight:700;
            color:var(--c-200);
            margin:0 0 6px;
          "
        >
          No active access permissions
        </p>

        <p
          style="
            font-size:12px;
            color:var(--c-500);
            margin:0 0 16px;
          "
        >
          You currently have no active access grants.
        </p>

        <a
          href="submission-form.php"
          class="btn btn-ghost btn-sm"
        >
          Request Access
        </a>
      </div>
    `;
  }

  function updateExpirationBanner(grants) {
    var banner = document.getElementById('expiration-banner');

    if (!banner) {
      return;
    }

    var expiringCount = grants.filter(function (grant) {
      var days = calculateDaysLeft(grant.expires_at);

      return days >= 0 && days <= 30;
    }).length;

    if (expiringCount === 0) {
      banner.style.display = 'none';
      return;
    }

    banner.style.display = 'flex';

    var message =
      document.getElementById('expiration-message');

    if (message) {
      var accessWord =
        expiringCount === 1
          ? 'access'
          : 'accesses';

      message.innerHTML =
        '<strong style="color:var(--c-orange);">' +
        expiringCount +
        ' ' +
        accessWord +
        ' expiring soon.</strong> ' +
        'Renew them before they expire to maintain uninterrupted access.';
    }
  }

  function openRevokeForGrant(grant, resourceName) {
    currentRevokeGrant = grant;

    var modal =
      document.getElementById('revoke-modal');

    var name =
      document.getElementById('revoke-name');

    if (name) {
      name.textContent = resourceName;
    }

    if (modal) {
      modal.classList.add('open');
    }
  }

  window.openRevoke = function (resourceName) {
    var name =
      document.getElementById('revoke-name');

    if (name) {
      name.textContent = resourceName;
    }

    var modal =
      document.getElementById('revoke-modal');

    if (modal) {
      modal.classList.add('open');
    }
  };

  window.closeRevoke = function () {
    var modal =
      document.getElementById('revoke-modal');

    if (modal) {
      modal.classList.remove('open');
    }

    currentRevokeGrant = null;
  };

  window.confirmRevoke = async function () {
    if (!currentRevokeGrant) {
      return;
    }

    if (!supabase || !currentProfile) {
      return;
    }

    var grantId = currentRevokeGrant.id;

    if (!grantId) {
      alert('Unable to identify this access grant.');
      return;
    }

    try {
      var button =
        document.querySelector(
          '#revoke-modal .modal-footer .btn-danger'
        );

      if (button) {
        button.disabled = true;
        button.textContent = 'Revoking...';
      }

      var result = await supabase
        .from('access_grants')
        .update({
          status: 'revoked',
          revoked_at: new Date().toISOString(),
          revoked_by: currentProfile.id,
          revoke_reason: 'Revoked by student'
        })
        .eq('id', grantId)
        .eq('student_id', currentProfile.id);

      if (result.error) {
        throw result.error;
      }

      closeRevoke();

      await loadMonitoringData();

    } catch (error) {
      console.error('Failed to revoke access:', error);

      alert(
        error.message ||
        'Unable to revoke this access permission.'
      );

    } finally {
      var button =
        document.querySelector(
          '#revoke-modal .modal-footer .btn-danger'
        );

      if (button) {
        button.disabled = false;
        button.textContent = 'Confirm Revoke';
      }
    }
  };

  function normalizeObject(value) {
    if (Array.isArray(value)) {
      return value[0] || {};
    }

    return value || {};
  }

  function calculateDaysLeft(dateString) {
    if (!dateString) {
      return 0;
    }

    var expiry = new Date(dateString);

    if (Number.isNaN(expiry.getTime())) {
      return 0;
    }

    var now = new Date();

    now.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    var difference =
      expiry.getTime() - now.getTime();

    return Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );
  }

  function calculateProgressWidth(startsAt, expiresAt) {
    if (!startsAt || !expiresAt) {
      return 50;
    }

    var start = new Date(startsAt);
    var end = new Date(expiresAt);
    var now = new Date();

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      return 50;
    }

    var total =
      end.getTime() - start.getTime();

    var elapsed =
      now.getTime() - start.getTime();

    var remaining =
      100 - ((elapsed / total) * 100);

    return Math.max(
      0,
      Math.min(100, remaining)
    );
  }

  function formatDate(dateString) {
    if (!dateString) {
      return 'No expiration date';
    }

    var date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return 'Unknown';
    }

    return date.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }
    );
  }

  function getResourceIcon(resourceName) {
    var name =
      String(resourceName || '').toLowerCase();

    if (name.includes('library')) {
      return `
        <svg width="16" height="16" fill="none"
          stroke="var(--c-indigo-l)"
          viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      `;
    }

    if (name.includes('record')) {
      return `
        <svg width="16" height="16" fill="none"
          stroke="var(--c-blue)"
          viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a3 3 0 006 0M9 5a3 3 0 012-2h2a3 3 0 012 2"
          />
        </svg>
      `;
    }

    if (name.includes('research')) {
      return `
        <svg width="16" height="16" fill="none"
          stroke="var(--c-purple)"
          viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
          />
        </svg>
      `;
    }

    return `
      <svg width="16" height="16" fill="none"
        stroke="var(--c-green)"
        viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"
        />
      </svg>
    `;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showMonitoringError(message) {
    var grid =
      document.getElementById('access-grid');

    var title =
      document.getElementById('active-access-title');

    if (title) {
      title.textContent =
        'Active Access Permissions';
    }

    if (grid) {
      grid.innerHTML = `
        <div
          style="
            grid-column:1 / -1;
            border:1px solid rgba(248,113,113,.25);
            background:rgba(248,113,113,.06);
            border-radius:12px;
            padding:24px;
          "
        >
          <p
            style="
              color:var(--c-red);
              font-weight:700;
              margin:0 0 6px;
            "
          >
            Unable to load access permissions
          </p>

          <p
            style="
              color:var(--c-400);
              font-size:12px;
              margin:0;
            "
          >
            ${escapeHtml(message)}
          </p>
        </div>
      `;
    }
  }

})();