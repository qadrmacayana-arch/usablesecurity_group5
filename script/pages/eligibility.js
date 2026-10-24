(function () {
  'use strict';

  function setCheck(index, state, message) {
    var row = document.getElementById('e' + index);
    var icon = document.getElementById('e' + index + '-icon');
    var detail = document.getElementById('e' + index + '-sub');
    row.style.opacity = '1';
    detail.textContent = message;
    detail.style.color = state === 'passed' ? 'var(--c-green)' : 'var(--c-amber)';
    icon.className = '';
    icon.style.cssText = 'width:20px;height:20px;flex-shrink:0;';
    icon.innerHTML = state === 'passed'
      ? '<svg width="20" height="20" fill="none" stroke="#34d399" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>'
      : '<span aria-hidden="true" style="color:var(--c-amber);font-weight:700;">!</span>';
  }

  async function checkProfile() {
    if (sessionStorage.getItem('secureAccessRole') !== 'otp-verified') {
      window.location.replace('../auth/login.php');
      return;
    }

    try {
      var supabase = await window.secureAccessSupabaseReady;
      var authResult = await supabase.auth.getSession();
      if (authResult.error) throw authResult.error;
      var session = authResult.data.session;
      if (!session || !session.user) {
        window.location.replace('../api/logout.php');
        return;
      }

      var result = await supabase
        .from('profiles')
        .select('id, role, account_active, program, year_level, clearance_level')
        .eq('id', session.user.id)
        .single();
      if (result.error) throw result.error;

      var profile = result.data;
      if (profile.role !== 'student' || !profile.account_active) {
        window.location.replace('../api/logout.php');
        return;
      }

      setCheck(0, 'passed', 'Active student account confirmed.');
      setCheck(1, 'passed', 'Student role confirmed.');
      setCheck(
        2,
        profile.program || profile.year_level ? 'passed' : 'notice',
        profile.program || profile.year_level
          ? [profile.program, profile.year_level ? 'Year ' + profile.year_level : ''].filter(Boolean).join(' · ')
          : 'Academic details are not available in this profile.'
      );
      setCheck(
        3,
        Number.isInteger(profile.clearance_level) && profile.clearance_level >= 1
          ? 'passed'
          : 'notice',
        Number.isInteger(profile.clearance_level)
          ? 'Clearance level ' + profile.clearance_level + ' is on file; each resource has its own minimum.'
          : 'No valid clearance level is recorded.'
      );

      var resultBox = document.getElementById('result');
      resultBox.style.display = 'block';
      resultBox.querySelector('p:first-child').textContent = 'Profile checks complete';
      resultBox.querySelector('p:last-child').textContent =
        'Enrollment and official academic standing are not connected to an external student-information system.';
      sessionStorage.setItem('secureAccessEligible', 'true');
      sessionStorage.setItem('secureAccessVerification', JSON.stringify({
        identityVerified: true,
        accountActive: true,
        studentRoleVerified: true,
        academicProfileAvailable: Boolean(profile.program || profile.year_level),
        securityClearanceVerified: Number.isInteger(profile.clearance_level)
      }));

      window.setTimeout(function () {
        window.location.href = 'dashboard.php';
      }, 1800);
    } catch (error) {
      console.error('Unable to verify student profile:', error);
      var resultBox = document.getElementById('result');
      resultBox.style.display = 'block';
      resultBox.querySelector('p:first-child').textContent = 'Profile checks could not be completed';
      resultBox.querySelector('p:last-child').textContent =
        error.message || 'Please try again or contact your administrator.';
      resultBox.style.borderColor = 'rgba(248,113,113,.35)';
      resultBox.querySelector('p:first-child').style.color = 'var(--c-red)';
      document.querySelector('.btn.btn-ghost').textContent = 'Return to Sign In';
    }
  }

  checkProfile();
})();
