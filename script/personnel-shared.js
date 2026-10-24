(function () {
  'use strict';

  var ready = (async function () {
    var supabase = await window.secureAccessSupabaseReady;
    var sessionResult = await supabase.auth.getSession();
    if (sessionResult.error) throw sessionResult.error;

    var session = sessionResult.data.session;
    if (!session || !session.user) {
      window.location.href = '../auth/login.php';
      throw new Error('Your session has expired. Please sign in again.');
    }

    var profileResult = await supabase
      .from('profiles')
      .select('id, full_name, role, account_active')
      .eq('id', session.user.id)
      .single();
    if (profileResult.error) throw profileResult.error;
    if (profileResult.data.role !== 'teacher' || !profileResult.data.account_active) {
      window.location.href = '../auth/login.php';
      throw new Error('An active teacher account is required.');
    }

    var profile = profileResult.data;
    var name = document.getElementById('personnel-name');
    var avatar = document.getElementById('personnel-avatar');
    if (name) name.textContent = profile.full_name;
    if (avatar) {
      avatar.textContent = profile.full_name.trim().split(/\s+/)
        .slice(0, 2).map(function (part) { return part.charAt(0); })
        .join('').toUpperCase();
    }

    var activePage = document.body.getAttribute('data-personnel-page');
    document.querySelectorAll('[data-personnel-link]').forEach(function (link) {
      if (link.getAttribute('data-personnel-link') === activePage) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });

    var unreadResult = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', profile.id)
      .is('read_at', null);
    if (unreadResult.error) throw unreadResult.error;
    var badge = document.getElementById('personnel-unread-count');
    if (badge && unreadResult.count) {
      badge.textContent = unreadResult.count > 99 ? '99+' : String(unreadResult.count);
      badge.hidden = false;
    }

    return { supabase: supabase, session: session, profile: profile };
  })();

  window.secureAccessPersonnelReady = ready;
})();
