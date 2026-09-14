function renderAdminMessages() {
  var messages = getAdminMessages();
  var list = document.getElementById('admin-message-list');
  if (!messages.length) {
    list.innerHTML = '<p style="color:var(--c-500);font-size:13px;">No messages yet. Decisions sent from Access Requests will appear here for the student.</p>';
    return;
  }
  list.innerHTML = messages.map(function (message) {
    return '<div style="padding:14px 0;border-bottom:1px solid var(--c-800);"><div style="display:flex;justify-content:space-between;gap:12px;"><strong style="font-size:13px;color:var(--c-200);">' + message.from + '</strong><span style="font-size:11px;color:var(--c-600);">' + message.sentAt + '</span></div><p style="font-size:13px;color:var(--c-400);margin:6px 0 0;line-height:1.6;">' + message.text + '</p></div>';
  }).join('');
}

document.addEventListener('DOMContentLoaded', renderAdminMessages);

function sendStudentMessage() {
  var input = document.getElementById('student-message');
  var text = input.value.trim();
  if (!text) {
    document.getElementById('message-error').style.display = 'block';
    return;
  }
  sendAdminMessage(text);
  recordAdminAudit('Sent student message', 'Message sent to Alexandra Chen');
  input.value = '';
  document.getElementById('message-error').style.display = 'none';
  renderAdminMessages();
}
