var currentType = 'all';

function filterNotif(type, btn) {
  currentType = type;
  document.querySelectorAll('.ftab').forEach(function (button) {
    button.classList.remove('active');
  });
  btn.classList.add('active');

  document.querySelectorAll('#notif-list .notif-item').forEach(function (item) {
    var itemType = item.getAttribute('data-type');
    var read = item.getAttribute('data-read');
    var show = type === 'all' || type === itemType || (type === 'unread' && read === 'false');
    item.style.display = show ? '' : 'none';
  });
}

function markAllRead() {
  document.querySelectorAll('.notif-dot').forEach(function (dot) {
    dot.style.background = 'var(--c-700)';
  });
  document.querySelectorAll('#notif-list .notif-item').forEach(function (item) {
    item.setAttribute('data-read', 'true');
    var title = item.querySelector('p:first-child');
    if (title) title.style.color = 'var(--c-500)';
  });
}

document.addEventListener('DOMContentLoaded', function () {
  var saved = localStorage.getItem('secureAccessAdminMessages');
  if (!saved) return;
  var messages = JSON.parse(saved);
  var list = document.getElementById('notif-list');
  if (!list || !messages.length) return;
  messages.forEach(function (message, index) {
    var item = document.createElement('div');
    item.className = 'notif-item';
    item.setAttribute('data-type', 'approval');
    item.setAttribute('data-read', 'false');
    item.innerHTML = '<div class="notif-dot" style="background:var(--c-indigo);"></div><div style="flex:1;min-width:0;"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;"><p style="font-size:13px;font-weight:600;color:var(--c-200);margin:0;">Administrator message</p><span style="font-size:11px;color:var(--c-600);white-space:nowrap;">' + message.sentAt + '</span></div><p style="font-size:12px;color:var(--c-500);margin:4px 0 0;">' + message.text + '</p></div>';
    list.insertBefore(item, list.firstChild);
  });
});
