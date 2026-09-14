function filterAccess() {
  var value = document.getElementById('access-filter').value;
  document.querySelectorAll('#access-list tr').forEach(function (row) {
    row.style.display = !value || row.getAttribute('data-status') === value ? '' : 'none';
  });
}
