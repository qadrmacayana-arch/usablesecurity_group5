(function () {
  'use strict';

  function status(message, isError) {
    var target = document.getElementById('personnel-dashboard-status');
    target.textContent = message;
    target.classList.toggle('is-error', Boolean(isError));
  }

  function appendRequest(container, request) {
    var item = document.createElement('div');
    item.className = 'personnel-activity-item';
    var details = document.createElement('div');
    var title = document.createElement('strong');
    title.textContent = request.requester && request.requester.full_name
      ? request.requester.full_name
      : 'Student request';
    var subtitle = document.createElement('span');
    subtitle.textContent = [
      request.resources && request.resources.name,
      request.status,
      request.submitted_at ? new Date(request.submitted_at).toLocaleDateString() : ''
    ].filter(Boolean).join(' · ');
    details.append(title, subtitle);
    var state = document.createElement('span');
    state.className = 'badge ' + (request.status === 'pending' ? 'b-amber' : 'b-slate');
    state.textContent = request.status || 'Unknown';
    item.append(details, state);
    container.appendChild(item);
  }

  async function load() {
    var context = await window.secureAccessPersonnelReady;
    var supabase = context.supabase;
    var profile = context.profile;
    document.getElementById('welcome-name').textContent = profile.full_name.split(/\s+/)[0];

    var results = await Promise.all([
      supabase.from('access_requests')
        .select('id, status, submitted_at, resources(name), requester:profiles!access_requests_requester_id_fkey(full_name)')
        .eq('recipient_id', profile.id)
        .order('submitted_at', { ascending: false }),
      supabase.from('academic_content').select('id', { count: 'exact', head: true })
        .eq('teacher_id', profile.id),
      supabase.from('grades').select('id', { count: 'exact', head: true })
        .eq('teacher_id', profile.id),
      supabase.from('messages').select('id', { count: 'exact', head: true })
        .eq('recipient_id', profile.id).is('read_at', null)
    ]);
    results.forEach(function (result) {
      if (result.error) throw result.error;
    });

    var requests = results[0].data || [];
    var pending = requests.filter(function (request) { return request.status === 'pending'; }).length;
    document.getElementById('stat-pending').textContent = String(pending);
    document.getElementById('stat-content').textContent = String(results[1].count || 0);
    document.getElementById('stat-grades').textContent = String(results[2].count || 0);
    document.getElementById('stat-unread').textContent = String(results[3].count || 0);

    var list = document.getElementById('dashboard-requests');
    list.textContent = '';
    if (!requests.length) {
      var empty = document.createElement('p');
      empty.className = 'personnel-muted';
      empty.textContent = 'No student requests have been assigned to you yet.';
      list.appendChild(empty);
    } else {
      requests.slice(0, 5).forEach(function (request) { appendRequest(list, request); });
    }
    status(pending + ' pending student request(s). Your role is to provide context; only an administrator can approve or reject access.', false);
  }

  load().catch(function (error) {
    console.error('Unable to load faculty overview:', error);
    status(error.message || 'Unable to load your faculty workspace.', true);
  });
})();
