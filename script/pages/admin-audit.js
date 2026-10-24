document.addEventListener('DOMContentLoaded', async function () {
  var body = document.getElementById('audit-list');

  if (!body) {
    return;
  }

  body.innerHTML =
    '<tr>' +
      '<td colspan="3" style="color:var(--c-500);">' +
        'Loading audit activity...' +
      '</td>' +
    '</tr>';

  try {
    var supabase = await window.secureAccessSupabaseReady;

    var result = await supabase
      .from('audit_logs')
      .select(`
        id,
        actor_id,
        subject_id,
        request_id,
        action,
        category,
        resource_name,
        outcome,
        metadata,
        created_at
      `)
      .order('created_at', {
        ascending: false
      });

    if (result.error) {
      console.error(
        'Unable to load audit logs:',
        result.error
      );

      body.innerHTML =
        '<tr>' +
          '<td colspan="3" style="color:var(--c-red);">' +
            'Unable to load audit activity.' +
          '</td>' +
        '</tr>';

      return;
    }

    var entries = result.data || [];

    if (!entries.length) {
      body.innerHTML =
        '<tr>' +
          '<td colspan="3" style="color:var(--c-500);">' +
            'No administrator activity recorded yet.' +
          '</td>' +
        '</tr>';

      return;
    }

    body.innerHTML = entries.map(function (entry) {

      var reference = '';

      if (entry.request_id) {
        reference =
          formatRequestReference(
            entry.request_id,
            entry.metadata
          );
      } else if (entry.resource_name) {
        reference = entry.resource_name;
      } else {
        reference = '—';
      }

      var timestamp =
        formatAuditTimestamp(
          entry.created_at
        );

      return (
        '<tr>' +

          '<td style="color:var(--c-300);">' +
            escapeHtml(
              entry.action || '—'
            ) +
          '</td>' +

          '<td class="mono" ' +
            'style="font-size:12px;color:var(--c-400);">' +
            escapeHtml(reference) +
          '</td>' +

          '<td style="font-size:12px;color:var(--c-500);">' +
            escapeHtml(timestamp) +
          '</td>' +

        '</tr>'
      );
    }).join('');

    console.log(
      'AUDIT LOGS LOADED:',
      entries
    );

  } catch (error) {

    console.error(
      'Audit page error:',
      error
    );

    body.innerHTML =
      '<tr>' +
        '<td colspan="3" style="color:var(--c-red);">' +
          'Unable to load audit activity.' +
        '</td>' +
      '</tr>';
  }
});


function formatRequestReference(
  requestId,
  metadata
) {
  if (
    metadata &&
    metadata.request_number
  ) {
    return metadata.request_number;
  }

  if (requestId) {
    return requestId;
  }

  return '—';
}


function formatAuditTimestamp(
  timestamp
) {
  if (!timestamp) {
    return '—';
  }

  var date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleString(
    undefined,
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }
  );
}


function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}