(function () {

  var notifications = [];
  var profiles = {};
  var requests = {};

  function escapeHtml(value) {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getInitials(name) {
    if (!name) {
      return '--';
    }

    var parts = String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!parts.length) {
      return '--';
    }

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return 'Unknown date';
    }

    var date = new Date(dateValue);

    if (isNaN(date.getTime())) {
      return 'Unknown date';
    }

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function formatRequestNumber(number) {
    if (
      number === null ||
      number === undefined ||
      number === ''
    ) {
      return 'Request';
    }

    return (
      'REQ-2026-' +
      String(number).padStart(3, '0')
    );
  }

  function getNotificationLabel(notification) {

    if (!notification) {
      return 'Request Decision';
    }

    if (notification.notification_type) {

      var type =
        String(notification.notification_type)
          .toLowerCase();

      if (type.includes('approved')) {
        return 'Access Request Approved';
      }

      if (type.includes('rejected')) {
        return 'Access Request Rejected';
      }

      if (type.includes('decision')) {
        return 'Access Request Decision';
      }
    }

    return (
      notification.title ||
      'Request Decision'
    );
  }

  async function loadMessageHistory() {

    try {

      var supabase =
        await window.secureAccessSupabaseReady;

      if (!supabase) {
        throw new Error(
          'Supabase client is unavailable.'
        );
      }

      /*
       * Get all real notifications.
       */
      var notificationResult =
        await supabase
          .from('notifications')
          .select(
            'id, recipient_id, request_id, notification_type, title, message, read_at, created_at'
          )
          .order(
            'created_at',
            {
              ascending: false
            }
          );

      if (notificationResult.error) {
        throw notificationResult.error;
      }

      notifications =
        notificationResult.data || [];

      /*
       * Get the student profiles connected
       * to the notifications.
       */
      var recipientIds = [];

      notifications.forEach(
        function (notification) {

          if (
            notification.recipient_id &&
            !recipientIds.includes(
              notification.recipient_id
            )
          ) {
            recipientIds.push(
              notification.recipient_id
            );
          }

        }
      );

      if (recipientIds.length) {

        var profileResult =
          await supabase
            .from('profiles')
            .select(
              'id, full_name, student_id, program, year_level, role'
            )
            .in(
              'id',
              recipientIds
            );

        if (profileResult.error) {
          throw profileResult.error;
        }

        (profileResult.data || [])
          .forEach(
            function (profile) {

              profiles[
                profile.id
              ] = profile;

            }
          );

      }

      /*
       * Get the access requests connected
       * to the notifications.
       *
       * The resource information is loaded
       * through the access_requests relationship.
       *
       * This removes the separate resources
       * request that was returning HTTP 401.
       */
      var requestIds = [];

      notifications.forEach(
        function (notification) {

          if (
            notification.request_id &&
            !requestIds.includes(
              notification.request_id
            )
          ) {
            requestIds.push(
              notification.request_id
            );
          }

        }
      );

      if (requestIds.length) {

        var requestResult =
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
              status,
              decision_reason,
              submitted_at,
              decided_at,
              resources (
                id,
                name,
                category
              )
              `
            )
            .in(
              'id',
              requestIds
            );

        if (requestResult.error) {
          throw requestResult.error;
        }

        (requestResult.data || [])
          .forEach(
            function (request) {

              requests[
                request.id
              ] = request;

            }
          );

      }

      renderAdminMessages();

    } catch (error) {

      console.error(
        'ADMIN MESSAGE HISTORY ERROR:',
        error
      );

      var list =
        document.getElementById(
          'admin-message-list'
        );

      if (list) {

        list.innerHTML =
          '<p style="color:var(--c-red);font-size:13px;">' +
          'Unable to load message history.' +
          '</p>';

      }

    }

  }

  function renderAdminMessages() {

    var list =
      document.getElementById(
        'admin-message-list'
      );

    if (!list) {
      return;
    }

    if (!notifications.length) {

      updateStudentHeader(null);

      list.innerHTML =
        '<p style="color:var(--c-500);font-size:13px;">' +
        'No messages yet. Decisions sent from Access Requests will appear here for the student.' +
        '</p>';

      return;

    }

    /*
     * Use the newest notification to populate
     * the student header.
     */
    var latestNotification =
      notifications[0];

    updateStudentHeader(
      latestNotification
    );

    list.innerHTML =
      notifications
        .map(
          function (notification) {

            var profile =
              profiles[
                notification.recipient_id
              ] || null;

            var request =
              requests[
                notification.request_id
              ] || null;

            var studentName =
              profile &&
              profile.full_name
                ? profile.full_name
                : 'Unknown Student';

            var requestLabel =
              request
                ? formatRequestNumber(
                    request.request_number
                  )
                : 'Request';

            /*
             * Resource name now comes directly
             * from the access_requests relationship.
             */
            var resourceName =
              request &&
              request.resources &&
              request.resources.name
                ? request.resources.name
                : '';

            var title =
              notification.title ||
              getNotificationLabel(
                notification
              );

            var message =
              notification.message ||
              'No message content available.';

            var readStatus =
              notification.read_at
                ? 'Read'
                : 'Unread';

            return `
              <div
                style="
                  padding:16px 0;
                  border-bottom:1px solid var(--c-800);
                "
              >

                <div
                  style="
                    display:flex;
                    justify-content:space-between;
                    align-items:flex-start;
                    gap:16px;
                  "
                >

                  <div>

                    <strong
                      style="
                        font-size:13px;
                        color:var(--c-200);
                      "
                    >
                      ${escapeHtml(title)}
                    </strong>

                    <p
                      style="
                        font-size:11px;
                        color:var(--c-600);
                        margin:4px 0 0;
                      "
                    >
                      ${escapeHtml(studentName)}
                      ·
                      ${escapeHtml(requestLabel)}
                      ${
                        resourceName
                          ? ' · ' +
                            escapeHtml(
                              resourceName
                            )
                          : ''
                      }
                    </p>

                  </div>

                  <span
                    style="
                      font-size:11px;
                      color:var(--c-600);
                      white-space:nowrap;
                    "
                  >
                    ${escapeHtml(
                      formatDate(
                        notification.created_at
                      )
                    )}
                  </span>

                </div>

                <p
                  style="
                    font-size:13px;
                    color:var(--c-400);
                    margin:8px 0 0;
                    line-height:1.6;
                  "
                >
                  ${escapeHtml(message)}
                </p>

                <p
                  style="
                    font-size:10px;
                    color:var(--c-600);
                    margin:7px 0 0;
                  "
                >
                  ${escapeHtml(readStatus)}
                </p>

              </div>
            `;

          }
        )
        .join('');

  }

  function updateStudentHeader(notification) {

    var nameElement =
      document.getElementById(
        'message-student-name'
      );

    var infoElement =
      document.getElementById(
        'message-student-info'
      );

    var avatarElement =
      document.getElementById(
        'message-student-avatar'
      );

    if (!notification) {

      if (nameElement) {
        nameElement.textContent =
          'Message History';
      }

      if (infoElement) {
        infoElement.textContent =
          'Notifications from access request decisions';
      }

      if (avatarElement) {
        avatarElement.textContent =
          '--';
      }

      return;

    }

    var profile =
      profiles[
        notification.recipient_id
      ] || null;

    var request =
      requests[
        notification.request_id
      ] || null;

    var name =
      profile &&
      profile.full_name
        ? profile.full_name
        : 'Unknown Student';

    var studentId =
      profile &&
      profile.student_id
        ? profile.student_id
        : '';

    var requestLabel =
      request
        ? formatRequestNumber(
            request.request_number
          )
        : 'Request';

    if (nameElement) {
      nameElement.textContent =
        name;
    }

    if (infoElement) {

      infoElement.textContent =
        (
          studentId
            ? studentId + ' · '
            : ''
        ) +
        requestLabel;

    }

    if (avatarElement) {
      avatarElement.textContent =
        getInitials(name);
    }

  }

  /*
   * Resource names are now loaded together
   * with access_requests.
   *
   * The previous standalone resources query
   * was removed because it was returning HTTP 401.
   */

  function getResourceName(resourceId) {

    if (!resourceId) {
      return '';
    }

    /*
     * Find the request containing this
     * resource_id and return its joined
     * resource name.
     */
    var requestKeys =
      Object.keys(requests);

    for (
      var i = 0;
      i < requestKeys.length;
      i++
    ) {

      var request =
        requests[
          requestKeys[i]
        ];

      if (
        request &&
        request.resource_id === resourceId &&
        request.resources &&
        request.resources.name
      ) {
        return request.resources.name;
      }

    }

    return '';

  }

  /*
   * Manual message sending remains a placeholder.
   *
   * Message History displays the real
   * notifications created by the decision workflow.
   */
  window.sendStudentMessage =
    function () {

      console.log(
        'Manual message sending is not connected yet. ' +
        'Message History currently displays real Supabase notifications.'
      );

    };

  document.addEventListener(
    'DOMContentLoaded',
    function () {

      loadMessageHistory();

    }
  );

})();