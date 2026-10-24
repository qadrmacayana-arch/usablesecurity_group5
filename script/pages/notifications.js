(function () {
  var currentType = 'all';
  var supabaseClient = null;

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

  function formatNotificationDate(value) {
    if (!value) {
      return '';
    }

    var date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function getNotificationType(notification) {
    var type = String(
      notification.notification_type || ''
    ).toLowerCase();

    if (
      type === 'approval' ||
      type === 'approved'
    ) {
      return 'approval';
    }

    if (
      type === 'rejection' ||
      type === 'rejected' ||
      type === 'denied'
    ) {
      return 'rejection';
    }

    if (
      type === 'pending' ||
      type === 'submitted' ||
      type === 'submission'
    ) {
      return 'pending';
    }

    return 'approval';
  }

  function isNotificationRead(notification) {
    return !!notification.read_at;
  }

  function updateNotificationCounts() {
    var items = Array.from(
      document.querySelectorAll(
        '#notif-list .notif-item'
      )
    );

    var unread = items.filter(function (item) {
      return (
        item.getAttribute('data-read') ===
        'false'
      );
    }).length;

    var tabs =
      document.querySelectorAll('.ftab');

    if (tabs.length >= 2) {
      tabs[0].textContent =
        'All (' + items.length + ')';

      tabs[1].textContent =
        'Unread (' + unread + ')';
    }

    ['sb-notif-badge', 'topbar-notif-badge'].forEach(function (id) {
      var badge = document.getElementById(id);
      if (!badge) {
        return;
      }

      badge.textContent = unread > 99 ? '99+' : String(unread);
      badge.hidden = unread < 1;
      badge.setAttribute('aria-label', unread + ' unread notifications');
    });
  }

  function filterNotif(type, btn) {
    currentType = type;

    document
      .querySelectorAll('.ftab')
      .forEach(function (button) {
        button.classList.remove(
          'active'
        );
      });

    if (btn) {
      btn.classList.add('active');
    }

    document
      .querySelectorAll(
        '#notif-list .notif-item'
      )
      .forEach(function (item) {
        var itemType =
          item.getAttribute(
            'data-type'
          );

        var isRead =
          item.getAttribute(
            'data-read'
          ) === 'true';

        var show =
          type === 'all' ||
          type === itemType ||
          (
            type === 'unread' &&
            !isRead
          );

        item.style.display =
          show ? '' : 'none';
      });
  }

  async function markNotificationRead(
    notificationId,
    item
  ) {
    if (!supabaseClient) {
      return;
    }

    try {
      var result =
        await supabaseClient
          .from('notifications')
          .update({
            read_at:
              new Date().toISOString()
          })
          .eq(
            'id',
            notificationId
          );

      if (result.error) {
        console.error(
          'Unable to mark notification as read:',
          result.error
        );

        return;
      }

      item.setAttribute(
        'data-read',
        'true'
      );

      var dot =
        item.querySelector(
          '.notif-dot'
        );

      if (dot) {
        dot.style.background =
          'var(--c-700)';
      }

      var title =
        item.querySelector(
          '.notif-title'
        );

      if (title) {
        title.style.color =
          'var(--c-500)';
      }

      updateNotificationCounts();

    } catch (error) {
      console.error(
        'Notification read update failed:',
        error
      );
    }
  }

  async function markAllRead() {
    if (!supabaseClient) {
      return;
    }

    try {
      var sessionResult =
        await supabaseClient.auth.getSession();

      if (sessionResult.error) {
        throw sessionResult.error;
      }

      var session =
        sessionResult.data.session;

      if (
        !session ||
        !session.user
      ) {
        return;
      }

      var result =
        await supabaseClient
          .from('notifications')
          .update({
            read_at:
              new Date().toISOString()
          })
          .eq(
            'recipient_id',
            session.user.id
          )
          .is(
            'read_at',
            null
          );

      if (result.error) {
        throw result.error;
      }

      document
        .querySelectorAll(
          '#notif-list .notif-item'
        )
        .forEach(function (item) {
          item.setAttribute(
            'data-read',
            'true'
          );

          var dot =
            item.querySelector(
              '.notif-dot'
            );

          if (dot) {
            dot.style.background =
              'var(--c-700)';
          }

          var title =
            item.querySelector(
              '.notif-title'
            );

          if (title) {
            title.style.color =
              'var(--c-500)';
          }
        });

      updateNotificationCounts();

    } catch (error) {
      console.error(
        'Unable to mark all notifications as read:',
        error
      );
    }
  }

  function getRequestLink(
    notification
  ) {
    var requestNumber =
      notification.request_number;

    if (
      requestNumber === null ||
      requestNumber === undefined
    ) {
      return null;
    }

    var formatted =
      formatRequestNumber(
        requestNumber
      );

    var type =
      getNotificationType(
        notification
      );

    if (type === 'approval') {
      return (
        'request-approved.php?request=' +
        encodeURIComponent(
          formatted
        )
      );
    }

    if (type === 'rejection') {
      return (
        'request-denied.php?request=' +
        encodeURIComponent(
          formatted
        )
      );
    }

    return (
      'request-pending.php?request=' +
      encodeURIComponent(
        formatted
      )
    );
  }

  function buildMessageItem(
    notification
  ) {
    var item =
      document.createElement('div');

    item.className =
      'notif-item';

    var type =
      getNotificationType(
        notification
      );

    var isRead =
      isNotificationRead(
        notification
      );

    item.setAttribute(
      'data-type',
      type
    );

    item.setAttribute(
      'data-read',
      isRead
        ? 'true'
        : 'false'
    );

    item.setAttribute(
      'data-notification-id',
      notification.id
    );

    if (
      notification.request_number !==
      null &&
      notification.request_number !==
      undefined
    ) {
      item.setAttribute(
        'data-request-number',
        formatRequestNumber(
          notification.request_number
        )
      );
    }

    item.style.cssText =
      'display:flex;gap:12px;padding:16px 0;border-bottom:1px solid var(--c-800);';

    var dot =
      document.createElement('div');

    dot.className =
      'notif-dot';

    dot.style.cssText =
      'width:8px;height:8px;border-radius:50%;margin-top:5px;flex:none;background:' +
      (
        isRead
          ? 'var(--c-700)'
          : 'var(--c-indigo)'
      ) +
      ';';

    var content =
      document.createElement('div');

    content.style.cssText =
      'flex:1;min-width:0;';

    var head =
      document.createElement('div');

    head.style.cssText =
      'display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;';

    var title =
      document.createElement('p');

    title.className =
      'notif-title';

    title.style.cssText =
      'font-size:13px;font-weight:600;color:' +
      (
        isRead
          ? 'var(--c-500)'
          : 'var(--c-200)'
      ) +
      ';margin:0;';

    title.textContent =
      notification.title ||
      'Notification';

    var time =
      document.createElement('span');

    time.style.cssText =
      'font-size:11px;color:var(--c-600);white-space:nowrap;';

    time.textContent =
      formatNotificationDate(
        notification.created_at
      );

    head.appendChild(title);
    head.appendChild(time);

    var text =
      document.createElement('p');

    text.style.cssText =
      'font-size:12px;color:var(--c-500);margin:4px 0 0;';

    text.textContent =
      notification.message || '';

    content.appendChild(head);
    content.appendChild(text);

    var requestLink =
      getRequestLink(
        notification
      );

    if (requestLink) {
      var link =
        document.createElement('a');

      link.href =
        requestLink;

      link.style.cssText =
        'font-size:12px;color:var(--c-indigo-l);text-decoration:none;display:inline-block;margin-top:6px;';

      link.textContent =
        'View Request →';

      link.addEventListener(
        'click',
        function () {
          if (!isRead) {
            markNotificationRead(
              notification.id,
              item
            );
          }
        }
      );

      content.appendChild(link);
    }

    item.appendChild(dot);
    item.appendChild(content);

    /*
     * Clicking the notification itself
     * also marks it as read.
     */
    item.addEventListener(
      'click',
      function (event) {
        /*
         * Don't interfere with the actual
         * View Request link navigation.
         */
        if (
          event.target &&
          event.target.tagName === 'A'
        ) {
          return;
        }

        if (!isNotificationRead(notification)) {
          markNotificationRead(
            notification.id,
            item
          );
        }
      }
    );

    return item;
  }

  function renderEmptyState(
    list
  ) {
    list.textContent = '';

    var empty =
      document.createElement('div');

    empty.style.cssText =
      'padding:42px 20px;text-align:center;color:var(--c-500);font-size:13px;';

    empty.textContent =
      'You have no notifications yet. Updates will appear here after an administrator reviews your request.';

    list.appendChild(empty);

    updateNotificationCounts();
  }

  async function loadNotifications() {

    
    var list =
      document.getElementById(
        'notif-list'
      );

    if (!list) {
      return;
    }

    try {
      if (
        !window.secureAccessSupabaseReady
      ) {
        throw new Error(
          'Supabase client is not available.'
        );
      }

      supabaseClient =
        await window.secureAccessSupabaseReady;

      var sessionResult =
        await supabaseClient.auth.getSession();

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
       * Load notifications belonging ONLY
       * to the currently authenticated student.
       */
      var result =
        await supabaseClient
          .from('notifications')
          .select(
            `
            id,
            recipient_id,
            request_id,
            notification_type,
            title,
            message,
            read_at,
            created_at
            `
          )
          .eq(
            'recipient_id',
            session.user.id
          )
          .order(
            'created_at',
            {
              ascending: false
            }
          );

      if (result.error) {
        throw result.error;
      }

      var notifications =
        result.data || [];

      console.log(
        'SUPABASE NOTIFICATIONS:',
        notifications
      );

      /*
       * Load request numbers for notifications
       * that are connected to an access request.
       */
      var requestIds =
        notifications
          .map(function (notification) {
            return notification.request_id;
          })
          .filter(function (id) {
            return !!id;
          });

      var requestMap = {};

      if (requestIds.length) {
        var requestsResult =
          await supabaseClient
            .from('access_requests')
            .select(
              `
              id,
              request_number
              `
            )
            .in(
              'id',
              requestIds
            );

        if (requestsResult.error) {
          console.error(
            'Unable to load notification request numbers:',
            requestsResult.error
          );
        } else {
          (
            requestsResult.data || []
          ).forEach(function (request) {
            requestMap[
              request.id
            ] =
              request.request_number;
          });
        }
      }

      /*
       * Attach the request number to each
       * notification for display/linking.
       */
      notifications.forEach(
        function (notification) {
          notification.request_number =
            notification.request_id
              ? requestMap[
                  notification.request_id
                ]
              : null;
        }
      );

      list.textContent = '';

      if (!notifications.length) {
        renderEmptyState(list);
        return;
      }

      notifications.forEach(
        function (notification) {
          list.appendChild(
            buildMessageItem(
              notification
            )
          );
        }
      );

      updateNotificationCounts();

      /*
       * Re-apply the currently selected filter.
       */
      var activeTab =
        document.querySelector(
          '.ftab.active'
        );

      if (activeTab) {
        filterNotif(
          currentType,
          activeTab
        );
      }

    } catch (error) {
      console.error(
        'Unable to load notifications from Supabase:',
        error
      );

      list.textContent = '';

      var errorMessage =
        document.createElement('div');

      errorMessage.style.cssText =
        'padding:30px;text-align:center;color:var(--c-500);font-size:13px;';

      errorMessage.textContent =
        'Unable to load your notifications. Please refresh the page and try again.';

      list.appendChild(
        errorMessage
      );
    }
  }

  /*
   * Make these functions available
   * to existing HTML buttons.
   */
  window.filterNotif =
    filterNotif;

  window.markAllRead =
    markAllRead;

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      loadNotifications
    );
  } else {
    loadNotifications();
  }
})();