(function () {
  'use strict';

  function getClient() {
    return window.secureAccessSupabase;
  }

  function showError(message) {
    var errorBox = document.getElementById('login-error');

    if (errorBox) {
      errorBox.textContent = message;
      errorBox.style.display = 'block';
    }
  }

  function clearError() {
    var errorBox = document.getElementById('login-error');

    if (errorBox) {
      errorBox.textContent = '';
      errorBox.style.display = 'none';
    }
  }

  function setLoading(isLoading) {
    var button = document.getElementById('login-btn');
    var text = document.getElementById('btn-text');
    var spinner = document.getElementById('btn-spin');

    if (button) {
      button.disabled = isLoading;
    }

    if (text) {
      text.textContent = isLoading
        ? 'Signing in...'
        : 'Continue securely';
    }

    if (spinner) {
      spinner.style.display = isLoading ? 'inline-block' : 'none';
    }
  }

  window.togglePw = function () {
    var password = document.getElementById('password');
    var eye = document.getElementById('pw-eye');

    if (!password) return;

    if (password.type === 'password') {
      password.type = 'text';

      if (eye) {
        eye.setAttribute('aria-label', 'Hide password');
      }
    } else {
      password.type = 'password';

      if (eye) {
        eye.setAttribute('aria-label', 'Show password');
      }
    }
  };

  window.handleLogin = async function (event) {
    event.preventDefault();

    clearError();

    var emailInput = document.getElementById('login-email');
    var passwordInput = document.getElementById('password');

    var email = String(emailInput ? emailInput.value : '').trim().toLowerCase();
    var password = passwordInput ? passwordInput.value : '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('Enter a valid university email address.');
      return;
    }

    if (!password) {
      showError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      await window.secureAccessSupabaseReady;

      var client = getClient();

      if (!client) {
        throw new Error('Supabase client is not available.');
      }

      // Authenticate with Supabase Auth.
      var signIn = await client.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (signIn.error) {
        console.error('Sign-in error:', signIn.error);
        showError('Email or password is incorrect.');
        setLoading(false);
        return;
      }

      var user = signIn.data.user;
      var authSession = signIn.data.session;

      if (!user || !authSession || !authSession.access_token) {
        throw new Error('No authenticated user was returned.');
      }

      // Get the application profile.
      var profileResult = await client
        .from('profiles')
        .select(
          'id, student_id, staff_id, full_name, email, role, account_active'
        )
        .eq('id', user.id)
        .single();

      if (profileResult.error) {
        console.error('Profile lookup error:', profileResult.error);

        await client.auth.signOut();

        throw new Error('Unable to load your account profile.');
      }

      var profile = profileResult.data;

      if (!profile.account_active) {
        await client.auth.signOut();
        showError('This account is currently inactive.');
        setLoading(false);
        return;
      }

      if (profile.role === 'student') {
        sessionStorage.setItem('secureAccessPendingUserId', profile.id);
        sessionStorage.setItem('secureAccessPendingEmail', profile.email || email);
        sessionStorage.setItem('secureAccessRole', 'verifying');

        var otpResponse = await fetch('../api/demo-otp.php', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'issue',
            new_login: true,
            access_token: authSession.access_token
          })
        });
        var otpData = await otpResponse.json();
        if (!otpResponse.ok || !otpData.ok) {
          sessionStorage.removeItem('secureAccessPendingUserId');
          sessionStorage.removeItem('secureAccessPendingEmail');
          sessionStorage.removeItem('secureAccessRole');
          await client.auth.signOut();
          throw new Error(otpData.message || 'Unable to create a demo verification code.');
        }
        sessionStorage.setItem('secureAccessDemoOtp', otpData.code);
        sessionStorage.setItem('secureAccessDemoOtpExpiresAt', otpData.expires_at);

        window.location.href = '../student/verify.php';
        return;
      }

      // Staff establish their server-side session immediately after password authentication.
      var serverSession = await fetch('../api/create-session.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: authSession.access_token })
      });
      var serverData = await serverSession.json();

      if (!serverSession.ok || !serverData.ok) {
        await client.auth.signOut();
        throw new Error(serverData.message || 'Unable to establish the secure server session.');
      }

      // Save common session information.
      sessionStorage.setItem(
        'secureAccessUserId',
        profile.id
      );

      sessionStorage.setItem(
        'secureAccessRole',
        profile.role
      );

      sessionStorage.setItem(
        'secureAccessStudentId',
        profile.student_id || ''
      );

      sessionStorage.setItem(
        'secureAccessStaffId',
        profile.staff_id || ''
      );

      sessionStorage.setItem(
        'secureAccessName',
        profile.full_name || ''
      );

      // Administrator → Admin Dashboard
      if (
        profile.role === 'administrator' ||
        profile.role === 'admin'
      ) {
        window.location.href = '../admin/admin-dashboard.php';
        return;
      }

      if (profile.role === 'teacher') {
        window.location.href = '../personnel/dashboard.php';
        return;
      }

      await client.auth.signOut();
      showError('This account does not have access to this portal.');
      setLoading(false);

    } catch (error) {
      console.error('LOGIN ERROR:', error);

      showError(
        error && error.message
          ? error.message
          : 'Unable to sign in. Please try again.'
      );

      setLoading(false);
    }
  };

})();