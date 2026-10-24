var currentFilter = 'all';
var currentYear = '';
var historyRequests = [];


/*
 * =========================================================
 * LOAD REQUEST HISTORY FROM SUPABASE
 * =========================================================
 */

async function loadHistoryRequests() {

  historyRequests = [];

  try {

    if (!window.secureAccessSupabaseReady) {

      throw new Error(
        'Supabase client loader was not found.'
      );

    }

    var supabase =
      await window.secureAccessSupabaseReady;

    if (
      !supabase ||
      !supabase.auth
    ) {

      throw new Error(
        'Supabase client is not available.'
      );

    }


    /*
     * Get current logged-in student.
     */

    var sessionResult =
      await supabase.auth.getSession();

    if (
      sessionResult.error ||
      !sessionResult.data ||
      !sessionResult.data.session
    ) {

      console.error(
        'No active Supabase session:',
        sessionResult.error
      );

      window.location.href =
        '../auth/login.php';

      return;

    }


    var session =
      sessionResult.data.session;


    console.log(
      'HISTORY CURRENT USER:',
      session.user.id
    );


    /*
     * Load the student's actual requests.
     */

    var requestResult =
      await supabase
        .from('access_requests')
        .select(`
          id,
          request_number,
          requester_id,
          permission,
          duration,
          urgency,
          justification,
          additional_message,
          status,
          reviewer_id,
          decision_reason,
          submitted_at,
          decided_at,
          updated_at,
          resources (
            id,
            name,
            category,
            minimum_clearance,
            description
          )
        `)
        .eq(
          'requester_id',
          session.user.id
        )
        .order(
          'request_number',
          {
            ascending: false
          }
        );


    if (requestResult.error) {

      console.error(
        'Unable to load request history:',
        requestResult.error
      );

      return;

    }


    var requests =
      requestResult.data || [];


    /*
     * Convert Supabase records into the format
     * used by the history table.
     */

    historyRequests =
      requests.map(function (request) {

        var requestNumber =
          Number(
            request.request_number
          );


        var requestId =
          'REQ-' +
          getRequestYear(
            request.submitted_at
          ) +
          '-' +
          String(
            requestNumber
          ).padStart(3, '0');


        return {

          databaseId:
            request.id,

          requestNumber:
            requestNumber,

          id:
            requestId,

          resource:
            request.resources
              ? request.resources.name
              : '',

          type:
            request.resources &&
            request.resources.category
              ? request.resources.category
              : '',

          permission:
            request.permission || '',

          duration:
            request.duration || '',

          urgency:
            request.urgency || '',

          justification:
            request.justification || '',

          additionalMessage:
            request.additional_message || '',

          status:
            request.status || '',

          reviewerId:
            request.reviewer_id || null,

          decisionReason:
            request.decision_reason || '',

          submittedAt:
            request.submitted_at || '',

          decidedAt:
            request.decided_at || '',

          updatedAt:
            request.updated_at || ''

        };

      });


    console.log(
      'HISTORY REQUESTS LOADED:',
      historyRequests
    );


  } catch (error) {

    console.error(
      'Unable to load request history:',
      error
    );

  }

}


/*
 * =========================================================
 * REQUEST YEAR
 * =========================================================
 */

function getRequestYear(value) {

  if (!value) {
    return new Date().getFullYear();
  }


  var date =
    new Date(value);


  if (
    !isNaN(
      date.getTime()
    )
  ) {

    return date.getFullYear();

  }


  var match =
    String(value).match(
      /\b(20\d{2})\b/
    );


  return match
    ? match[1]
    : new Date().getFullYear();

}


/*
 * =========================================================
 * STATUS HELPERS
 * =========================================================
 */

function getHistoryStatus(request) {

  var status =
    String(
      request.status || ''
    )
      .trim()
      .toLowerCase();


  if (status === 'approved') {
    return 'approved';
  }


  if (
    status === 'rejected' ||
    status === 'denied'
  ) {

    return 'rejected';

  }


  return 'pending';

}


function getStatusLabel(request) {

  var status =
    getHistoryStatus(request);


  if (status === 'approved') {
    return 'Approved';
  }


  if (status === 'rejected') {
    return 'Rejected';
  }


  return 'Pending';

}


function getStatusBadgeClass(request) {

  var status =
    getHistoryStatus(request);


  if (status === 'approved') {
    return 'b-green';
  }


  if (status === 'rejected') {
    return 'b-red';
  }


  return 'b-amber';

}


/*
 * =========================================================
 * DATE HELPERS
 * =========================================================
 */

function formatHistoryDate(value) {

  if (!value) {
    return '—';
  }


  var date =
    new Date(value);


  if (
    isNaN(
      date.getTime()
    )
  ) {

    return String(value);

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


function getYear(request) {

  if (!request.submittedAt) {
    return '';
  }


  var date =
    new Date(
      request.submittedAt
    );


  if (
    !isNaN(
      date.getTime()
    )
  ) {

    return String(
      date.getFullYear()
    );

  }


  return '';

}


/*
 * =========================================================
 * DETAIL LINK
 * =========================================================
 *
 * IMPORTANT:
 * The request number is included in the URL.
 *
 * Example:
 * request-approved.php?request=REQ-2026-019
 *
 * This prevents the detail page from opening
 * another request.
 *
 * =========================================================
 */

function getDetailPage(request) {

  var status =
    getHistoryStatus(request);


  var encodedRequest =
    encodeURIComponent(
      request.id
    );


  if (status === 'approved') {

    return (
      'request-approved.php?request=' +
      encodedRequest
    );

  }


  if (status === 'rejected') {

    return (
      'request-denied.php?request=' +
      encodedRequest
    );

  }


  return (
    'request-pending.php?request=' +
    encodedRequest
  );

}


/*
 * =========================================================
 * ESCAPE HTML
 * =========================================================
 */

function escapeHistoryHtml(value) {

  return String(
    value == null
      ? ''
      : value
  )
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );

}


/*
 * =========================================================
 * UPDATE STATISTICS
 * =========================================================
 */

function updateHistoryStats() {

  var total =
    historyRequests.length;


  var approved =
    historyRequests.filter(
      function (request) {

        return (
          getHistoryStatus(request) ===
          'approved'
        );

      }
    ).length;


  var pending =
    historyRequests.filter(
      function (request) {

        return (
          getHistoryStatus(request) ===
          'pending'
        );

      }
    ).length;


  var rejected =
    historyRequests.filter(
      function (request) {

        return (
          getHistoryStatus(request) ===
          'rejected'
        );

      }
    ).length;


  var totalElement =
    document.getElementById(
      'history-total'
    );

  var approvedElement =
    document.getElementById(
      'history-approved'
    );

  var pendingElement =
    document.getElementById(
      'history-pending'
    );

  var rejectedElement =
    document.getElementById(
      'history-rejected'
    );


  if (totalElement) {

    totalElement.textContent =
      total;

  }


  if (approvedElement) {

    approvedElement.textContent =
      approved;

  }


  if (pendingElement) {

    pendingElement.textContent =
      pending;

  }


  if (rejectedElement) {

    rejectedElement.textContent =
      rejected;

  }

}


/*
 * =========================================================
 * YEAR FILTER OPTIONS
 * =========================================================
 */

function buildYearFilter() {

  var select =
    document.getElementById(
      'history-year-filter'
    );


  if (!select) {
    return;
  }


  var years = [];


  historyRequests.forEach(
    function (request) {

      var year =
        getYear(request);


      if (
        year &&
        years.indexOf(year) === -1
      ) {

        years.push(year);

      }

    }
  );


  years.sort(
    function (a, b) {

      return (
        Number(b) -
        Number(a)
      );

    }
  );


  select.innerHTML =
    '<option value="">All Years</option>';


  years.forEach(
    function (year) {

      var option =
        document.createElement(
          'option'
        );


      option.value =
        year;


      option.textContent =
        year;


      select.appendChild(
        option
      );

    }
  );


  if (currentYear) {

    var matchingOption =
      Array.from(
        select.options
      ).find(
        function (option) {

          return (
            option.value ===
            currentYear
          );

        }
      );


    if (matchingOption) {

      select.value =
        currentYear;

    } else {

      currentYear = '';

      select.value = '';

    }

  }

}


/*
 * =========================================================
 * RENDER HISTORY
 * =========================================================
 */

function renderHistory() {

  var tbody =
    document.getElementById(
      'hist-tbody'
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML = '';


  if (!historyRequests.length) {

    tbody.innerHTML =
      '<tr>' +
        '<td colspan="8" style="text-align:center;color:var(--c-500);padding:40px;">' +
          'No access request history found.' +
        '</td>' +
      '</tr>';


    return;

  }


  historyRequests.forEach(
    function (request) {

      var status =
        getHistoryStatus(
          request
        );


      var statusLabel =
        getStatusLabel(
          request
        );


      var year =
        getYear(
          request
        );


      var submittedValue =
        request.submittedAt;


      var decidedValue =
        request.decidedAt;


      var row =
        document.createElement(
          'tr'
        );


      row.setAttribute(
        'data-status',
        status
      );


      row.setAttribute(
        'data-year',
        year
      );


      /*
       * IMPORTANT:
       * The View link is generated from THIS
       * request's exact request number.
       */

      var detailPage =
        getDetailPage(
          request
        );


      row.innerHTML =

        '<td class="mono" style="font-size:11px;color:var(--c-400);">' +
          escapeHistoryHtml(
            request.id
          ) +
        '</td>' +

        '<td style="color:var(--c-200);font-weight:600;">' +
          escapeHistoryHtml(
            request.resource
          ) +
        '</td>' +

        '<td style="font-size:12px;color:var(--c-400);">' +
          escapeHistoryHtml(
            request.type
          ) +
        '</td>' +

        '<td style="font-size:12px;color:var(--c-400);">' +
          escapeHistoryHtml(
            request.permission
          ) +
        '</td>' +

        '<td style="font-size:12px;color:var(--c-500);">' +
          escapeHistoryHtml(
            formatHistoryDate(
              submittedValue
            )
          ) +
        '</td>' +

        '<td style="font-size:12px;color:var(--c-500);">' +
          escapeHistoryHtml(
            formatHistoryDate(
              decidedValue
            )
          ) +
        '</td>' +

        '<td>' +
          '<span class="badge ' +
            getStatusBadgeClass(
              request
            ) +
          '">' +
            escapeHistoryHtml(
              statusLabel
            ) +
          '</span>' +
        '</td>' +

        '<td>' +
          '<a href="' +
            escapeHistoryHtml(
              detailPage
            ) +
            '" class="btn btn-ghost btn-sm">' +
            'View' +
          '</a>' +
        '</td>';


      tbody.appendChild(
        row
      );

    }
  );


  apply();

}


/*
 * =========================================================
 * FILTER
 * =========================================================
 */

function apply() {

  document
    .querySelectorAll(
      '#hist-tbody tr'
    )
    .forEach(
      function (row) {

        var status =
          row.getAttribute(
            'data-status'
          );


        var year =
          row.getAttribute(
            'data-year'
          );


        var show =
          (
            currentFilter === 'all' ||
            status === currentFilter
          ) &&
          (
            !currentYear ||
            year === currentYear
          );


        row.style.display =
          show
            ? ''
            : 'none';

      }
    );

}


/*
 * =========================================================
 * STATUS FILTER BUTTON
 * =========================================================
 */

function filterHist(
  filter,
  btn
) {

  currentFilter =
    filter;


  document
    .querySelectorAll(
      '.ftab'
    )
    .forEach(
      function (button) {

        button.classList.remove(
          'active'
        );

      }
    );


  if (btn) {

    btn.classList.add(
      'active'
    );

  }


  apply();

}


/*
 * =========================================================
 * YEAR FILTER
 * =========================================================
 */

function filterYear(
  select
) {

  currentYear =
    select.value;


  apply();

}


/*
 * =========================================================
 * INITIALIZE
 * =========================================================
 */

document.addEventListener(
  'DOMContentLoaded',
  async function () {

    await loadHistoryRequests();

    updateHistoryStats();

    buildYearFilter();

    renderHistory();

  }
);