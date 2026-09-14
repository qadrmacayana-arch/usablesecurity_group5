var revokeTarget = '';

function openRevoke(name) {
  revokeTarget = name;
  document.getElementById('revoke-name').textContent = name;
  document.getElementById('revoke-modal').classList.add('open');
}

function closeRevoke() {
  document.getElementById('revoke-modal').classList.remove('open');
}

function confirmRevoke() {
  closeRevoke();
  alert(revokeTarget + ' access has been revoked.');
}
