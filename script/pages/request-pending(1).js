document.addEventListener('DOMContentLoaded', async function () {

  /*
   * Wait for Supabase client
   */
  if (window.secureAccessSupabaseReady) {
    try {
      await window.secureAccessSupabaseReady;
    } catch (error) {
      console.error(
        'Supabase initialization failed:',
        error
      );
      return;
    }
  }

  var supabase =
    window.secureAccessSupabase;

  if (!supabase) {
    console.error('Supabase client is not available.');
    return;
  }


  /*
   * Get currently logged-in student
   */
  var sessionResult = await supabase.auth.getSession();

      if (sessionResult.error) {
        console.error(
          'Could not get Supabase session:',
          sessionResult.error
        );
        return;
      }

      var sessionData = sessionResult.data;
      var session = sessionData ? sessionData.session : null;

      if (!session || !session.user) {
        window.location.href = '../auth/login.php';
        return;
      }

      var studentId = session.user.id;

      /*
 * Get the request number from the URL first.
 * Fall back to sessionStorage only when no URL request exists.
 */
var params = new URLSearchParams(window.location.search);

var urlRequestNumber = params.get('request');

var savedRequestNumber = sessionStorage.getItem(
  'secureAccessLastRequestNumber'
);

var requestNumberValue =
  urlRequestNumber || savedRequestNumber;

if (!requestNumberValue) {

  console.warn(
    'No request number found.'
  );

  window.location.href = 'access-requests.php';
  return;
}

var requestNumber = Number(
  String(requestNumberValue)
    .replace(/^REQ-2026-/i, '')
    .trim()
);

if (!Number.isFinite(requestNumber)) {

  console.error(
    'Invalid request number:',
    requestNumberValue
  );

  window.location.href = 'access-requests.php';
  return;
}

console.log('REQUEST NUMBER SOURCE:', {
  url: urlRequestNumber,
  sessionStorage: savedRequestNumber,
  using: requestNumber
});


  /*
   * Get the student's request from Supabase
   */
  var requestResult = await supabase
  .from('access_requests')
  .select(`
    id,
    request_number,
    permission,
    duration,
    urgency,
    justification,
    additional_message,
    status,
    submitted_at,
    decided_at,
    decision_reason,
    resource_id,
    reviewer_id,
    resources (
      id,
      name,
      category,
      minimum_clearance,
      description
    )
  `)
  .eq('requester_id', studentId)
  .eq('request_number', requestNumber)
  .maybeSingle();


  if (requestResult.error) {

    console.error(
      'Could not load request:',
      requestResult.error
    );

    showRequestError(
      requestResult.error.message
    );

    return;
  }


  var request =
    requestResult.data;


  if (!request) {

    console.error(
      'Request was not found:',
      requestNumber
    );

    showRequestError(
      'The submitted request could not be found.'
    );

    return;
  }


  /*
   * Resource information
   */
  var resource =
    request.resources || {};


  /*
   * Format request number
   */
  var formattedRequestNumber =
    'REQ-2026-' +
    String(request.request_number)
      .padStart(3, '0');


  /*
   * Request ID
   */
  var requestId =
    document.getElementById(
      'pending-request-id'
    );

  if (requestId) {
    requestId.textContent =
      formattedRequestNumber;
  }


  /*
   * Resource
   */
  var resourceElement =
    document.getElementById(
      'pending-resource'
    );

  if (resourceElement) {
    resourceElement.textContent =
      resource.name || 'Not provided';
  }


  /*
   * Security Level
   */
  var security =
    document.getElementById(
      'pending-security'
    );

  if (security) {
    security.textContent =
      resource.security_level ||
      'Not specified';
  }


  /*
   * Request Metadata
   */
  var requestMeta =
    document.getElementById(
      'pending-request-meta'
    );

  if (requestMeta) {

    requestMeta.textContent =
      formattedRequestNumber +
      ' • Submitted ' +
      formatDateTime(
        request.submitted_at
      );
  }


  /*
   * Permission
   */
  var permission =
    document.getElementById(
      'pending-permission'
    );

  if (permission) {
    permission.textContent =
      request.permission || '';
  }


  /*
   * Duration
   */
  var duration =
    document.getElementById(
      'pending-duration'
    );

  if (duration) {
    duration.textContent =
      request.duration || '';
  }


  /*
   * Request Type
   */
  var type =
    document.getElementById(
      'pending-type'
    );

  if (type) {

    type.textContent =
      resource.category ||
      'Access Request';
  }


  /*
   * Urgency
   */
  var urgency =
    document.getElementById(
      'pending-urgency'
    );

  if (urgency) {

    urgency.textContent =
      formatUrgency(
        request.urgency
      );
  }


  /*
   * Access Justification
   */
  var justification =
    document.getElementById(
      'pending-justification'
    );

  if (justification) {

    justification.textContent =
      request.justification || '';
  }


  /*
   * Sidebar Submitted Date
   */
  var sidebarSubmitted =
    document.getElementById(
      'pending-sidebar-submitted'
    );

  if (sidebarSubmitted) {

    sidebarSubmitted.textContent =
      formatDateTime(
        request.submitted_at
      );
  }


  /*
   * Expected Decision
   */
  var expectedDecision =
    document.getElementById(
      'pending-expected-decision'
    );

  if (expectedDecision) {

    expectedDecision.textContent =
      calculateExpectedDecision(
        request.submitted_at
      );
  }


  /*
   * Request Status
   */
  var status =
    document.getElementById(
      'request-detail-status'
    );

  var sideStatus =
    document.getElementById(
      'request-sidebar-status'
    );

  var note =
    document.getElementById(
      'admin-decision-note'
    );


  /*
   * Convert database status into
   * the text used by the UI.
   */
  var displayStatus =
    formatStatus(
      request.status
    );


  /*
   * Status Badge
   */
  var badgeClass =
    request.status === 'approved'
      ? 'b-green'
      : request.status === 'rejected'
        ? 'b-red'
        : 'b-amber';


  /*
   * Main Status Stamp
   */
  if (status) {

    status.className =
      'stamp ' +
      (
        request.status === 'approved'
          ? 'stamp-approved'
          : request.status === 'rejected'
            ? 'stamp-denied'
            : 'stamp-pending'
      );

    status.textContent =
      displayStatus;
  }


  /*
   * Sidebar Status
   */
  if (sideStatus) {

    sideStatus.className =
      'badge ' + badgeClass;

    sideStatus.textContent =
      displayStatus;
  }


  /*
   * Administrator Decision Note
   */
  if (
    note &&
    request.decision_reason
  ) {

    note.style.display =
      'block';

    var noteText =
      note.querySelector('span');

    if (noteText) {

      noteText.textContent =
        request.decision_reason;
    }
  }


  /*
   * Student Information
   */
  var studentName =
    document.getElementById(
      'pending-student-name'
    );

  var studentIdElement =
    document.getElementById(
      'pending-student-id'
    );

  var avatar =
    document.getElementById(
      'pending-avatar'
    );

  var studentCourse =
    document.getElementById(
      'pending-student-course'
    );


  /*
   * Load student profile
   */
  var profileResult =
    await supabase
      .from('profiles')
      .select(`
        student_id,
        full_name,
        program
      `)
      .eq('id', studentId)
      .maybeSingle();


  if (profileResult.error) {

    console.warn(
      'Could not load student profile:',
      profileResult.error
    );
  }


  var profile =
    profileResult.data || {};


  var name =
    profile.full_name ||
    'Student';


  /*
   * Student Name
   */
  if (studentName) {

    studentName.textContent =
      name;
  }


  /*
   * Student ID
   */
  if (studentIdElement) {

    studentIdElement.textContent =
      profile.student_id || '';
  }


  /*
   * Student Initials
   */
  if (avatar) {

    var nameParts =
      name
        .trim()
        .split(/\s+/);

    var initials =
      '';

    if (
      nameParts.length > 0 &&
      nameParts[0]
    ) {

      initials +=
        nameParts[0]
          .charAt(0)
          .toUpperCase();
    }

    if (
      nameParts.length > 1 &&
      nameParts[nameParts.length - 1]
    ) {

      initials +=
        nameParts[
          nameParts.length - 1
        ]
          .charAt(0)
          .toUpperCase();
    }

    avatar.textContent =
      initials;
  }


  /*
   * Student Course / Program
   */
  if (studentCourse) {

    studentCourse.textContent =
      profile.program ||
      'Not provided';
  }

  /*
  * Update progress timeline based on
  * the actual request status.
  */
  updateRequestProgress(
    request.status
  );

  var statusMessage =
    document.getElementById(
      'request-status-message'
    );

  var expectedDecisionText =
    document.getElementById(
      'pending-expected-decision-text'
    );

  if (statusMessage) {

    if (request.status === 'approved') {

      statusMessage.innerHTML =
        'Your request has been approved. ' +
        'Access has been granted for the requested resource.';

    } else if (request.status === 'rejected') {

      statusMessage.innerHTML =
        'Your request was not approved by the system administrator.';

    } else {

      statusMessage.innerHTML =
        'Your request is currently being reviewed by the system administrator. ' +
        'Expected decision: ' +
        '<span id="pending-expected-decision-text">' +
          '2–3 business days.' +
        '</span>';
    }
  }

  /*
   * Debug information
   */
  console.log(
    'REQUEST PENDING LOADED:',
    {
      requestNumber:
        formattedRequestNumber,
      requestId:
        request.id,
      resource:
        resource.name,
      status:
        request.status
    }
  );

});


/*
 * Format date/time
 */
function formatDateTime(value) {

  if (!value) {
    return '';
  }

  var date =
    new Date(value);

  if (isNaN(date.getTime())) {
    return value;
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


/*
 * Calculate expected decision
 */
function calculateExpectedDecision(
  submittedAt
) {

  if (!submittedAt) {
    return '2–3 business days';
  }

  var firstDate =
    new Date(submittedAt);

  var secondDate =
    new Date(submittedAt);

  if (
    isNaN(firstDate.getTime()) ||
    isNaN(secondDate.getTime())
  ) {

    return '2–3 business days';
  }


  var daysAdded = 0;

  while (daysAdded < 2) {

    firstDate.setDate(
      firstDate.getDate() + 1
    );

    var day =
      firstDate.getDay();

    if (
      day !== 0 &&
      day !== 6
    ) {

      daysAdded++;
    }
  }


  daysAdded = 0;

  while (daysAdded < 3) {

    secondDate.setDate(
      secondDate.getDate() + 1
    );

    var day =
      secondDate.getDay();

    if (
      day !== 0 &&
      day !== 6
    ) {

      daysAdded++;
    }
  }


  var firstFormatted =
    firstDate.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }
    );


  var secondFormatted =
    secondDate.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }
    );


  return (
    firstFormatted +
    '–' +
    secondFormatted
  );
}


/*
 * Format urgency
 */
function formatUrgency(value) {

  if (!value) {
    return '';
  }

  var text =
    String(value);

  return text.charAt(0).toUpperCase() +
    text.slice(1);
}


/*
 * Format database status
 */
function formatStatus(value) {

  if (!value) {
    return 'Pending Review';
  }

  var status =
    String(value)
      .toLowerCase();

  if (status === 'pending') {
    return 'Pending Review';
  }

  if (status === 'approved') {
    return 'Approved';
  }

  if (status === 'rejected') {
    return 'Rejected';
  }

  return value;
}


/*
 * Display an error without
 * using browser alert().
 */
function showRequestError(message) {

  console.error(
    'REQUEST STATUS ERROR:',
    message
  );


  var status =
    document.getElementById(
      'request-detail-status'
    );

  if (status) {

    status.className =
      'stamp stamp-denied';

    status.textContent =
      'Unable to load request';
  }


  var requestId =
    document.getElementById(
      'pending-request-id'
    );

  if (requestId) {

    requestId.textContent =
      'Request unavailable';
  }
}

/*
 * Update the request progress timeline
 * based on the actual database status.
 */
function updateRequestProgress(status) {

  var normalizedStatus =
    String(status || 'pending').toLowerCase();

  var submittedCircle =
    document.getElementById(
      'progress-submitted-circle'
    );

  var reviewCircle =
    document.getElementById(
      'progress-review-circle'
    );

  var decisionCircle =
    document.getElementById(
      'progress-decision-circle'
    );

  var accessCircle =
    document.getElementById(
      'progress-access-circle'
    );

  var submittedLabel =
    document.getElementById(
      'progress-submitted-label'
    );

  var reviewLabel =
    document.getElementById(
      'progress-review-label'
    );

  var decisionLabel =
    document.getElementById(
      'progress-decision-label'
    );

  var accessLabel =
    document.getElementById(
      'progress-access-label'
    );

  var line1 =
    document.getElementById(
      'progress-line-1'
    );

  var line2 =
    document.getElementById(
      'progress-line-2'
    );

  var line3 =
    document.getElementById(
      'progress-line-3'
    );


  /*
   * Reset everything first.
   */
  var circles = [
    submittedCircle,
    reviewCircle,
    decisionCircle,
    accessCircle
  ];

  circles.forEach(function (circle) {

    if (!circle) {
      return;
    }

    circle.style.background =
      'var(--c-800)';

    circle.style.border =
      '2px solid var(--c-700)';

    circle.style.boxShadow =
      'none';

    circle.innerHTML = '';
  });


  var labels = [
    submittedLabel,
    reviewLabel,
    decisionLabel,
    accessLabel
  ];

  labels.forEach(function (label) {

    if (!label) {
      return;
    }

    label.style.color =
      'var(--c-600)';
  });


  if (line1) {
    line1.style.background =
      'var(--c-800)';
  }

  if (line2) {
    line2.style.background =
      'var(--c-800)';
  }

  if (line3) {
    line3.style.background =
      'var(--c-800)';
  }


  /*
   * Submitted is always completed.
   */
  if (submittedCircle) {

    submittedCircle.style.background =
      'var(--c-indigo)';

    submittedCircle.style.border =
      'none';

    submittedCircle.innerHTML =
      '<svg width="12" height="12" fill="none" stroke="#fff" viewBox="0 0 24 24">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>' +
      '</svg>';
  }

  if (submittedLabel) {
    submittedLabel.style.color =
      'var(--c-500)';
  }


  /*
   * PENDING
   *
   * Submitted → In Review → Decision → Access
   *              CURRENT
   */
  if (normalizedStatus === 'pending') {

    if (line1) {
      line1.style.background =
        'var(--c-indigo)';
    }

    if (reviewCircle) {

      reviewCircle.style.background =
        'var(--c-indigo)';

      reviewCircle.style.border =
        'none';

      reviewCircle.style.boxShadow =
        '0 0 0 3px rgba(99,102,241,.2)';

      reviewCircle.innerHTML =
        '<svg class="spin" width="12" height="12" fill="none" stroke="#fff" viewBox="0 0 24 24">' +
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>' +
        '</svg>';
    }

    if (reviewLabel) {
      reviewLabel.style.color =
        'var(--c-indigo-l)';
    }

    return;
  }


  /*
   * APPROVED
   *
   * Submitted → In Review → Decision → Access
   *                                      CURRENT
   */
  if (normalizedStatus === 'approved') {

    if (line1) {
      line1.style.background =
        'var(--c-indigo)';
    }

    if (line2) {
      line2.style.background =
        'var(--c-indigo)';
    }

    if (line3) {
      line3.style.background =
        'var(--c-indigo)';
    }


    /*
     * In Review completed.
     */
    if (reviewCircle) {

      reviewCircle.style.background =
        'var(--c-indigo)';

      reviewCircle.style.border =
        'none';

      reviewCircle.innerHTML =
        '<svg width="12" height="12" fill="none" stroke="#fff" viewBox="0 0 24 24">' +
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>' +
        '</svg>';
    }

    if (reviewLabel) {
      reviewLabel.style.color =
        'var(--c-500)';
    }


    /*
     * Decision completed.
     */
    if (decisionCircle) {

      decisionCircle.style.background =
        'var(--c-indigo)';

      decisionCircle.style.border =
        'none';

      decisionCircle.innerHTML =
        '<svg width="12" height="12" fill="none" stroke="#fff" viewBox="0 0 24 24">' +
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>' +
        '</svg>';
    }

    if (decisionLabel) {
      decisionLabel.style.color =
        'var(--c-500)';
    }


    /*
     * Access is the current step.
     */
    if (accessCircle) {

      accessCircle.style.background =
        'var(--c-green)';

      accessCircle.style.border =
        'none';

      accessCircle.style.boxShadow =
        '0 0 0 3px rgba(52,211,153,.2)';

      accessCircle.innerHTML =
        '<svg width="12" height="12" fill="none" stroke="#fff" viewBox="0 0 24 24">' +
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>' +
        '</svg>';
    }

    if (accessLabel) {
      accessLabel.style.color =
        'var(--c-green)';
    }

    return;
  }


  /*
   * REJECTED
   *
   * Submitted → In Review → Decision
   *                         CURRENT
   */
  if (normalizedStatus === 'rejected') {

    if (line1) {
      line1.style.background =
        'var(--c-indigo)';
    }

    if (line2) {
      line2.style.background =
        'var(--c-indigo)';
    }


    /*
     * In Review completed.
     */
    if (reviewCircle) {

      reviewCircle.style.background =
        'var(--c-indigo)';

      reviewCircle.style.border =
        'none';

      reviewCircle.innerHTML =
        '<svg width="12" height="12" fill="none" stroke="#fff" viewBox="0 0 24 24">' +
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>' +
        '</svg>';
    }

    if (reviewLabel) {
      reviewLabel.style.color =
        'var(--c-500)';
    }


    /*
     * Decision is the current step.
     */
    if (decisionCircle) {

      decisionCircle.style.background =
        'var(--c-red)';

      decisionCircle.style.border =
        'none';

      decisionCircle.style.boxShadow =
        '0 0 0 3px rgba(248,113,113,.2)';

      decisionCircle.innerHTML =
        '<svg width="12" height="12" fill="none" stroke="#fff" viewBox="0 0 24 24">' +
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 6l12 12M18 6L6 18"/>' +
        '</svg>';
    }

    if (decisionLabel) {
      decisionLabel.style.color =
        'var(--c-red)';
    }
  }
}