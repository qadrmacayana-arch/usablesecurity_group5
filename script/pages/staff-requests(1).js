(function () {
  'use strict';

  function formatRequestNumber(number) {
    var value = Number(number);
    if (!Number.isFinite(value)) return String(number || '');
    return 'REQ-' + new Date().getFullYear() + '-' + String(value).padStart(3, '0');
  }

  function appendCell(row, value) {
    var cell = document.createElement('td');
    cell.textContent = value == null ? '' : String(value);
    row.appendChild(cell);
  }

  function setStatus(message, isError) {
    var status = document.getElementById('staff-requests-status');
    status.textContent = message;
    status.style.color = isError ? 'var(--c-red)' : 'var(--c-400)';
  }

  async function loadAssignedRequests() {
    var body = document.getElementById('staff-requests-body');

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

      body.textContent = '';
      var requests = result.data || [];
      if (requests.length === 0) {
        setStatus('There are no requests assigned to you.', false);
        return;
      }

      requests.forEach(function (request) {
        var row = document.createElement('tr');
        var student = request.requester || {};
        var resource = request.resources || {};
        appendCell(row, formatRequestNumber(request.request_number));
        appendCell(row, [student.full_name, student.student_id].filter(Boolean).join(' · '));
        appendCell(row, [resource.name, request.permission, request.duration].filter(Boolean).join(' — '));
        appendCell(row, request.justification);
        appendCell(row, request.urgency === 'urgent' ? 'Urgent' : 'Normal');
        appendCell(row, request.submitted_at ? new Date(request.submitted_at).toLocaleString() : '');
        appendCell(row, request.status);
        body.appendChild(row);
      });

      setStatus(requests.length + ' assigned request(s).', false);
    } catch (error) {
      console.error('Unable to load assigned access requests:', error);
      setStatus(error.message || 'Unable to load assigned requests.', true);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAssignedRequests);
  } else {
    loadAssignedRequests();
  }
})();
