document.addEventListener('DOMContentLoaded', function () {
  var request = getAdminRequest();
  var messages = getAdminMessages();
  document.getElementById('pending-count').textContent = request.status === 'Pending Review' ? '1' : '0';
  document.getElementById('decision-count').textContent = request.status === 'Pending Review' ? 'Awaiting review' : request.status;
  document.getElementById('message-count').textContent = messages.length;
  document.getElementById('request-status').innerHTML = adminBadge(request.status);
  document.getElementById('active-access-count').textContent = '12';
  document.getElementById('review-rate').textContent = '94%';
});
