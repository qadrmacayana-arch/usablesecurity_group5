document.addEventListener('DOMContentLoaded', async function () {

  try {

    // ---------------------------------------------------------
    // WAIT FOR SUPABASE
    // ---------------------------------------------------------
    if (!window.secureAccessSupabaseReady) {
      throw new Error('Supabase client is not available.');
    }

    const supabase = await window.secureAccessSupabaseReady;

    if (!supabase) {
      throw new Error('Unable to initialize Supabase.');
    }


    // ---------------------------------------------------------
    // GET CURRENT SESSION
    // ---------------------------------------------------------
    const {
      data: sessionData,
      error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    const session = sessionData && sessionData.session;

    if (!session || !session.user) {
      showDashboardEmptyState();
      return;
    }

    const userId = session.user.id;


    // ---------------------------------------------------------
    // LOAD STUDENT PROFILE
    // ---------------------------------------------------------
    const {
      data: profile,
      error: profileError
    } = await supabase
      .from('profiles')
      .select('full_name, student_id, role')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Unable to load profile:', profileError);
    }


    // ---------------------------------------------------------
    // DYNAMIC WELCOME MESSAGE
    // ---------------------------------------------------------
    const welcomeElement =
      document.getElementById('dashboard-welcome');

    if (welcomeElement) {

      const fullName =
        profile && profile.full_name
          ? profile.full_name.trim()
          : '';

      const firstName =
        fullName
          ? fullName.split(/\s+/)[0]
          : '';

      welcomeElement.textContent =
        firstName
          ? 'Welcome back, ' + firstName
          : 'Welcome back';
    }


    // ---------------------------------------------------------
    // LOAD STUDENT REQUESTS
    // ---------------------------------------------------------
    const {
      data: requests,
      error: requestsError
    } = await supabase
      .from('access_requests')
      .select(
        'id, request_number, requester_id, resource_id, permission, duration, status, submitted_at, decided_at'
      )
      .eq('requester_id', userId)
      .order('request_number', { ascending: false });

    if (requestsError) {
      throw requestsError;
    }

    const studentRequests = Array.isArray(requests)
      ? requests
      : [];


    // ---------------------------------------------------------
    // LOAD RESOURCES
    // ---------------------------------------------------------
    const resourceIds = [];

    studentRequests.forEach(function (request) {

      if (
        request.resource_id &&
        !resourceIds.includes(request.resource_id)
      ) {
        resourceIds.push(request.resource_id);
      }

    });


    let resources = [];

    if (resourceIds.length > 0) {

      const {
        data: resourceData,
        error: resourcesError
      } = await supabase
        .from('resources')
        .select(
          'id, name, category, minimum_clearance, description'
        )
        .in('id', resourceIds);

      if (resourcesError) {
        console.error(
          'Unable to load resources:',
          resourcesError
        );
      } else {
        resources = Array.isArray(resourceData)
          ? resourceData
          : [];
      }
    }


    // ---------------------------------------------------------
    // RESOURCE LOOKUP
    // ---------------------------------------------------------
    const resourceMap = {};

    resources.forEach(function (resource) {
      resourceMap[resource.id] = resource;
    });


    // ---------------------------------------------------------
    // REQUEST STATISTICS
    // ---------------------------------------------------------
    const totalRequests = studentRequests.length;

    const pendingRequests =
      studentRequests.filter(function (request) {
        return String(request.status || '').toLowerCase() === 'pending';
      }).length;


    // ---------------------------------------------------------
    // LOAD ACCESS GRANTS
    // ---------------------------------------------------------
    const requestIds = studentRequests.map(function (request) {
      return request.id;
    });


    let grants = [];

    if (requestIds.length > 0) {

      const {
        data: grantData,
        error: grantsError
      } = await supabase
        .from('access_grants')
        .select(
          'id, request_id, status, starts_at, expires_at'
        )
        .in('request_id', requestIds);

      if (grantsError) {
        console.error(
          'Unable to load access grants:',
          grantsError
        );
      } else {
        grants = Array.isArray(grantData)
          ? grantData
          : [];
      }
    }


    // ---------------------------------------------------------
    // CURRENT DATE
    // ---------------------------------------------------------
    const now = new Date();

    const thirtyDaysFromNow =
      new Date(
        now.getTime() +
        (30 * 24 * 60 * 60 * 1000)
      );


    // ---------------------------------------------------------
    // ACTIVE GRANTS
    // ---------------------------------------------------------
    const activeGrants =
      grants.filter(function (grant) {

        const status =
          String(grant.status || '').toLowerCase();

        if (status !== 'active') {
          return false;
        }

        const startsAt =
          grant.starts_at
            ? new Date(grant.starts_at)
            : null;

        const expiresAt =
          grant.expires_at
            ? new Date(grant.expires_at)
            : null;

        if (
          startsAt &&
          !isNaN(startsAt.getTime()) &&
          startsAt > now
        ) {
          return false;
        }

        if (
          expiresAt &&
          !isNaN(expiresAt.getTime()) &&
          expiresAt <= now
        ) {
          return false;
        }

        return true;
      });


    // ---------------------------------------------------------
    // EXPIRING SOON
    // ---------------------------------------------------------
    const expiringGrants =
      activeGrants.filter(function (grant) {

        if (!grant.expires_at) {
          return false;
        }

        const expiresAt =
          new Date(grant.expires_at);

        if (isNaN(expiresAt.getTime())) {
          return false;
        }

        return (
          expiresAt > now &&
          expiresAt <= thirtyDaysFromNow
        );
      });


    // ---------------------------------------------------------
    // UPDATE STAT CARDS
    // ---------------------------------------------------------
    const activeAccessElement =
      document.getElementById(
        'dashboard-active-accesses'
      );

    const pendingElement =
      document.getElementById(
        'dashboard-pending'
      );

    const expiringElement =
      document.getElementById(
        'dashboard-expiring'
      );

    const totalRequestsElement =
      document.getElementById(
        'dashboard-total-requests'
      );


    if (activeAccessElement) {
      activeAccessElement.textContent =
        activeGrants.length;
    }

    if (pendingElement) {
      pendingElement.textContent =
        pendingRequests;
    }

    if (expiringElement) {
      expiringElement.textContent =
        expiringGrants.length;
    }

    if (totalRequestsElement) {
      totalRequestsElement.textContent =
        totalRequests;
    }


    // ---------------------------------------------------------
    // ACTIVE ACCESS PERMISSIONS
    // ---------------------------------------------------------
    renderActiveAccesses(
      activeGrants,
      studentRequests,
      resourceMap,
      now
    );


    // ---------------------------------------------------------
    // RECENT REQUESTS
    // ---------------------------------------------------------
    renderRecentRequests(
      studentRequests,
      resourceMap
    );


  } catch (error) {

    console.error(
      'Dashboard loading error:',
      error
    );

    showDashboardError();

  }

});


// =============================================================
// ACTIVE ACCESS PERMISSIONS
// =============================================================

function renderActiveAccesses(
  activeGrants,
  requests,
  resourceMap,
  now
) {

  const container =
    document.getElementById(
      'dashboard-active-access-list'
    );

  if (!container) {
    return;
  }

  container.innerHTML = '';


  if (!activeGrants || activeGrants.length === 0) {

    container.innerHTML =
      '<div style="' +
        'text-align:center;' +
        'color:var(--c-500);' +
        'padding:28px 14px;' +
      '">' +
        'No active access permissions.' +
      '</div>';

    return;
  }


  activeGrants.forEach(function (grant, index) {

    const request =
      requests.find(function (item) {
        return item.id === grant.request_id;
      });

    const resource =
      request && resourceMap[request.resource_id]
        ? resourceMap[request.resource_id]
        : null;


    const resourceName =
      resource && resource.name
        ? resource.name
        : 'Academic Resource';


    const permission =
      request && request.permission
        ? request.permission
        : 'Access';


    const expiresAt =
      grant.expires_at
        ? new Date(grant.expires_at)
        : null;


    let expirationText =
      'No expiration date';


    let badgeClass =
      'b-green';

    let badgeText =
      'Active';


    if (
      expiresAt &&
      !isNaN(expiresAt.getTime())
    ) {

      const daysRemaining =
        Math.ceil(
          (
            expiresAt.getTime() -
            now.getTime()
          ) /
          (24 * 60 * 60 * 1000)
        );


      if (daysRemaining <= 30) {

        expirationText =
          'Expires in ' +
          Math.max(daysRemaining, 0) +
          ' days';

        badgeClass =
          'b-orange';

        badgeText =
          'Expiring';

      } else {

        expirationText =
          'Expires in ' +
          daysRemaining +
          ' days';

        badgeClass =
          'b-green';

        badgeText =
          'Active';
      }
    }


    const iconData =
      getAccessIcon(index);


    const row =
      document.createElement('div');

    row.style.cssText =
      'display:flex;' +
      'align-items:center;' +
      'gap:12px;' +
      'padding:10px;' +
      'background:var(--c-800);' +
      'border-radius:8px;' +
      'border:1px solid var(--c-700);';


    row.innerHTML =
      '<div style="' +
        'width:34px;' +
        'height:34px;' +
        'border-radius:8px;' +
        'background:' + iconData.background + ';' +
        'display:flex;' +
        'align-items:center;' +
        'justify-content:center;' +
        'flex-shrink:0;' +
      '">' +

        iconData.svg +

      '</div>' +

      '<div style="' +
        'flex:1;' +
        'min-width:0;' +
      '">' +

        '<p style="' +
          'font-size:13px;' +
          'font-weight:600;' +
          'color:var(--c-200);' +
          'margin:0;' +
        '">' +
          escapeDashboardHtml(resourceName) +
        '</p>' +

        '<p style="' +
          'font-size:11px;' +
          'color:var(--c-500);' +
          'margin:2px 0 0;' +
        '">' +
          escapeDashboardHtml(permission) +
          ' &bull; ' +
          escapeDashboardHtml(expirationText) +
        '</p>' +

      '</div>' +

      '<span class="badge ' +
        badgeClass +
      '">' +
        badgeText +
      '</span>';


    container.appendChild(row);

  });

}


// =============================================================
// RECENT REQUESTS
// =============================================================

function renderRecentRequests(
  requests,
  resourceMap
) {

  const tbody =
    document.getElementById(
      'dashboard-recent-tbody'
    );

  if (!tbody) {
    return;
  }

  tbody.innerHTML = '';


  if (!requests || requests.length === 0) {

    tbody.innerHTML =
      '<tr>' +
        '<td colspan="3" style="' +
          'text-align:center;' +
          'color:var(--c-500);' +
          'padding:28px 14px;' +
        '">' +
          'No requests yet.' +
        '</td>' +
      '</tr>';

    return;
  }


  // Already ordered newest first,
  // but limit the dashboard to the latest four.
  const recentRequests =
    requests.slice(0, 4);


  recentRequests.forEach(function (request) {

    const resource =
      request.resource_id &&
      resourceMap[request.resource_id]
        ? resourceMap[request.resource_id]
        : null;


    const resourceName =
      resource && resource.name
        ? resource.name
        : 'Academic Resource';


    const status =
      String(request.status || '')
        .toLowerCase();


    let statusClass =
      'b-amber';

    let statusText =
      'Pending';


    if (status === 'approved') {

      statusClass =
        'b-green';

      statusText =
        'Approved';

    } else if (status === 'rejected') {

      statusClass =
        'b-red';

      statusText =
        'Rejected';

    } else if (status === 'pending') {

      statusClass =
        'b-amber';

      statusText =
        'Pending';

    } else {

      statusClass =
        'b-amber';

      statusText =
        request.status
          ? String(request.status)
          : 'Pending';
    }


    const dateText =
      formatDashboardDate(
        request.submitted_at
      );


    const row =
      document.createElement('tr');


    row.innerHTML =
      '<td style="' +
        'color:var(--c-200);' +
        'font-weight:500;' +
      '">' +
        escapeDashboardHtml(resourceName) +
      '</td>' +

      '<td>' +
        '<span class="badge ' +
          statusClass +
        '">' +
          escapeDashboardHtml(statusText) +
        '</span>' +
      '</td>' +

      '<td style="' +
        'color:var(--c-500);' +
        'font-size:12px;' +
      '">' +
        escapeDashboardHtml(dateText) +
      '</td>';


    tbody.appendChild(row);

  });

}


// =============================================================
// ACCESS ICONS
// =============================================================

function getAccessIcon(index) {

  const icons = [

    {
      background:
        'rgba(99,102,241,.2)',

      svg:
        '<svg width="16" height="16" fill="none" stroke="var(--c-indigo-l)" viewBox="0 0 24 24">' +
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" ' +
          'd="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>' +
        '</svg>'
    },

    {
      background:
        'rgba(96,165,250,.1)',

      svg:
        '<svg width="16" height="16" fill="none" stroke="var(--c-blue)" viewBox="0 0 24 24">' +
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" ' +
          'd="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>' +
        '</svg>'
    },

    {
      background:
        'rgba(167,139,250,.1)',

      svg:
        '<svg width="16" height="16" fill="none" stroke="var(--c-purple)" viewBox="0 0 24 24">' +
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" ' +
          'd="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>' +
        '</svg>'
    }

  ];

  return icons[index % icons.length];
}


// =============================================================
// DATE FORMATTER
// =============================================================

function formatDashboardDate(value) {

  if (!value) {
    return '—';
  }

  const date =
    new Date(value);

  if (isNaN(date.getTime())) {
    return '—';
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


// =============================================================
// HTML ESCAPE
// =============================================================

function escapeDashboardHtml(value) {

  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


// =============================================================
// EMPTY / ERROR STATES
// =============================================================

function showDashboardEmptyState() {

  const active =
    document.getElementById(
      'dashboard-active-accesses'
    );

  const pending =
    document.getElementById(
      'dashboard-pending'
    );

  const expiring =
    document.getElementById(
      'dashboard-expiring'
    );

  const total =
    document.getElementById(
      'dashboard-total-requests'
    );


  if (active) active.textContent = '0';
  if (pending) pending.textContent = '0';
  if (expiring) expiring.textContent = '0';
  if (total) total.textContent = '0';


  const activeList =
    document.getElementById(
      'dashboard-active-access-list'
    );

  if (activeList) {

    activeList.innerHTML =
      '<div style="' +
        'text-align:center;' +
        'color:var(--c-500);' +
        'padding:28px 14px;' +
      '">' +
        'No active access permissions.' +
      '</div>';
  }


  const recentBody =
    document.getElementById(
      'dashboard-recent-tbody'
    );

  if (recentBody) {

    recentBody.innerHTML =
      '<tr>' +
        '<td colspan="3" style="' +
          'text-align:center;' +
          'color:var(--c-500);' +
          'padding:28px 14px;' +
        '">' +
          'No requests yet.' +
        '</td>' +
      '</tr>';
  }

}


function showDashboardError() {

  const activeList =
    document.getElementById(
      'dashboard-active-access-list'
    );

  if (activeList) {

    activeList.innerHTML =
      '<div style="' +
        'text-align:center;' +
        'color:var(--c-500);' +
        'padding:28px 14px;' +
      '">' +
        'Unable to load access permissions.' +
      '</div>';
  }


  const recentBody =
    document.getElementById(
      'dashboard-recent-tbody'
    );

  if (recentBody) {

    recentBody.innerHTML =
      '<tr>' +
        '<td colspan="3" style="' +
          'text-align:center;' +
          'color:var(--c-500);' +
          'padding:28px 14px;' +
        '">' +
          'Unable to load recent requests.' +
        '</td>' +
      '</tr>';
  }

}