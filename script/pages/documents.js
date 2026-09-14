function filterDocs(category, btn) {
  document.querySelectorAll('.ftab').forEach(function (button) {
    button.classList.remove('active');
  });
  btn.classList.add('active');

  document.querySelectorAll('#doc-grid .doc-card').forEach(function (card) {
    card.style.display = category === 'all' || card.getAttribute('data-cat') === category ? '' : 'none';
  });
}

function searchDocs(input) {
  var query = input.value.toLowerCase();
  document.querySelectorAll('#doc-grid .doc-card').forEach(function (card) {
    var name = card.getAttribute('data-name').toLowerCase();
    card.style.display = name.includes(query) ? '' : 'none';
  });
}

function previewDoc(name) {
  alert('Opening preview: ' + name);
}
