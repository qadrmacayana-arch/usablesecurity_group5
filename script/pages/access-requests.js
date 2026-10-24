(function () {
  function filterReqs(filter, btn) {
    document.querySelectorAll('.ftab').forEach(function (button) {
      button.classList.remove('active');
    });

    if (btn) {
      btn.classList.add('active');
    }

    document.querySelectorAll('#req-tbody tr').forEach(function (row) {
      var status = row.getAttribute('data-status');

      row.style.display =
        filter === 'all' || status === filter ? '' : 'none';
    });
  }

  function safeText(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function appendCell(row, value, className, style) {
    var cell = document.createElement('td');

    if (className) {
      cell.className = className;
    }

    if (style) {
      cell.style.cssText = style;
    }

    cell.textContent = safeText(value);
    row.appendChild(cell);
  }

  function renderEmptyState(tbody, message) {
    var row = document.createElement('tr');
    var cell = document.createElement('td');

    cell.colSpan = 7;
    cell.style.cssText =
      'text-align:center;color:var(--c-500);padding:30px;';

    cell.textContent = message;

    row.appendChild(cell);
    tbody.appendChild(row);
  }

  function formatRequestNumber(requestNumber) {
    var number = Number(requestNumber);

    if (!Number.isFinite(number)) {
      return String(requestNumber || '');
    }

    return (
      'REQ-' +
      new Date().getFullYear() +
      '-' +
      String(number).padStart(3, '0')
    );
  }

  function buildRequestUrl(page, request) {
    var requestNumber = request.request_number;

    if (
      requestNumber !== undefined &&
      requestNumber !== null
    ) {
      return (
        page +
        '?request=' +
        encodeURIComponent(
          formatRequestNumber(requestNumber)
        )
      );
    }

    return (
      page +
      '?requestId=' +
      encodeURIComponent(request.id)
    );
  }

  function createViewLink(request, status) {
    var actionCell = document.createElement('td');
    var viewLink = document.createElement('a');

    viewLink.className = 'btn btn-ghost btn-sm';
    viewLink.textContent = 'View';

    if (status === 'approved') {
      viewLink.href = buildRequestUrl(
        'request-approved.php',
        request
      );
    } else if (status === 'rejected') {
      viewLink.href = buildRequestUrl(
        'request-denied.php',
        request
      );
    } else {
      viewLink.href = buildRequestUrl(
        'request-pending.php',
        request
      );
    }

    actionCell.appendChild(viewLink);

    return actionCell;
  }

  /*
   * Convert the resource clearance requirement
   * into a simple classification for display.
   */
  function getSecurityClassification(resource) {
    var clearance = Number(
      resource.minimum_clearance
    );

    if (!Number.isFinite(clearance)) {
      return 'Standard';
    }

    if (clearance >= 5) {
      return 'Classified';
    }

    if (clearance >= 4) {
      return 'Restricted';
    }

    if (clearance >= 3) {
      return 'Restricted';
    }

    return 'Standard';
  }

  function renderRemoteRequests(tbody, requests) {
    tbody.textContent = '';

    var counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0
    };

    requests.forEach(function (request) {
      var status = String(
        request.status || 'pending'
      ).toLowerCase();

      counts[status] =
        (counts[status] || 0) + 1;

      var row = document.createElement('tr');

      row.setAttribute(
        'data-status',
        status
      );

      var resource =
        request.resources || {};

      var label =
        status.charAt(0).toUpperCase() +
        status.slice(1);

      if (status === 'pending') {
        label = 'Pending Review';
      }

      /*
       * Request number
       */
      appendCell(
        row,
        request.request_number
          ? formatRequestNumber(
              request.request_number
            )
          : request.id,
        'mono',
        'color:var(--c-400);font-size:12px;'
      );

      /*
       * Resource
       */
      appendCell(
        row,
        resource.name ||
          'Access resource',
        '',
        'color:var(--c-200);font-weight:600;'
      );

      /*
       * Resource category
       */
      appendCell(
        row,
        resource.category ||
          'Access',
        '',
        'color:var(--c-400);font-size:12px;'
      );

      /*
       * Security classification
       *
       * The resources table does not have a
       * sensitivity/security_level column.
       * Classification is therefore derived
       * from minimum_clearance.
       */
      var securityCell =
        document.createElement('td');

      var securityBadge =
        document.createElement('span');

      securityBadge.className = 'pip';

      securityBadge.textContent =
        getSecurityClassification(resource);

      securityCell.appendChild(
        securityBadge
      );

      row.appendChild(
        securityCell
      );

      /*
       * Submitted date
       */
      appendCell(
        row,
        request.submitted_at
          ? new Date(
              request.submitted_at
            ).toLocaleDateString(
              'en-US',
              {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }
            )
          : '',
        '',
        'color:var(--c-500);font-size:12px;'
      );

      /*
       * Status
       */
      var statusCell =
        document.createElement('td');

      var statusBadge =
        document.createElement('span');

      statusBadge.className =
        'badge ' +
        (
          status === 'approved'
            ? 'b-green'
            : status === 'rejected'
              ? 'b-red'
              : 'b-amber'
        );

      statusBadge.textContent =
        label;

      statusCell.appendChild(
        statusBadge
      );

      row.appendChild(
        statusCell
      );

      /*
       * View button
       */
      row.appendChild(
        createViewLink(
          request,
          status
        )
      );

      tbody.appendChild(row);
    });

    /*
     * Update filter counts.
     */
    var tabs =
      document.querySelectorAll(
        '.ftab'
      );

    if (tabs[0]) {
      tabs[0].textContent =
        'All (' +
        requests.length +
        ')';
    }

    if (tabs[1]) {
      tabs[1].textContent =
        'Pending (' +
        (counts.pending || 0) +
        ')';
    }

    if (tabs[2]) {
      tabs[2].textContent =
        'Approved (' +
        (counts.approved || 0) +
        ')';
    }

    if (tabs[3]) {
      tabs[3].textContent =
        'Rejected (' +
        (counts.rejected || 0) +
        ')';
    }
  }

  /*
   * Load the student's requests from Supabase.
   */
  async function initializePage() {
    var tbody =
      document.getElementById(
        'req-tbody'
      );

    if (!tbody) {
      return;
    }

    try {
      /*
       * Wait for Supabase.
       */
      if (
        !window.secureAccessSupabaseReady
      ) {
        throw new Error(
          'Supabase client is not available.'
        );
      }

      var supabase =
        await window.secureAccessSupabaseReady;

      /*
       * Get the current authenticated user.
       */
      var sessionResult =
        await supabase.auth.getSession();

      if (sessionResult.error) {
        throw sessionResult.error;
      }

      var session =
        sessionResult.data.session;

      if (
        !session ||
        !session.user
      ) {
        throw new Error(
          'Your session has expired. Please log in again.'
        );
      }

      console.log(
        'CURRENT STUDENT AUTH USER:',
        session.user.id
      );

      /*
       * Load ONLY the current student's requests.
       *
       * IMPORTANT:
       * Do not request sensitivity or
       * security_level because those columns
       * do not exist in resources.
       */
      var result =
        await supabase
          .from('access_requests')
          .select(
            `
              id,
              request_number,
              requester_id,
              permission,
              duration,
              urgency,
              justification,
              additional_message,
              status,
              submitted_at,
              decided_at,
              decision_reason,
              resources (
                id,
                name,
                category,
                minimum_clearance,
                description
              )
            `
          )
          .eq(
            'requester_id',
            session.user.id
          )
          .order(
            'submitted_at',
            {
              ascending: false
            }
          );

      if (result.error) {
        console.error(
          'ACCESS REQUEST QUERY ERROR:',
          result.error
        );

        throw result.error;
      }

      var requests =
        result.data || [];

      console.log(
        'STUDENT ACCESS REQUESTS:',
        requests
      );

      if (!requests.length) {
        tbody.textContent = '';

        renderEmptyState(
          tbody,
          'No access requests found.'
        );

        return;
      }

      renderRemoteRequests(
        tbody,
        requests
      );

    } catch (error) {
      console.error(
        'Unable to load access requests from Supabase:',
        error
      );

      tbody.textContent = '';

      renderEmptyState(
        tbody,
        'Unable to load your access requests. Please refresh the page and try again.'
      );
    }
  }

  /*
   * Make the filter function available
   * to the existing HTML buttons.
   */
  window.filterReqs =
    filterReqs;

  /*
   * Initialize the page.
   */
  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      initializePage
    );
  } else {
    initializePage();
  }
})();