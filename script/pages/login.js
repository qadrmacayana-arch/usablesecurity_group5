var pwVisible = false;

function togglePw() {
  pwVisible = !pwVisible;
  document.getElementById('password').type = pwVisible ? 'text' : 'password';
}

function handleLogin(event) {
  event.preventDefault();
  var id = document.getElementById('student-id').value.trim();
  var password = document.getElementById('password').value;
  var error = document.getElementById('login-error');
  error.style.display = 'none';

  if (!id || !password) {
    error.textContent = 'Please enter your Student ID and password.';
    error.style.display = 'block';
    return;
  }

  var button = document.getElementById('login-btn');
  document.getElementById('btn-text').textContent = 'Signing in…';
  document.getElementById('btn-spin').style.display = 'inline-block';
  button.disabled = true;

  setTimeout(function () {
    if (id.toUpperCase() === 'ADMIN-001' || id.toLowerCase() === 'admin') {
      window.location.href = 'admin-dashboard.html';
      return;
    }
    window.location.href = 'verify.html';
  }, 1200);
}
