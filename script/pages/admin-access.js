(function () {
  'use strict';

  var currentGrants = [];
  var selectedGrantId = null;

  function escapeHtml(value) {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDateTime(value) {
    if (!value) {
      return '—';
    }

    var date = new Date(value);

    if (isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleString();
  }

  function formatDate(value) {
    if (!value) {
      return '—';
    }

    var date = new Date(value);

    if (isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleDateString();
  }

  function getStatusLabel(status) {
    if (!status) {
      return 'Unknown';
    }

    var value = String(status).toLowerCase();

    if (value === 'active') {
      return 'Active';
    }

    if (value === 'revoked') {
      return 'Revoked';
    }

    if (value === 'expired') {
      return 'Expired';
    }

    return status;
  }

  function getStatusClass(status) {
    var value = String(status || '').toLowerCase();

    if (value === 'active') {
      return 'b-green';
    }

    if (value === 'revoked' || value === 'expired') {
      return 'b-red';
    }

    return 'b-yellow';
  }

  function isExpiringSoon(grant) {
    if (!grant.expires_at) {
      return false;
    }

    if (String(grant.status).toLowerCase() !== 'active') {
      return false;
    }

    var now = new Date();
    var expires = new Date(grant.expires_at);

    if (isNaN(expires.getTime())) {
      return false;
    }

    var difference = expires.getTime() - now.getTime();
    var sevenDays = 7 * 24 * 60 * 60 * 1000;

    return difference > 0 && difference <= sevenDays;
  }

  async function loadAccessGrants() {
    var supabase = await window.secureAccessSupabaseReady;

    if (!supabase) {
      throw new Error('Supabase client is unavailable.');
    }

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
        created_at
      `)
      .order('created_at', {
        ascending: false
      });

    if (result.error) {
      throw result.error;
    }

    var grants = result.data || [];

    if (!grants.length) {
      return [];
    }

    var studentIds = [];
    var resourceIds = [];
    var requestIds = [];
    var revokedByIds = [];

    grants.forEach(function (grant) {
      if (grant.student_id && studentIds.indexOf(grant.student_id) === -1) {
        studentIds.push(grant.student_id);
      }

      if (grant.resource_id && resourceIds.indexOf(grant.resource_id) === -1) {
        resourceIds.push(grant.resource_id);
      }

      if (grant.request_id && requestIds.indexOf(grant.request_id) === -1) {
        requestIds.push(grant.request_id);
      }

      if (grant.revoked_by && revokedByIds.indexOf(grant.revoked_by) === -1) {
        revokedByIds.push(grant.revoked_by);
      }
    });

    var profilesResult = await supabase
      .from('profiles')
      .select(`
        id,
        student_id,
        full_name,
        email,
        role
      `)
      .in('id', studentIds);

    if (profilesResult.error) {
      throw profilesResult.error;
    }

    var resourcesResult = await supabase
      .from('resources')
      .select(`
        id,
        name,
        category,
        minimum_clearance
      `)
      .in('id', resourceIds);

    if (resourcesResult.error) {
      throw resourcesResult.error;
    }

    var requestsResult = await supabase
      .from('access_requests')
      .select(`
        id,
        request_number,
        reviewer_id,
        requester_id
      `)
      .in('id', requestIds);

    if (requestsResult.error) {
      throw requestsResult.error;
    }

    var revokedProfilesResult = {
      data: [],
      error: null
    };

    if (revokedByIds.length) {
      revokedProfilesResult = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email
        `)
        .in('id', revokedByIds);

      if (revokedProfilesResult.error) {
        throw revokedProfilesResult.error;
      }
    }

    var profiles = profilesResult.data || [];
    var resources = resourcesResult.data || [];
    var requests = requestsResult.data || [];
    var revokedProfiles = revokedProfilesResult.data || [];

    function findById(items, id) {
      return items.find(function (item) {
        return item.id === id;
      }) || null;
    }

    return grants.map(function (grant) {
      var student = findById(profiles, grant.student_id);
      var resource = findById(resources, grant.resource_id);
      var request = findById(requests, grant.request_id);
      var revokedBy = findById(revokedProfiles, grant.revoked_by);

      return {
        id: grant.id,
        requestId: grant.request_id,
        requestNumber: request
          ? 'REQ-' +
            new Date(grant.created_at || Date.now()).getFullYear() +
            '-' +
            String(request.request_number).padStart(3, '0')
          : '—',

        studentId: grant.student_id,
        student: student
          ? (student.full_name || student.email || grant.student_id)
          : grant.student_id,

        resourceId: grant.resource_id,
        resource: resource
          ? resource.name
          : grant.resource_id,

        category: resource
          ? resource.category
          : '—',

        permission: grant.permission,

        granted: formatDate(grant.starts_at),
        grantedFull: formatDateTime(grant.starts_at),

        expires: formatDate(grant.expires_at),
        expiresFull: formatDateTime(grant.expires_at),

        status: getStatusLabel(grant.status),

        startsAt: grant.starts_at,
        expiresAt: grant.expires_at,

        revokedAt: grant.revoked_at
          ? formatDateTime(grant.revoked_at)
          : '',

        revocationReason: grant.revoke_reason || '',

        revokedBy: revokedBy
          ? (revokedBy.full_name || revokedBy.email)
          : '—',

        reviewerId: request
          ? request.reviewer_id
          : null,

        raw: grant
      };
    });
  }

  function renderAccessGrants() {
    var list = document.getElementById('access-list');

    if (!list) {
      return;
    }

    list.innerHTML = '';

    if (!currentGrants.length) {
      list.innerHTML =
        '<tr>' +
          '<td colspan="6" style="text-align:center;padding:24px;">' +
            'No access grants found.' +
          '</td>' +
        '</tr>';

      return;
    }

    currentGrants.forEach(function (grant) {
      var row = document.createElement('tr');

      row.setAttribute(
        'data-status',
        String(grant.status).toLowerCase()
      );

      row.setAttribute(
        'data-grant-id',
        grant.id
      );

      row.setAttribute(
        'data-expiring-soon',
        isExpiringSoon(grant) ? 'true' : 'false'
      );

      row.innerHTML =
        '<td>' +
          escapeHtml(grant.student) +
        '</td>' +

        '<td>' +
          escapeHtml(grant.resource) +
        '</td>' +

        '<td>' +
          escapeHtml(grant.granted) +
        '</td>' +

        '<td>' +
          escapeHtml(grant.expires) +
        '</td>' +

        '<td>' +
          '<span class="badge ' +
            getStatusClass(grant.status) +
          '">' +
            escapeHtml(grant.status) +
          '</span>' +
        '</td>' +

        '<td>' +
          '<button class="btn btn-ghost btn-sm" ' +
          'onclick="showGrantDetails(\'' +
          grant.id +
          '\')">' +
            'Details' +
          '</button>' +
        '</td>';

      list.appendChild(row);
    });

    filterAccess();
  }

  window.showGrantDetails = function (grantId) {
    var grant = currentGrants.find(function (item) {
      return item.id === grantId;
    });

    if (!grant) {
      return;
    }

    var modal = document.getElementById('grant-details-modal');
    var content = document.getElementById('grant-details-content');

    if (!modal || !content) {
      return;
    }

    content.innerHTML =
      '<div style="display:grid;gap:14px;">' +

        '<div>' +
          '<p class="lbl">Grant ID</p>' +
          '<p style="color:var(--c-200);margin:4px 0 0;">' +
            escapeHtml(grant.id) +
          '</p>' +
        '</div>' +

        '<div>' +
          '<p class="lbl">Request</p>' +
          '<p style="color:var(--c-200);margin:4px 0 0;">' +
            escapeHtml(grant.requestNumber) +
          '</p>' +
        '</div>' +

        '<div>' +
          '<p class="lbl">Request ID</p>' +
          '<p style="color:var(--c-200);margin:4px 0 0;">' +
            escapeHtml(grant.requestId) +
          '</p>' +
        '</div>' +

        '<div>' +
          '<p class="lbl">Student</p>' +
          '<p style="color:var(--c-200);margin:4px 0 0;">' +
            escapeHtml(grant.student) +
            ' · ' +
            escapeHtml(grant.studentId) +
          '</p>' +
        '</div>' +

        '<div>' +
          '<p class="lbl">Resource</p>' +
          '<p style="color:var(--c-200);margin:4px 0 0;">' +
            escapeHtml(grant.resource) +
          '</p>' +
        '</div>' +

        '<div>' +
          '<p class="lbl">Permission</p>' +
          '<p style="color:var(--c-200);margin:4px 0 0;">' +
            escapeHtml(grant.permission) +
          '</p>' +
        '</div>' +

        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +

          '<div>' +
            '<p class="lbl">Granted</p>' +
            '<p style="color:var(--c-200);margin:4px 0 0;">' +
              escapeHtml(grant.grantedFull) +
            '</p>' +
          '</div>' +

          '<div>' +
            '<p class="lbl">Expires</p>' +
            '<p style="color:var(--c-200);margin:4px 0 0;">' +
              escapeHtml(grant.expiresFull) +
            '</p>' +
          '</div>' +

        '</div>' +

        '<div>' +
          '<p class="lbl">Approver</p>' +
          '<p style="color:var(--c-200);margin:4px 0 0;">' +
            'Administrator' +
          '</p>' +
        '</div>' +

        '<div>' +
          '<p class="lbl">Status</p>' +
          '<span class="badge ' +
            getStatusClass(grant.status) +
          '">' +
            escapeHtml(grant.status) +
          '</span>' +
        '</div>' +

        (
          grant.status === 'Revoked'
            ? (
                '<div>' +
                  '<p class="lbl">Revoked At</p>' +
                  '<p style="color:var(--c-200);margin:4px 0 0;">' +
                    escapeHtml(grant.revokedAt || 'Not recorded') +
                  '</p>' +
                '</div>' +

                '<div>' +
                  '<p class="lbl">Revocation Reason</p>' +
                  '<p style="color:var(--c-200);margin:4px 0 0;line-height:1.6;">' +
                    escapeHtml(
                      grant.revocationReason ||
                      'No reason recorded'
                    ) +
                  '</p>' +
                '</div>'
              )
            : ''
        ) +

      '</div>';

    var revokeButton =
      document.getElementById('revoke-grant-btn');

    if (revokeButton) {
      if (grant.status === 'Revoked' ||
          grant.status === 'Expired') {

        revokeButton.style.display = 'none';

      } else {

        revokeButton.style.display = 'inline-flex';

        revokeButton.onclick = function () {
          openRevokeModal(grant.id);
        };
      }
    }

    modal.style.display = 'flex';
  };

  window.closeGrantDetails = function () {
    var modal =
      document.getElementById('grant-details-modal');

    if (modal) {
      modal.style.display = 'none';
    }
  };

  window.openRevokeModal = function (grantId) {
    selectedGrantId = grantId;

    var modal =
      document.getElementById('revoke-modal');

    var reason =
      document.getElementById('revoke-reason');

    var error =
      document.getElementById('revoke-error');

    if (reason) {
      reason.value = '';
    }

    if (error) {
      error.style.display = 'none';
    }

    if (modal) {
      modal.style.display = 'flex';
    }
  };

  window.closeRevokeModal = function () {
    var modal =
      document.getElementById('revoke-modal');

    if (modal) {
      modal.style.display = 'none';
    }

    selectedGrantId = null;
  };

  async function performRevoke(grantId, reason) {
    var supabase = await window.secureAccessSupabaseReady;

    if (!supabase) {
      throw new Error('Supabase client is unavailable.');
    }

    var sessionResult =
      await supabase.auth.getSession();

    if (sessionResult.error) {
      throw sessionResult.error;
    }

    var session = sessionResult.data.session;

    if (!session || !session.user) {
      throw new Error('Administrator session not found.');
    }

    var updateResult = await supabase
      .from('access_grants')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoked_by: session.user.id,
        revoke_reason: reason
      })
      .eq('id', grantId)
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
        created_at
      `)
      .single();

    if (updateResult.error) {
      throw updateResult.error;
    }

    var grant = currentGrants.find(function (item) {
      return item.id === grantId;
    });

    if (grant) {
      var auditResult = await supabase
        .from('audit_logs')
        .insert({
          actor_id: session.user.id,
          subject_id: grant.studentId,
          request_id: grant.requestId,
          action: 'Access Grant Revoked',
          category: 'Access Grant',
          resource_name: grant.resource,
          outcome: 'Revoked',
          metadata: {
            grant_id: grant.id,
            request_number: grant.requestNumber,
            permission: grant.permission,
            revoke_reason: reason
          }
        });

      if (auditResult.error) {
        console.error(
          'Unable to create revoke audit log:',
          auditResult.error
        );
      }
    }

    return updateResult.data;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var confirmButton =
      document.getElementById('confirm-revoke-btn');

    if (confirmButton) {
      confirmButton.addEventListener(
        'click',
        async function () {

          if (!selectedGrantId) {
            return;
          }

          var reasonElement =
            document.getElementById('revoke-reason');

          var error =
            document.getElementById('revoke-error');

          var reason =
            reasonElement
              ? reasonElement.value.trim()
              : '';

          if (!reason) {
            if (error) {
              error.style.display = 'block';
            }

            return;
          }

          confirmButton.disabled = true;

          try {

            await performRevoke(
              selectedGrantId,
              reason
            );

            window.closeRevokeModal();
            window.closeGrantDetails();

            await initializePage();

          } catch (errorObject) {

            console.error(
              'Unable to revoke access grant:',
              errorObject
            );

            if (error) {
              error.textContent =
                errorObject.message ||
                'Unable to revoke access.';

              error.style.display = 'block';
            }

          } finally {
            confirmButton.disabled = false;
          }
        }
      );
    }
  });

  window.filterAccess = function () {
    var filter =
      document.getElementById('access-filter');

    if (!filter) {
      return;
    }

    var value = filter.value;

    document.querySelectorAll(
      '#access-list tr'
    ).forEach(function (row) {

      var status =
        row.getAttribute('data-status');

      var expiring =
        row.getAttribute('data-expiring-soon');

      if (!value) {
        row.style.display = '';
        return;
      }

      if (value === 'expiring') {
        row.style.display =
          expiring === 'true'
            ? ''
            : 'none';

        return;
      }

      row.style.display =
        status === value
          ? ''
          : 'none';
    });
  };

  async function initializePage() {
    var list =
      document.getElementById('access-list');

    if (list) {
      list.innerHTML =
        '<tr>' +
          '<td colspan="6" style="text-align:center;padding:24px;">' +
            'Loading active access grants...' +
          '</td>' +
        '</tr>';
    }

    try {

      currentGrants =
        await loadAccessGrants();

      renderAccessGrants();

    } catch (error) {

      console.error(
        'Unable to load access grants:',
        error
      );

      if (list) {
        list.innerHTML =
          '<tr>' +
            '<td colspan="6" style="text-align:center;padding:24px;color:#fca5a5;">' +
              'Unable to load access grants. Check the browser console for details.' +
            '</td>' +
          '</tr>';
      }
    }
  }


  window.initializeAdminAccess = initializePage;

window.showGrantDetails = showGrantDetails;

window.filterAccess = filterAccess;

window.performRevoke = performRevoke;

function closeGrantDetails() {
  var modal = document.getElementById('grant-details-modal');

  if (modal) {
    modal.classList.remove('open');
    modal.style.display = 'none';
  }
}

window.closeGrantDetails = closeGrantDetails;

if (
  window.secureAccessSupabaseReady &&
  document.readyState === 'loading'
) {
  document.addEventListener(
    'DOMContentLoaded',
    initializePage
  );
} else if (
  document.readyState !== 'loading'
) {
  initializePage();
}

})();