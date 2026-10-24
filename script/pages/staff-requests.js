(function () {
  'use strict';

  var assignedRequests = [];
  var tableBody;

  function formatRequestNumber(number) {
    var value = Number(number);
    if (!Number.isFinite(value)) return String(number || '');
    return 'REQ-' + new Date().getFullYear() + '-' + String(value).padStart(3, '0');
  }

  function appendCell(row, value, className) {
    var cell = document.createElement('td');
    cell.textContent = value == null ? '' : String(value);
    if (className) cell.className = className;
    row.appendChild(cell);
    return cell;
  }

  function setStatus(message, isError) {
    var status = document.getElementById('staff-requests-status');
    status.textContent = message;
    status.style.color = isError ? 'var(--c-red)' : 'var(--c-400)';
    status.classList.toggle('is-error', !!isError);
  }

  function normalized(value) {
    return String(value || '').trim().toLowerCase();
  }

  function renderRequests() {
    var query = normalized(document.getElementById('request-search').value);
    var statusFilter = document.getElementById('request-status-filter').value;
    var priorityFilter = document.getElementById('request-priority-filter').value;
    var sortOrder = document.getElementById('request-sort').value;

    var filtered = assignedRequests.filter(function (request) {
      var student = request.requester || {};
      var resource = request.resources || {};
      var requestNumber = formatRequestNumber(request.request_number);
      var status = normalized(request.status);
      var priority = request.urgency === 'urgent' ? 'urgent' : 'normal';
      var searchable = [
        requestNumber,
        student.full_name,
        student.student_id,
        resource.name,
        request.permission,
        request.duration,
        request.justification
      ].map(normalized).join(' ');

      return (!query || searchable.includes(query)) &&
        (statusFilter === 'all' || status === statusFilter) &&
        (priorityFilter === 'all' || priority === priorityFilter);
    });

    filtered.sort(function (left, right) {
      if (sortOrder === 'urgent' && left.urgency !== right.urgency) {
        return left.urgency === 'urgent' ? -1 : 1;
      }
      var leftDate = new Date(left.submitted_at || 0).getTime();
      var rightDate = new Date(right.submitted_at || 0).getTime();
      return sortOrder === 'oldest' ? leftDate - rightDate : rightDate - leftDate;
    });

    tableBody.textContent = '';

    if (filtered.length === 0) {
      var emptyRow = document.createElement('tr');
      var emptyCell = appendCell(emptyRow, 'No requests match these filters.', 'personnel-empty-state');
      emptyCell.colSpan = 7;
      tableBody.appendChild(emptyRow);
    } else {
      filtered.forEach(function (request) {
        var row = document.createElement('tr');
        var student = request.requester || {};
        var resource = request.resources || {};
        var status = normalized(request.status);

        appendCell(row, formatRequestNumber(request.request_number), 'mono personnel-request-number');
        appendCell(row, [student.full_name, student.student_id].filter(Boolean).join(' · '));
        appendCell(row, [resource.name, request.permission, request.duration].filter(Boolean).join(' — '));
        appendCell(row, request.justification, 'personnel-justification');

        var priorityCell = appendCell(row, '', '');
        var priorityBadge = document.createElement('span');
        priorityBadge.className = 'badge ' + (request.urgency === 'urgent' ? 'b-orange' : 'b-slate');
        priorityBadge.textContent = request.urgency === 'urgent' ? 'Urgent' : 'Normal';
        priorityCell.appendChild(priorityBadge);

        var submitted = request.submitted_at
          ? new Date(request.submitted_at).toLocaleString()
          : '—';
        appendCell(row, submitted, 'personnel-submitted-date');

        var statusCell = appendCell(row, '', '');
        var statusBadge = document.createElement('span');
        statusBadge.className = 'badge ' + (
          status === 'approved' ? 'b-green' :
          status === 'rejected' ? 'b-red' :
          status === 'cancelled' ? 'b-slate' : 'b-amber'
        );
        statusBadge.textContent = request.status || 'Pending';
        statusCell.appendChild(statusBadge);
        tableBody.appendChild(row);
      });
    }

    var pendingCount = assignedRequests.filter(function (request) {
      return normalized(request.status) === 'pending';
    }).length;
    var urgentCount = assignedRequests.filter(function (request) {
      return request.urgency === 'urgent' && normalized(request.status) === 'pending';
    }).length;

    setStatus(
      filtered.length + ' of ' + assignedRequests.length +
      ' assigned request(s) · ' + pendingCount + ' pending · ' +
      urgentCount + ' urgent pending',
      false
    );
  }

  async function loadAssignedRequests() {
    tableBody = document.getElementById('staff-requests-body');

    try {
      var supabase = await window.secureAccessSupabaseReady;
      var sessionResult = await supabase.auth.getSession();
      if (sessionResult.error) throw sessionResult.error;

      var session = sessionResult.data.session;
      if (!session || !session.user) {
        throw new Error('Your session has expired. Please sign in again.');
      }

      var profileResult = await supabase
        .from('profiles')
        .select('role, account_active')
        .eq('id', session.user.id)
        .single();
      if (profileResult.error) throw profileResult.error;
      if (profileResult.data.role !== 'teacher' || !profileResult.data.account_active) {
        throw new Error('An active teacher account is required to view assigned requests.');
      }

      var result = await supabase
        .from('access_requests')
        .select(`
          id,
          request_number,
          permission,
          duration,
          urgency,
          justification,
          status,
          submitted_at,
          resources (name),
          requester:profiles!access_requests_requester_id_fkey (full_name, student_id)
        `)
        .eq('recipient_id', session.user.id)
        .order('submitted_at', { ascending: false });
      if (result.error) throw result.error;

      assignedRequests = result.data || [];
      renderRequests();
    } catch (error) {
      console.error('Unable to load assigned access requests:', error);
      tableBody.textContent = '';
      var errorRow = document.createElement('tr');
      var errorCell = appendCell(errorRow, 'Requests could not be loaded. ' + (error.message || 'Please try again.'), 'personnel-empty-state');
      errorCell.colSpan = 7;
      tableBody.appendChild(errorRow);
      setStatus(error.message || 'Unable to load assigned requests.', true);
    }
  }

  document.getElementById('request-search').addEventListener('input', renderRequests);
  document.getElementById('request-status-filter').addEventListener('change', renderRequests);
  document.getElementById('request-priority-filter').addEventListener('change', renderRequests);
  document.getElementById('request-sort').addEventListener('change', renderRequests);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAssignedRequests);
  } else {
    loadAssignedRequests();
  }
})();
