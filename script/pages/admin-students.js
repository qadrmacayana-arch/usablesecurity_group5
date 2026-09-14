function filterStudents() {
  var query = document.getElementById('student-search').value.toLowerCase();
  document.querySelectorAll('#student-list tr').forEach(function (row) {
    row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
  });
}
