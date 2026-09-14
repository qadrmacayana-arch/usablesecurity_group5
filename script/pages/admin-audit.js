document.addEventListener('DOMContentLoaded', function () {
  var entries = JSON.parse(localStorage.getItem(ADMIN_AUDIT_KEY) || '[]');
  var body = document.getElementById('audit-list');
  if (!entries.length) {
    body.innerHTML = '<tr><td colspan="3" style="color:var(--c-500);">No administrator activity recorded yet.</td></tr>';
    return;
  }
  body.innerHTML = entries.map(function (entry) {
    return '<tr><td style="color:var(--c-300);">' + entry.action + '</td><td class="mono" style="font-size:12px;color:var(--c-400);">' + entry.detail + '</td><td style="font-size:12px;color:var(--c-500);">' + entry.at + '</td></tr>';
  }).join('');
});
