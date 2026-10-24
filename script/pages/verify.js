(function () {
  'use strict';

  var verifyButton = document.getElementById('verify-btn');
  var resendButton = document.getElementById('resend-btn');
  var error = document.getElementById('otp-error');
  var emailLabel = document.getElementById('otp-email');
  var status = document.getElementById('otp-status');
  var codeDialog = document.getElementById('demo-otp-dialog');
  var codeDisplay = document.getElementById('demo-otp-code');
  var expiryDisplay = document.getElementById('demo-otp-expiry');
  var expiryTimer;

  function showError(message) {
    error.textContent = message;
    error.style.display = 'block';
  }

  function clearError() {
    error.textContent = '';
    error.style.display = 'none';
  }

  function setBusy(busy) {
    verifyButton.disabled = busy;
    resendButton.disabled = busy;
    document.getElementById('vbtn-text').textContent =
      busy ? 'Verifying…' : 'Verify Identity';
  }

  function maskedEmail(email) {
    var parts = String(email || '').split('@');
    if (parts.length !== 2) return 'your demo account';
    return parts[0].slice(0, 1) + '***@' + parts[1];
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
    for (var index = 0; index < 6; index += 1) {
      otp += document.getElementById('otp' + index).value;
    }
    return otp;
  }

  function displayCode(code, expiresAt) {
    codeDisplay.textContent = code;
    codeDialog.hidden = false;
    clearInterval(expiryTimer);

    function updateExpiry() {
      var remaining = Math.max(0, Number(expiresAt) - Math.floor(Date.now() / 1000));
      var minutes = Math.floor(remaining / 60);
      var seconds = remaining % 60;
      expiryDisplay.textContent = remaining
        ? 'Expires in ' + minutes + ':' + String(seconds).padStart(2, '0')
        : 'Expired — request a new code';
    }

    updateExpiry();
    expiryTimer = setInterval(updateExpiry, 1000);
  }

  function loadSavedCode() {
    var code = sessionStorage.getItem('secureAccessDemoOtp');
    var expiresAt = sessionStorage.getItem('secureAccessDemoOtpExpiresAt');
    if (code && expiresAt) displayCode(code, expiresAt);
  }

  async function sendOtp() {
    clearError();
    resendButton.disabled = true;
    status.textContent = 'Creating a new local demo code…';

    try {
      var supabase = await window.secureAccessSupabaseReady;
      var sessionResult = await supabase.auth.getSession();
      if (sessionResult.error) throw sessionResult.error;
      var session = sessionResult.data.session;
      if (!session || !session.access_token) {
        throw new Error('Your sign-in expired. Please sign in again.');
      }

      var response = await fetch('../api/demo-otp.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'issue',
          access_token: session.access_token
        })
      });
      var result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.message || 'Unable to create a new demo code.');
      }

      sessionStorage.setItem('secureAccessDemoOtp', result.code);
      sessionStorage.setItem('secureAccessDemoOtpExpiresAt', String(result.expires_at));
      displayCode(result.code, result.expires_at);
      for (var index = 0; index < 6; index += 1) {
        document.getElementById('otp' + index).value = '';
      }
      status.textContent = 'Use the code shown in the demo popup.';
    } catch (sendError) {
      console.error('Unable to issue local demo OTP:', sendError);
      status.textContent = '';
      showError(sendError.message || 'Unable to create a demo code. Please try again.');
    } finally {
      resendButton.disabled = false;
    }
  }

  async function verifyOtp() {
    clearError();
    var code = getOtp();
    if (!/^\d{6}$/.test(code)) {
      showError('Please enter all 6 digits of the code.');
      return;
    }

    setBusy(true);
    try {
      var supabase = await window.secureAccessSupabaseReady;
      var sessionResult = await supabase.auth.getSession();
      if (sessionResult.error) throw sessionResult.error;
      var session = sessionResult.data.session;
      if (!session || !session.access_token) {
        throw new Error('Your sign-in expired. Please sign in again.');
      }

      var response = await fetch('../api/demo-otp.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          code: code,
          access_token: session.access_token
        })
      });
      var result = await response.json();
      if (!response.ok || !result.ok) {
        if (response.status === 401 || response.status === 410 || response.status === 429) {
          sessionStorage.removeItem('secureAccessDemoOtp');
          sessionStorage.removeItem('secureAccessDemoOtpExpiresAt');
          codeDialog.hidden = true;
        }
        throw new Error(result.message || 'The code could not be verified.');
      }

      sessionStorage.setItem('secureAccessRole', 'otp-verified');
      sessionStorage.removeItem('secureAccessPendingUserId');
      sessionStorage.removeItem('secureAccessPendingEmail');
      sessionStorage.removeItem('secureAccessDemoOtp');
      sessionStorage.removeItem('secureAccessDemoOtpExpiresAt');
      window.location.href = 'eligibility.php';
    } catch (verificationError) {
      console.error('Demo identity verification failed:', verificationError);
      showError(verificationError.message || 'The code could not be verified. Try again.');
      setBusy(false);
    }
  }

  document.getElementById('demo-otp-use').addEventListener('click', function () {
    var code = codeDisplay.textContent;
    for (var index = 0; index < 6; index += 1) {
      document.getElementById('otp' + index).value = code.charAt(index);
    }
    codeDialog.hidden = true;
    document.getElementById('otp0').focus();
  });

  window.otpInput = otpInput;
  window.otpKey = otpKey;
  window.resendOtp = sendOtp;
  window.verifyOtp = verifyOtp;

  if (sessionStorage.getItem('secureAccessRole') !== 'verifying') {
    window.location.replace('../auth/login.php');
    return;
  }

  emailLabel.textContent = maskedEmail(sessionStorage.getItem('secureAccessPendingEmail'));
  status.textContent = 'This local demo code is valid for 5 minutes and can be used once.';
  loadSavedCode();
})();
