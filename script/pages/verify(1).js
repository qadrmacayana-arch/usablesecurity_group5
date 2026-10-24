var interval;

if (sessionStorage.getItem('secureAccessRole') !== 'verifying') {
  window.location.replace('../auth/login.php');
}

function getExpiry() {
  return Number(sessionStorage.getItem('secureAccessOtpExpires') || 0);
}

function updateTimer() {
  var remainingMs = getExpiry() - Date.now();
  var timerEl = document.getElementById('timer');
  if (remainingMs <= 0) {
    clearInterval(interval);
    timerEl.textContent = '0:00';
    return;
  }
  var seconds = Math.ceil(remainingMs / 1000);
  var minutes = Math.floor(seconds / 60);
  var remaining = seconds % 60;
  timerEl.textContent = minutes + ':' + (remaining < 10 ? '0' : '') + remaining;
}

function startTimer() {
  clearInterval(interval);
  updateTimer();
  interval = setInterval(updateTimer, 1000);
}

function otpInput(index) {
  var input = document.getElementById('otp' + index);
  input.value = input.value.replace(/\D/g, '').slice(0, 1);
  if (input.value && index < 5) document.getElementById('otp' + (index + 1)).focus();
}

function otpKey(event, index) {
  if (event.key === 'Backspace' && !document.getElementById('otp' + index).value && index > 0) {
    document.getElementById('otp' + (index - 1)).focus();
  }
}

function getOtp() {
  var otp = '';
  for (var index = 0; index < 6; index++) otp += document.getElementById('otp' + index).value;
  return otp;
}

function resendOtp() {
  sessionStorage.setItem('secureAccessOtp', '123456');
  sessionStorage.setItem('secureAccessOtpExpires', String(Date.now() + 298000));
  for (var index = 0; index < 6; index++) document.getElementById('otp' + index).value = '';
  document.getElementById('otp0').focus();
  document.getElementById('otp-error').style.display = 'none';
  document.getElementById('verify-btn').disabled = false;
  document.getElementById('vbtn-text').textContent = 'Verify Identity';
  startTimer();
}

function verifyOtp() {
  var otp = getOtp();
  var error = document.getElementById('otp-error');
  error.style.display = 'none';
  if (!/^\d{6}$/.test(otp)) {
    error.textContent = 'Please enter all 6 digits of your OTP.';
    error.style.display = 'block';
    return;
  }
  if (Date.now() >= getExpiry()) {
    error.textContent = 'Your OTP has expired. Please request a new code.';
    error.style.display = 'block';
    return;
  }
  if (otp !== sessionStorage.getItem('secureAccessOtp')) {
    error.textContent = 'Incorrect OTP. Use 123456 for this demo.';
    error.style.display = 'block';
    return;
  }
  document.getElementById('vbtn-text').textContent = 'Verifying…';
  document.getElementById('verify-btn').disabled = true;
  sessionStorage.setItem('secureAccessRole', 'otp-verified');
  setTimeout(function () { window.location.href = 'eligibility.php'; }, 900);
}

document.addEventListener('DOMContentLoaded', startTimer);

