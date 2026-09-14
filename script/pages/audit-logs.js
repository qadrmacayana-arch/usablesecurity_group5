function filterLogs() {
  var category = document.getElementById('log-filter').value;
  document.querySelectorAll('#audit-tbody tr').forEach(function (row) {
    row.style.display = !category || row.getAttribute('data-cat') === category ? '' : 'none';
  });
}

function exportLogs() {
  alert('Audit log export initiated. You will receive a download link via email.');
}
