function renderAdminRequest() {
  var request = getAdminRequest();
  document.getElementById('admin-request-status').innerHTML = adminBadge(request.status);
  document.getElementById('admin-request-status-text').textContent = request.status;
  document.getElementById('decision-reason').value = request.decisionReason || '';
  var actions = document.getElementById('request-actions');
  actions.style.display = request.status === 'Pending Review' ? 'flex' : 'none';
}

function decideRequest(status) {
  var request = getAdminRequest();
  var reason = document.getElementById('decision-reason').value.trim();
  if (!reason) {
    document.getElementById('decision-error').textContent = 'Add a short reason before sending the decision.';
    document.getElementById('decision-error').style.display = 'block';
    return;
  }
  request.status = status;
  request.decisionReason = reason;
  saveAdminRequest(request);
  sendAdminMessage('Your request ' + request.id + ' was ' + status.toLowerCase() + '. Administrator note: ' + reason);
  recordAdminAudit(status + ' access request', request.id + ' for ' + request.student);
  document.getElementById('decision-error').style.display = 'none';
  renderAdminRequest();
  document.getElementById('decision-saved').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', renderAdminRequest);
