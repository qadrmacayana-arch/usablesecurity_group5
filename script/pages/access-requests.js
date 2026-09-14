function filterReqs(filter, btn) {
  document.querySelectorAll('.ftab').forEach(function (button) {
    button.classList.remove('active');
  });
  btn.classList.add('active');

  document.querySelectorAll('#req-tbody tr').forEach(function (row) {
    var status = row.getAttribute('data-status');
    row.style.display = filter === 'all' || status === filter ? '' : 'none';
  });
}

document.addEventListener('DOMContentLoaded', function () {
  var saved = localStorage.getItem('secureAccessAdminRequest');
  if (!saved) return;
  var request = JSON.parse(saved);
  var row = document.querySelector('#req-tbody tr[data-status="pending"]');
  if (!row || request.status === 'Pending Review') return;
  row.setAttribute('data-status', request.status.toLowerCase());
  var statusCell = row.querySelector('td:nth-child(6)');
  if (statusCell) {
    statusCell.innerHTML = request.status === 'Approved'
      ? '<span class="badge b-green">Approved</span>'
      : '<span class="badge b-red">Rejected</span>';
  }
  var viewLink = row.querySelector('a');
  if (viewLink) viewLink.href = request.status === 'Approved' ? 'request-approved.html' : 'request-denied.html';
  var pendingTab = document.querySelector('.ftab:nth-child(2)');
  if (pendingTab) pendingTab.textContent = 'Pending (0)';
});
