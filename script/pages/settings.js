function showTab(id, btn) {
  document.querySelectorAll('.tab-panel').forEach(function (panel) {
    panel.style.display = 'none';
  });
  document.getElementById('tab-' + id).style.display = 'block';
  document.querySelectorAll('.stab').forEach(function (button) {
    button.classList.remove('active');
  });
  btn.classList.add('active');
}
