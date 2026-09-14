var seconds = 298;
var timerEl = document.getElementById('timer');
var interval = setInterval(function () {
  seconds--;
  if (seconds <= 0) {
    clearInterval(interval);
    timerEl.textContent = '0:00';
    return;
  }
  var minutes = Math.floor(seconds / 60);
  var remaining = seconds % 60;
  timerEl.textContent = minutes + ':' + (remaining < 10 ? '0' : '') + remaining;
}, 1000);

function otpInput(index) {
  var value = document.getElementById('otp' + index).value;
  if (value && index < 5) document.getElementById('otp' + (index + 1)).focus();
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
  seconds = 298;
  for (var index = 0; index < 6; index++) document.getElementById('otp' + index).value = '';
  document.getElementById('otp0').focus();
  document.getElementById('otp-error').style.display = 'none';
}

function verifyOtp() {
  var otp = getOtp();
  var error = document.getElementById('otp-error');
  error.style.display = 'none';
  if (otp.length < 6) {
    error.textContent = 'Please enter all 6 digits of your OTP.';
    error.style.display = 'block';
    return;
  }
  document.getElementById('vbtn-text').textContent = 'Verifying…';
  document.getElementById('verify-btn').disabled = true;
  setTimeout(function () {
    window.location.href = 'eligibility.html';
  }, 900);
}
