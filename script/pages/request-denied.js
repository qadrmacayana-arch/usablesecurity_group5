document.addEventListener('DOMContentLoaded', async function () {

  try {

    /*
     * Wait for Supabase client to initialize
     */
    if (!window.secureAccessSupabaseReady) {
      throw new Error(
        'Supabase client loader was not found. Make sure supabase-client.js is loaded before request-denied.js.'
      );
    }

    var supabase =
      await window.secureAccessSupabaseReady;

    /*
     * Fallback to the global client if needed
     */
    if (
      !supabase &&
      window.secureAccessSupabase
    ) {
      supabase =
        window.secureAccessSupabase;
    }

    /*
     * Make sure the client actually exists
     */
    if (
      !supabase ||
      !supabase.auth
    ) {
      throw new Error(
        'Supabase client is not available.'
      );
    }

    /*
     * Get current student session
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
      'CURRENT STUDENT AUTH USER:',
      session.user.id
    );

    /*
     * Get request number from URL
     *
     * Example:
     * request-denied.php?request=REQ-2026-020
     */
    var params =
      new URLSearchParams(
        window.location.search
      );

    var requestParam =
      params.get('request');

    console.log(
      'DENIED REQUEST PARAMETER:',
      requestParam
    );

    if (!requestParam) {
      window.location.href =
        'access-requests.php';

      return;
    }

    /*
     * Convert:
     * REQ-2026-020
     *
     * into:
     * 20
     */
    var numericRequestNumber =
      null;

    var match =
      requestParam.match(
        /REQ-\d{4}-(\d+)/i
      );

    if (match) {

      numericRequestNumber =
        parseInt(
          match[1],
          10
        );

    } else if (
      /^\d+$/.test(requestParam)
    ) {

      numericRequestNumber =
        parseInt(
          requestParam,
          10
        );
    }

    if (
      numericRequestNumber === null ||
      Number.isNaN(
        numericRequestNumber
      )
    ) {

      console.error(
        'Invalid request number:',
        requestParam
      );

      window.location.href =
        'access-requests.php';

      return;
    }

    console.log(
      'LOOKING FOR REJECTED REQUEST:',
      numericRequestNumber
    );

    /*
     * Load the EXACT rejected request
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
        .eq(
          'request_number',
          numericRequestNumber
        )
        .eq(
          'status',
          'rejected'
        )
        .maybeSingle();

    if (
      requestResult.error ||
      !requestResult.data
    ) {

      console.error(
        'Unable to load rejected request:',
        requestResult.error
      );

      window.location.href =
        'access-requests.php';

      return;
    }

    var request =
      requestResult.data;

    console.log(
      'REJECTED REQUEST LOADED:',
      request
    );

    /*
     * Request number
     */
    var requestId =
      document.getElementById(
        'denied-request-id'
      );

    if (requestId) {

      requestId.textContent =
        'REQ-2026-' +
        String(
          request.request_number
        ).padStart(3, '0');
    }

    /*
     * Resource
     */
    var resource =
      document.getElementById(
        'denied-resource'
      );

    if (resource) {

      resource.textContent =
        request.resources
          ? request.resources.name
          : '';
    }

    /*
     * Security/category
     */
    var security =
      document.getElementById(
        'denied-security'
      );

    if (security) {

      security.textContent =
        request.resources &&
        request.resources.category
          ? request.resources.category
          : 'Standard';
    }

    /*
     * Request metadata
     */
    var requestMeta =
      document.getElementById(
        'denied-request-meta'
      );

    if (requestMeta) {

      requestMeta.textContent =
        'REQ-2026-' +
        String(
          request.request_number
        ).padStart(3, '0') +
        ' • Submitted ' +
        formatDate(
          request.submitted_at
        );
    }

    /*
     * Permission
     */
    var permission =
      document.getElementById(
        'denied-permission'
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
        'denied-duration'
      );

    if (duration) {

      duration.textContent =
        request.duration || '';
    }

    /*
     * Reviewed by
     */
    var reviewedBy =
      document.getElementById(
        'denied-reviewed-by'
      );

    if (reviewedBy) {

      reviewedBy.textContent =
        await getReviewerName(
          supabase,
          request.reviewer_id
        );
    }

    /*
     * Decision date
     */
    var decisionDate =
      document.getElementById(
        'denied-decision-date'
      );

    if (decisionDate) {

      decisionDate.textContent =
        formatDate(
          request.decided_at ||
          request.updated_at
        );
    }

    /*
     * Denied on
     */
    var deniedOn =
      document.getElementById(
        'denied-on'
      );

    if (deniedOn) {

      deniedOn.textContent =
        formatDate(
          request.decided_at ||
          request.updated_at
        );
    }

    /*
     * Student profile
     */
    var profileResult =
      await supabase
        .from('profiles')
        .select(`
          full_name,
          student_id,
          email
        `)
        .eq(
          'id',
          session.user.id
        )
        .maybeSingle();

    if (profileResult.error) {

      console.error(
        'Unable to load student profile:',
        profileResult.error
      );
    }

    var profile =
      profileResult.data || {};

    var studentNameValue =
      profile.full_name || '';

    var studentIdValue =
      profile.student_id || '';

    /*
     * Student avatar
     */
    var avatar =
      document.getElementById(
        'denied-avatar'
      );

    if (avatar) {

      var name =
        studentNameValue;

      var nameParts =
        name.trim()
          ? name.trim().split(/\s+/)
          : [];

      var initials = '';

      if (
        nameParts.length > 0
      ) {

        initials +=
          nameParts[0]
            .charAt(0)
            .toUpperCase();
      }

      if (
        nameParts.length > 1
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
     * Student name
     */
    var studentName =
      document.getElementById(
        'denied-student-name'
      );

    if (studentName) {

      studentName.textContent =
        studentNameValue;
    }

    /*
     * Student ID
     */
    var studentId =
      document.getElementById(
        'denied-student-id'
      );

    if (studentId) {

      studentId.textContent =
        studentIdValue;
    }

    /*
     * Rejection reason
     */
    var deniedReason =
      document.getElementById(
        'denied-reason'
      );

    if (deniedReason) {

      deniedReason.textContent =
        request.decision_reason ||
        'No reason was provided.';
    }

    /*
     * Original justification
     */
    var deniedJustification =
      document.getElementById(
        'denied-justification'
      );

    if (deniedJustification) {

      deniedJustification.textContent =
        request.justification || '';
    }

  } catch (error) {

    console.error(
      'Unable to load denied request:',
      error
    );

  }

});


/*
 * Format Supabase timestamp
 */
function formatDate(value) {

  if (!value) {
    return '';
  }

  var date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
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
 * Get administrator/reviewer name
 */
async function getReviewerName(
  supabase,
  reviewerId
) {

  if (!reviewerId) {
    return 'System Administrator';
  }

  var result =
    await supabase
      .from('profiles')
      .select(
        'full_name, email'
      )
      .eq(
        'id',
        reviewerId
      )
      .maybeSingle();

  if (
    result.data &&
    result.data.full_name
  ) {

    return result.data.full_name;
  }

  return 'System Administrator';
}