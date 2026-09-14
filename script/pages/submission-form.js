var RES_DATA = {
  lib: { level: 'Standard', desc: 'Public academic resource — minimal approval required.' },
  lab: { level: 'Restricted', desc: 'Network lab access requires supervisor endorsement.' },
  rdb: { level: 'Restricted', desc: 'Research data — confidentiality agreement applies.' },
  rec: { level: 'Standard', desc: 'View your own academic records only.' },
  crs: { level: 'Standard', desc: 'Standard course management portal.' },
  adm: { level: 'High Security', desc: 'Administrative access — requires dean-level approval. Extended review time expected.' },
  fin: { level: 'Restricted', desc: 'Financial records — requires financial aid office review.' },
  hrm: { level: 'Classified', desc: 'HR data is classified. Only faculty personnel may be approved. Student access is rarely granted.' }
};

function onResourceChange(select) {
  var resource = RES_DATA[select.value];
  var panel = document.getElementById('res-info');
  if (resource) {
    document.getElementById('res-level').textContent = resource.level + ' Resource';
    document.getElementById('res-desc').textContent = resource.desc;
    panel.style.display = 'block';
  } else {
    panel.style.display = 'none';
  }
}

function toggleTerms() {
  var checked = document.getElementById('terms-cb').checked;
  var button = document.getElementById('submit-btn');
  button.disabled = !checked;
  button.style.opacity = checked ? '1' : '.5';
  button.style.cursor = checked ? 'pointer' : 'not-allowed';
}

function submitForm(event) {
  event.preventDefault();
  document.getElementById('success-modal').classList.add('open');
}
