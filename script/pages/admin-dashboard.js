(function () {
  'use strict';

  async function initializeDashboard() {
    try {
      /*
       * Wait for Supabase.
       */
      if (!window.secureAccessSupabaseReady) {
        throw new Error(
          'Supabase client is not available.'
        );
      }

      var supabase =
        await window.secureAccessSupabaseReady;

      /*
       * Make sure an administrator is logged in.
       */
      var sessionResult =
        await supabase.auth.getSession();

      if (sessionResult.error) {
        throw sessionResult.error;
      }

      var session =
        sessionResult.data.session;

      if (!session || !session.user) {
        throw new Error(
          'Administrator session not found.'
        );
      }

      /*
       * Load administrator profile.
       */
      var profileResult =
        await supabase
          .from('profiles')
          .select(
            'id, full_name, email, role, account_active'
          )
          .eq('id', session.user.id)
          .single();

      if (profileResult.error) {
        throw profileResult.error;
      }

      var profile =
        profileResult.data;

      if (
        !profile.account_active ||
        (
          profile.role !== 'administrator' &&
          profile.role !== 'admin'
        )
      ) {
        throw new Error(
          'Administrator access is required.'
        );
      }

      /*
       * --------------------------------------------------
       * PENDING REQUESTS
       * --------------------------------------------------
       *
       * Count every pending request in Supabase.
       */
      var pendingResult =
        await supabase
          .from('access_requests')
          .select(
            'id',
            {
              count: 'exact',
              head: true
            }
          )
          .eq(
            'status',
            'pending'
          );

      if (pendingResult.error) {
        throw pendingResult.error;
      }

      var pendingCount =
        pendingResult.count || 0;

      document.getElementById(
        'pending-count'
      ).textContent = pendingCount;
      document.getElementById(
        'queue-pending-count'
      ).textContent = pendingCount + ' pending request(s)';

      var urgentResult = await supabase
        .from('access_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('urgency', 'urgent');
      if (urgentResult.error) throw urgentResult.error;
      document.getElementById(
        'queue-urgent-count'
      ).textContent = (urgentResult.count || 0) + ' urgent request(s)';


      /*
       * --------------------------------------------------
       * LATEST DECISION
       * --------------------------------------------------
       *
       * Get the most recently decided request.
       */
      var decisionResult =
        await supabase
          .from('access_requests')
          .select(
            'status, decided_at, decision_reason'
          )
          .not(
            'decided_at',
            'is',
            null
          )
          .order(
            'decided_at',
            {
              ascending: false
            }
          )
          .limit(1);

      if (decisionResult.error) {
        throw decisionResult.error;
      }

      var latestDecision =
        decisionResult.data &&
        decisionResult.data.length
          ? decisionResult.data[0]
          : null;

      var decisionText =
        'No decisions';

      if (latestDecision) {
        var decisionStatus =
          String(
            latestDecision.status || ''
          ).toLowerCase();

        if (
          decisionStatus === 'approved'
        ) {
          decisionText = 'Approved';
        } else if (
          decisionStatus === 'rejected'
        ) {
          decisionText = 'Rejected';
        } else {
          decisionText =
            decisionStatus || '—';
        }
      }

      document.getElementById(
        'decision-count'
      ).textContent = decisionText;


      /*
       * --------------------------------------------------
       * MESSAGES SENT
       * --------------------------------------------------
       *
       * Count administrator messages from
       * the Supabase messages table.
       */
      var messageResult =
        await supabase
          .from('messages')
          .select(
            'id',
            {
              count: 'exact',
              head: true
            }
          );

      if (messageResult.error) {
        throw messageResult.error;
      }

      var messageCount =
        messageResult.count || 0;

      document.getElementById(
        'message-count'
      ).textContent = messageCount;


      /*
       * --------------------------------------------------
       * ACTIVE ACCESS GRANTS
       * --------------------------------------------------
       *
       * Count grants whose status is active.
       */
      var grantResult =
        await supabase
          .from('access_grants')
          .select(
            'id',
            {
              count: 'exact',
              head: true
            }
          )
          .eq(
            'status',
            'active'
          );

      if (grantResult.error) {
        throw grantResult.error;
      }

      var activeGrantCount =
        grantResult.count || 0;

      document.getElementById(
        'active-access-count'
      ).textContent =
        activeGrantCount;
      document.getElementById(
        'queue-active-grants'
      ).textContent = activeGrantCount + ' active grant(s)';


      /*
       * --------------------------------------------------
       * REVIEW SLA
       * --------------------------------------------------
       *
       * Calculate the percentage of decided
       * requests that were reviewed within
       * 3 days of submission.
       */
      var slaResult =
        await supabase
          .from('access_requests')
          .select(
            'submitted_at, decided_at'
          )
          .not(
            'decided_at',
            'is',
            null
          );

      if (slaResult.error) {
        throw slaResult.error;
      }

      var decidedRequests =
        slaResult.data || [];

      var reviewRate = 0;

      if (decidedRequests.length > 0) {
        var withinSla = 0;

        decidedRequests.forEach(
          function (request) {
            if (
              !request.submitted_at ||
              !request.decided_at
            ) {
              return;
            }

            var submitted =
              new Date(
                request.submitted_at
              ).getTime();

            var decided =
              new Date(
                request.decided_at
              ).getTime();

            var difference =
              decided - submitted;

            var threeDays =
              3 *
              24 *
              60 *
              60 *
              1000;

            if (
              difference <= threeDays
            ) {
              withinSla++;
            }
          }
        );

        reviewRate =
          Math.round(
            (
              withinSla /
              decidedRequests.length
            ) * 100
          );
      }

      document.getElementById(
        'review-rate'
      ).textContent =
        decidedRequests.length > 0
          ? reviewRate + '%'
          : 'N/A';


      /*
       * --------------------------------------------------
       * REQUEST STATUS CARD
       * --------------------------------------------------
       *
       * Show the most recent request.
       */
      var latestRequestResult =
        await supabase
          .from('access_requests')
          .select(
            'request_number, status, submitted_at'
          )
          .order(
            'submitted_at',
            {
              ascending: false
            }
          )
          .limit(1);

      if (latestRequestResult.error) {
        throw latestRequestResult.error;
      }

      var latestRequest =
        latestRequestResult.data &&
        latestRequestResult.data.length
          ? latestRequestResult.data[0]
          : null;

      var statusElement =
        document.getElementById(
          'request-status'
        );

      if (
        latestRequest &&
        statusElement
      ) {
        var requestStatus =
          String(
            latestRequest.status || ''
          ).toLowerCase();

        var displayStatus =
          requestStatus;

        if (
          requestStatus === 'pending'
        ) {
          displayStatus =
            'Pending Review';
        } else if (
          requestStatus === 'approved'
        ) {
          displayStatus =
            'Approved';
        } else if (
          requestStatus === 'rejected'
        ) {
          displayStatus =
            'Rejected';
        }

        var badgeClass =
          requestStatus === 'approved'
            ? 'b-green'
            : requestStatus === 'rejected'
              ? 'b-red'
              : 'b-amber';

        statusElement.innerHTML =
          '<span class="badge ' +
          badgeClass +
          '">' +
          displayStatus +
          '</span>';
      } else if (statusElement) {
        statusElement.innerHTML =
          '<span class="badge b-slate">' +
          'No requests' +
          '</span>';
      }

      console.log(
        'ADMIN DASHBOARD DATA:',
        {
          pendingCount:
            pendingCount,

          latestDecision:
            decisionText,

          messageCount:
            messageCount,

          activeGrantCount:
            activeGrantCount,

          reviewRate:
            reviewRate,

          latestRequest:
            latestRequest
        }
      );

    } catch (error) {
      console.error(
        'Unable to load Admin Dashboard:',
        error
      );

      /*
       * Keep the dashboard usable even if
       * one statistic fails.
       */
      var pendingElement =
        document.getElementById(
          'pending-count'
        );

      if (pendingElement) {
        pendingElement.textContent = '—';
      }

      var decisionElement =
        document.getElementById(
          'decision-count'
        );

      if (decisionElement) {
        decisionElement.textContent = '—';
      }

      var messageElement =
        document.getElementById(
          'message-count'
        );

      if (messageElement) {
        messageElement.textContent = '—';
      }

      var grantElement =
        document.getElementById(
          'active-access-count'
        );

      if (grantElement) {
        grantElement.textContent = '—';
      }

      var slaElement =
        document.getElementById(
          'review-rate'
        );

      if (slaElement) {
        slaElement.textContent = '—';
      }

      ['queue-pending-count', 'queue-urgent-count', 'queue-active-grants'].forEach(function (id) {
        var element = document.getElementById(id);
        if (element) element.textContent = 'Unavailable';
      });

      console.error(
        'Dashboard error details:',
        error
      );
    }
  }

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      initializeDashboard
    );
  } else {
    initializeDashboard();
  }
})();