// Pending request page-specific behavior.
document.addEventListener('DOMContentLoaded', function () {
  var saved = localStorage.getItem('secureAccessAdminRequest');
  if (!saved) return;
  var request = JSON.parse(saved);
  if (request.status === 'Pending Review') return;
  var status = document.getElementById('request-detail-status');
  var sideStatus = document.getElementById('request-sidebar-status');
  var note = document.getElementById('admin-decision-note');
  var badgeClass = request.status === 'Approved' ? 'b-green' : 'b-red';
  if (status) {
    status.className = 'badge ' + badgeClass;
    status.textContent = request.status;
  }
  if (sideStatus) {
    sideStatus.className = 'badge ' + badgeClass;
    sideStatus.textContent = request.status;
  }
  if (note) {
    note.style.display = 'block';
    note.querySelector('span').textContent = request.decisionReason;
  }
});
