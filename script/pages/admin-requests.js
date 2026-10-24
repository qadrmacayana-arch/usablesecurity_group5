(function () {
  var currentRequest = null;

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

  function getRequestNumberFromUrl() {
    var params = new URLSearchParams(
      window.location.search
    );

    var value = params.get('request');

    if (!value) {
      return null;
    }

    var number = Number(
      String(value)
        .replace(/^REQ-\d{4}-/i, '')
        .trim()
    );

    return Number.isFinite(number)
      ? number
      : null;
  }

  function formatDateTime(value) {
    if (!value) {
      return '';
    }

    var date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }
    );
  }

  function getStatusLabel(status) {
    var normalized =
      String(status || '').toLowerCase();

    if (normalized === 'pending') {
      return 'Pending Review';
    }

    if (normalized === 'approved') {
      return 'Approved';
    }

    if (normalized === 'rejected') {
      return 'Rejected';
    }

    if (normalized === 'cancelled') {
      return 'Cancelled';
    }

    return status || '';
  }

  function getStatusBadge(status) {
    var normalized =
      String(status || '').toLowerCase();

    var className = 'badge b-amber';

    if (normalized === 'approved') {
      className = 'badge b-green';
    } else if (normalized === 'rejected') {
      className = 'badge b-red';
    }

    return (
      '<span class="' +
      className +
      '">' +
      getStatusLabel(status) +
      '</span>'
    );
  }

  function showError(message) {
    var error =
      document.getElementById(
        'decision-error'
      );

    if (!error) {
      return;
    }

    error.textContent = message || '';
    error.style.display = message
      ? 'block'
      : 'none';
  }

  function showSaved(message) {
    var saved =
      document.getElementById(
        'decision-saved'
      );

    if (!saved) {
      return;
    }

    if (message) {
      saved.textContent = message;
    }

    saved.style.display = 'block';
  }

  function hideSaved() {
    var saved =
      document.getElementById(
        'decision-saved'
      );

    if (saved) {
      saved.style.display = 'none';
    }
  }

  function setText(id, value) {
    var element =
      document.getElementById(id);

    if (element) {
      element.textContent =
        value === null ||
        value === undefined
          ? ''
          : String(value);
    }
  }

  function renderRequest(request) {
    currentRequest = request;

    var resource =
      request.resources || {};

    var requester =
      request.requester || {};

    var requestNumber =
      formatRequestNumber(
        request.request_number
      );

    var status =
      String(
        request.status || 'pending'
      ).toLowerCase();

    /*
     * Header
     */
    var card =
      document.querySelector(
        '.page-content .card'
      );

    if (card) {
      var idText =
        card.querySelector('.mono');

      var resourceTitle =
        card.querySelector('h2');

      var studentText =
        resourceTitle
          ? resourceTitle.nextElementSibling
          : null;

      if (idText) {
        idText.textContent =
          requestNumber;
      }

      if (resourceTitle) {
        resourceTitle.textContent =
          resource.name ||
          'Access resource';
      }

      if (studentText) {
        studentText.textContent =
          'Submitted by ' +
          (requester.full_name ||
            'Unknown student') +
          ' · ' +
          (requester.student_id ||
            '');
      }
    }

    /*
     * Status
     */
    var statusBadge =
      document.getElementById(
        'admin-request-status'
      );

    if (statusBadge) {
      statusBadge.innerHTML =
        getStatusBadge(status);
    }

    setText(
      'admin-request-status-text',
      getStatusLabel(status)
    );

    /*
     * Request information
     */
    setText(
      'admin-request-type',
      resource.category || 'Access'
    );

    setText(
      'admin-request-permission',
      request.permission || ''
    );

    setText(
      'admin-request-security',
      resource.minimum_clearance !== null &&
      resource.minimum_clearance !== undefined
        ? 'Minimum clearance: ' +
            resource.minimum_clearance
        : 'Standard'
    );

    setText(
      'admin-request-duration',
      request.duration || ''
    );

    setText(
      'admin-request-urgency',
      request.urgency === 'urgent'
        ? 'Urgent'
        : 'Normal'
    );

    setText(
      'admin-request-course',
      requester.program ||
        'Not provided'
    );

    setText(
      'admin-request-message',
      request.additional_message ||
        'No additional message.'
    );

    setText(
      'admin-request-submitted',
      formatDateTime(
        request.submitted_at
      )
    );

    /*
     * Justification
     */
    var justification =
      card
        ? card.querySelector(
            'div[style*="rgba(99,102,241,.06)"] p:last-child'
          )
        : null;

    if (justification) {
      justification.textContent =
        request.justification ||
        'No justification provided.';
    }

    /*
     * Decision reason
     */
    var decisionReason =
      document.getElementById(
        'decision-reason'
      );

    if (decisionReason) {
      decisionReason.value =
        request.decision_reason || '';
    }

    /*
     * Show decision buttons only
     * while request is pending.
     */
    var actions =
      document.getElementById(
        'request-actions'
      );

    if (actions) {
      actions.style.display =
        status === 'pending'
          ? 'flex'
          : 'none';
    }

    /*
     * Clear old messages when loading
     * a different request.
     */
    hideSaved();
    showError('');
  }

  async function loadAdminProfile(
    supabase,
    userId
  ) {
    var result =
      await supabase
        .from('profiles')
        .select(
          `
          id,
          full_name,
          role,
          account_active
        `
        )
        .eq('id', userId)
        .maybeSingle();

    if (result.error) {
      throw result.error;
    }

    if (!result.data) {
      throw new Error(
        'Administrator profile was not found.'
      );
    }

    var adminRole =
      String(result.data.role || '').toLowerCase();

    console.log(
      'ADMIN PROFILE:',
      result.data
    );

    console.log(
      'ADMIN ROLE:',
      result.data.role
    );

    if (
      adminRole !== 'admin' &&
      adminRole !== 'administrator'
    ) {
      throw new Error(
        'Administrator access is required.'
      );
    }

    if (
      result.data.account_active ===
      false
    ) {
      throw new Error(
        'This administrator account is inactive.'
      );
    }

    return result.data;
  }

  async function loadRequest(
    supabase,
    requestNumber
  ) {
    var result =
      await supabase
        .from('access_requests')
        .select(
          `
          id,
          request_number,
          requester_id,
          resource_id,
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
          ),
          requester:profiles!access_requests_requester_id_fkey (
            id,
            student_id,
            full_name,
            email,
            program,
            year_level,
            clearance_level,
            role,
            account_active
          )
        `
        )
        .eq(
          'request_number',
          requestNumber
        )
        .maybeSingle();

    if (result.error) {
      throw result.error;
    }

    if (!result.data) {
      throw new Error(
        'Request ' +
          formatRequestNumber(
            requestNumber
          ) +
          ' was not found.'
      );
    }

    return result.data;
  }

  async function findRequestToLoad(
    supabase,
    requestNumber
  ) {
    /*
     * If the URL specifies a request,
     * always use that exact request.
     */
    if (requestNumber !== null) {
      return loadRequest(
        supabase,
        requestNumber
      );
    }

    /*
     * If no request number was supplied,
     * automatically open the newest pending
     * request.
     */
    var result =
      await supabase
        .from('access_requests')
        .select(
          `
          request_number,
          status,
          submitted_at
          `
        )
        .eq(
          'status',
          'pending'
        )
        .order(
          'submitted_at',
          {
            ascending: false
          }
        )
        .limit(1)
        .maybeSingle();

    if (result.error) {
      throw result.error;
    }

    if (!result.data) {
      throw new Error(
        'There are currently no pending access requests.'
      );
    }

    return loadRequest(
      supabase,
      result.data.request_number
    );
  }

  async function updateRequestDecision(
    supabase,
    request,
    status,
    reason
  ) {
    var normalizedStatus =
      status === 'Approved'
        ? 'approved'
        : 'rejected';

    var result = await supabase.rpc(
      'decide_access_request',
      {
        p_request_id: request.id,
        p_decision: normalizedStatus,
        p_decision_reason: reason
      }
    );

    if (result.error) {
      throw result.error;
    }

    if (!result.data) {
      throw new Error('The database did not return the updated request.');
    }

    return result.data;
  }

  

  async function decideRequest(
    status
  ) {
    hideSaved();
    showError('');

    if (!currentRequest) {
      showError(
        'No access request is currently loaded.'
      );
      return;
    }

    var reasonElement =
      document.getElementById(
        'decision-reason'
      );

    var reason =
      reasonElement
        ? reasonElement.value.trim()
        : '';

    if (!reason) {
      showError(
        'Add a short reason before sending the decision.'
      );
      return;
    }

    if (reason.length > 2000) {
      showError(
        'The decision reason cannot exceed 2000 characters.'
      );
      return;
    }

    if (
      String(
        currentRequest.status
      ).toLowerCase() !==
      'pending'
    ) {
      showError(
        'This request has already been decided.'
      );
      return;
    }

    /*
     * Additional security checks
     * required before approval.
     */
    if (status === 'Approved') {
      var requester =
        currentRequest.requester ||
        {};

      var resource =
        currentRequest.resources ||
        {};

      if (
        requester.account_active ===
        false
      ) {
        showError(
          'Approval cannot proceed because the student account is inactive.'
        );
        return;
      }

      var studentClearance =
        Number(
          requester.clearance_level ||
            0
        );

      var minimumClearance =
        Number(
          resource.minimum_clearance ||
            0
        );

      if (
        studentClearance <
        minimumClearance
      ) {
        showError(
          'Approval cannot proceed because the student clearance level does not meet the minimum clearance required for this resource.'
        );
        return;
      }
    }

    try {
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
       * Update the exact request currently loaded.
       */
      var updatedRequest =
        await updateRequestDecision(
          supabase,
          currentRequest,
          status,
          reason
        );

      /*
       * Reload the same request so the page
       * reflects the database state.
       */
      currentRequest =
        await loadRequest(
          supabase,
          updatedRequest.request_number
        );

      renderRequest(
        currentRequest
      );

      showSaved(
        'Decision saved successfully for ' +
          formatRequestNumber(
            updatedRequest.request_number
          ) +
          '.'
      );

    } catch (error) {
      console.error(
        'Unable to save administrator decision:',
        error
      );

      showError(
        error.message ||
          'Unable to save the decision. Please try again.'
      );
    }
  }

  async function initializePage() {
    try {
      if (
        !window.secureAccessSupabaseReady
      ) {
        throw new Error(
          'Supabase client is not available.'
        );
      }

      var supabase =
        await window.secureAccessSupabaseReady;

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
          'Your administrator session has expired. Please log in again.'
        );
      }

      await loadAdminProfile(
        supabase,
        session.user.id
      );

      var requestNumber =
        getRequestNumberFromUrl();

      currentRequest =
        await findRequestToLoad(
          supabase,
          requestNumber
        );

      renderRequest(
        currentRequest
      );

    } catch (error) {
      console.error(
        'Unable to load administrator request:',
        error
      );

      showError(
        error.message ||
          'Unable to load the access request.'
      );
    }
  }

  /*
   * Make the decision function available
   * to the existing HTML buttons.
   */
  window.decideRequest =
    decideRequest;

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