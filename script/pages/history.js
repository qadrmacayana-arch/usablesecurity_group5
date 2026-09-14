var currentFilter = 'all';
var currentYear = '';

function apply() {
  document.querySelectorAll('#hist-tbody tr').forEach(function (row) {
    var status = row.getAttribute('data-status');
    var year = row.getAttribute('data-year');
    var show = (currentFilter === 'all' || status === currentFilter) && (!currentYear || year === currentYear);
    row.style.display = show ? '' : 'none';
  });
}

function filterHist(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.ftab').forEach(function (button) {
    button.classList.remove('active');
  });
  btn.classList.add('active');
  apply();
}

function filterYear(select) {
  currentYear = select.value;
  apply();
}
