(function () {

  /*
   * Format the database request number.
   *
   * Example:
   * 20 → REQ-2026-020
   */
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

  /*
   * Get the request identifier from the URL.
   *
   * Example:
   * request-approved.php?request=REQ-2026-020
   */
  function getRequestParameter() {
    var params =
      new URLSearchParams(
        window.location.search
      );

    return params.get('request');
  }

  /*
   * Convert REQ-2026-020 into the
   * numeric request_number stored in Supabase.
   */
  function getNumericRequestNumber(value) {
    if (!value) {
      return null;
    }

    var match =
      String(value).match(
        /^REQ-\d{4}-(\d+)$/
      );

    if (!match) {
      return null;
    }

    return Number(match[1]);
  }

  /*
   * Format dates consistently.
   */
  function formatDate(value) {
    if (!value) {
      return '';
    }

    var date = new Date(value);

    if (isNaN(date.getTime())) {
      return '';
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
   * Format date + time.
   */
  function formatDateTime(value) {
    if (!value) {
      return '';
    }

    var date = new Date(value);

    if (isNaN(date.getTime())) {
      return '';
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

  /*
   * Safely place text into an element.
   */
  function setText(id, value) {
    var element =
      document.getElementById(id);

    if (element) {
      element.textContent =
        value == null ? '' : String(value);
    }
  }

  /*
   * Show an error without using alert().
   */
  function showError(message) {
    console.error(message);

    var content =
      document.querySelector(
        '.page-content'
      );

    if (!content) {
      return;
    }

    content.innerHTML =
      '<div class="card" style="max-width:700px;margin:40px auto;text-align:center;padding:40px;">' +
        '<div style="width:56px;height:56px;border-radius:50%;background:rgba(248,113,113,.12);display:flex;align-items:center;justify-content:center;margin:0 auto 18px;">' +
          '<svg width="28" height="28" fill="none" stroke="#f87171" viewBox="0 0 24 24">' +
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v4m0 4h.01M10.3 3.7l-8.1 14A2 2 0 004 21h16a2 2 0 001.8-3.3l-8.1-14a2 2 0 00-3.4 0z"/>' +
          '</svg>' +
        '</div>' +
        '<h2 style="color:var(--c-100);margin:0 0 10px;">Unable to Load Request</h2>' +
        '<p style="color:var(--c-500);font-size:13px;margin:0 0 24px;">' +
          message +
        '</p>' +
        '<a href="access-requests.php" class="btn btn-primary">Back to Access Requests</a>' +
      '</div>';
  }

  /*
   * Update the Reviewer Notes and
   * Access Justification cards.
   */
  function updateTextCards(request) {
    var cards =
      document.querySelectorAll(
        '.page-content .card'
      );

    cards.forEach(function (card) {

      var heading =
        card.querySelector('h2');

      if (!heading) {
        return;
      }

      var title =
        heading.textContent.trim();

      if (title === 'Reviewer Notes') {

        var reviewerParagraph =
          card.querySelector('p');

        if (reviewerParagraph) {
          reviewerParagraph.textContent =
            request.decision_reason ||
            'No reviewer note provided.';
        }
      }

      if (title === 'Access Justification') {

        var justificationParagraph =
          card.querySelector('p');

        if (justificationParagraph) {
          justificationParagraph.textContent =
            request.justification ||
            'No justification provided.';
        }
      }
    });
  }

  /*
   * Update the Student card.
   */
  function updateStudentCard(profile) {
    var cards =
      document.querySelectorAll(
        '.page-content .card'
      );

    var studentCard =
      Array.from(cards).find(
        function (card) {

          var heading =
            card.querySelector('h3');

          return (
            heading &&
            heading.textContent.trim() ===
              'Student'
          );
        }
      );

    if (!studentCard) {
      return;
    }

    var studentName =
      studentCard.querySelector(
        'p[style*="font-weight:600"]'
      );

    var studentId =
      studentCard.querySelector(
        'p[style*="font-size:11px"]'
      );

    var avatar =
      studentCard.querySelector(
        '.avatar'
      );

    var name =
      profile.full_name || '';

    var id =
      profile.student_id || '';

    if (studentName) {
      studentName.textContent =
        name;
    }

    if (studentId) {
      studentId.textContent =
        id;
    }

    if (avatar) {

      var parts =
        name.trim().split(/\s+/);

      var initials = '';

      if (parts.length > 0) {
        initials +=
          parts[0]
            .charAt(0)
            .toUpperCase();
      }

      if (parts.length > 1) {
        initials +=
          parts[parts.length - 1]
            .charAt(0)
            .toUpperCase();
      }

      avatar.textContent =
        initials;
    }
  }

  /*
   * Main Supabase loading process.
   */
  async function initializePage() {

    try {

      /*
       * Wait for the Supabase client.
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
       * Get current authenticated student.
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

      /*
       * Get the request passed by the View button.
       */
      var requestParameter =
        getRequestParameter();

      var numericRequestNumber =
        getNumericRequestNumber(
          requestParameter
        );

      /*
       * Load the student's profile.
       */
      var profileResult =
        await supabase
          .from('profiles')
          .select(
            `
              id,
              student_id,
              full_name,
              email,
              program,
              year_level,
              clearance_level,
              role,
              account_active
            `
          )
          .eq(
            'id',
            session.user.id
          )
          .maybeSingle();

      if (profileResult.error) {
        throw profileResult.error;
      }

      var profile =
        profileResult.data;

      if (!profile) {
        throw new Error(
          'Your student profile could not be found.'
        );
      }

      if (
        profile.role !== 'student'
      ) {
        throw new Error(
          'This page is only available to student accounts.'
        );
      }

      if (
        profile.account_active === false
      ) {
        throw new Error(
          'Your account is currently inactive.'
        );
      }

      /*
       * Load the exact request.
       *
       * If request=REQ-2026-020 was supplied,
       * use request_number = 20.
       */
      var requestQuery =
        supabase
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
            `
          )
          .eq(
            'requester_id',
            session.user.id
          )
          .eq(
            'status',
            'approved'
          );

      var requestResult;

      if (
        numericRequestNumber !== null
      ) {

        requestResult =
          await requestQuery
            .eq(
              'request_number',
              numericRequestNumber
            )
            .maybeSingle();

      } else {

        /*
         * If no request parameter exists,
         * use the newest approved request.
         */
        requestResult =
          await requestQuery
            .order(
              'submitted_at',
              {
                ascending: false
              }
            )
            .limit(1)
            .maybeSingle();
      }

      if (requestResult.error) {
        throw requestResult.error;
      }

      var request =
        requestResult.data;

      if (!request) {
        throw new Error(
          requestParameter
            ? 'The approved request ' +
              requestParameter +
              ' could not be found.'
            : 'No approved access request was found.'
        );
      }

      /*
       * Make sure the request belongs
       * to the logged-in student.
       */
      if (
        request.requester_id !==
        session.user.id
      ) {
        throw new Error(
          'You are not authorized to view this request.'
        );
      }

      /*
       * Get resource information.
       */
      var resource =
        request.resources || {};

      /*
       * Load the access grant belonging
       * to THIS request and THIS student.
       */
      var grantResult =
        await supabase
          .from('access_grants')
          .select(
            `
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
            `
          )
          .eq(
            'request_id',
            request.id
          )
          .eq(
            'student_id',
            profile.id
          )
          .maybeSingle();

      if (grantResult.error) {
        throw grantResult.error;
      }

      var grant =
        grantResult.data;

      if (!grant) {
        throw new Error(
          'This request was approved, but no access grant has been created yet.'
        );
      }

      /*
       * Check the actual grant status.
       */
      var grantStatus =
        String(
          grant.status || ''
        ).toLowerCase();

      if (
        grantStatus !== 'active'
      ) {
        throw new Error(
          'This access grant is no longer active.'
        );
      }

      /*
       * Check expiration.
       */
      var expiresAt =
        new Date(
          grant.expires_at
        );

      if (
        isNaN(
          expiresAt.getTime()
        )
      ) {
        throw new Error(
          'The access grant has an invalid expiration date.'
        );
      }

      /*
       * Display request ID.
       */
      setText(
        'approved-request-id',
        formatRequestNumber(
          request.request_number
        )
      );

      /*
       * Resource.
       */
      setText(
        'approved-resource',
        resource.name
      );

      /*
       * Security level.
       */
      setText(
        'approved-security',
        resource.sensitivity ||
          'Standard'
      );

      /*
       * Request metadata.
       */
      setText(
        'approved-request-meta',
        formatRequestNumber(
          request.request_number
        ) +
        ' • Submitted ' +
        formatDate(
          request.submitted_at
        )
      );

      /*
       * Permission comes from the
       * actual access grant.
       */
      setText(
        'approved-permission',
        grant.permission ||
          request.permission
      );

      /*
       * Duration comes from the request.
       */
      setText(
        'approved-duration',
        request.duration
      );

      /*
       * Actual grant start date.
       */
      setText(
        'approved-start',
        formatDate(
          grant.starts_at
        )
      );

      /*
       * Actual grant expiration date.
       */
      setText(
        'approved-expires',
        formatDate(
          grant.expires_at
        )
      );

      /*
       * Actual reviewer/approver.
       */
      var approverName =
        'Administrator';

      if (
        request.reviewer_id
      ) {

        var reviewerResult =
          await supabase
            .from('profiles')
            .select(
              'full_name'
            )
            .eq(
              'id',
              request.reviewer_id
            )
            .maybeSingle();

        if (
          !reviewerResult.error &&
          reviewerResult.data &&
          reviewerResult.data.full_name
        ) {
          approverName =
            reviewerResult.data.full_name;
        }
      }

      setText(
        'approved-by',
        approverName
      );

      /*
       * Actual approval date.
       */
      setText(
        'approved-date',
        formatDateTime(
          request.decided_at
        )
      );

      /*
       * Request Info → expiration.
       */
      setText(
        'approved-info-expires',
        formatDate(
          grant.expires_at
        )
      );

      /*
       * Request Info → status.
       */
      setText(
        'approved-info-status',
        'Approved'
      );

      /*
       * Request Info → actual grant status.
       */
      setText(
        'approved-info-access-status',
        grant.status
      );

      /*
       * Reviewer notes and justification.
       */
      updateTextCards(
        request
      );

      /*
       * Student information.
       */
      updateStudentCard(
        profile
      );

      console.log(
        'Approved request loaded:',
        formatRequestNumber(
          request.request_number
        ),
        resource.name
      );

      console.log(
        'Access grant loaded:',
        grant.id
      );

    } catch (error) {

      showError(
        error && error.message
          ? error.message
          : 'An unexpected error occurred while loading this request.'
      );
    }
  }

  /*
   * Start the page.
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