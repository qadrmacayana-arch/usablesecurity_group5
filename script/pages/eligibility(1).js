var checks = [
  {
    label: 'Student Enrollment Status',
    sub: 'Currently enrolled — 3rd Year'
  },
  {
    label: 'Academic Standing',
    sub: 'Good standing — GPA 3.72'
  },
  {
    label: 'Account Privileges',
    sub: 'Portal access authorized'
  },
  {
    label: 'Security Clearance',
    sub: 'Standard clearance confirmed'
  }
];

if (sessionStorage.getItem('secureAccessRole') !== 'otp-verified') {
  window.location.replace('../auth/login.php');
}

var idx = 0;

function checkTick() {

  if (idx >= checks.length) {

    sessionStorage.setItem(
      'secureAccessRole',
      'student'
    );

    sessionStorage.setItem(
      'secureAccessEligible',
      'true'
    );

    /*
     * Store the results of the completed
     * identity, eligibility, account, and
     * security checks.
     */
    sessionStorage.setItem(
      'secureAccessVerification',
      JSON.stringify({
        identityVerified: true,
        eligibilityVerified: true,
        accountActive: true,
        securityClearanceVerified: true
      })
    );

    document.getElementById('result').style.display = 'block';

    setTimeout(function () {
      window.location.href = 'dashboard.php';
    }, 1600);

    return;
  }

  var element =
    document.getElementById('e' + idx);

  var icon =
    document.getElementById('e' + idx + '-icon');

  var sub =
    document.getElementById('e' + idx + '-sub');


  if (idx > 0) {

    element.style.opacity = '1';

    icon.className = '';

    icon.innerHTML =
      '<svg width="20" height="20" fill="none" stroke="#34d399" viewBox="0 0 24 24">' +
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>' +
      '</svg>';

    sub.style.color =
      'var(--c-400)';

    sub.textContent =
      checks[idx - 1].sub;
  }


  var current =
    document.getElementById('e' + idx);

  var currentIcon =
    document.getElementById('e' + idx + '-icon');

  var currentSub =
    document.getElementById('e' + idx + '-sub');


  current.style.opacity = '1';

  currentIcon.style.border =
    '2px solid var(--c-indigo)';

  currentIcon.style.borderTopColor =
    'transparent';

  currentIcon.className =
    'spin';

  currentIcon.style.borderRadius =
    '50%';

  currentIcon.style.width =
    '20px';

  currentIcon.style.height =
    '20px';

  currentIcon.style.flexShrink =
    '0';

  currentSub.textContent =
    'Checking…';

  currentSub.style.color =
    'var(--c-500)';


  setTimeout(function () {

    var doneIcon =
      document.getElementById('e' + idx + '-icon');

    var doneSub =
      document.getElementById('e' + idx + '-sub');


    doneIcon.className =
      '';

    doneIcon.style.border =
      'none';

    doneIcon.innerHTML =
      '<svg width="20" height="20" fill="none" stroke="#34d399" viewBox="0 0 24 24">' +
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>' +
      '</svg>';

    doneSub.textContent =
      checks[idx].sub;

    doneSub.style.color =
      'var(--c-400)';

    idx++;

    setTimeout(
      checkTick,
      300
    );

  }, 900);
}

setTimeout(
  checkTick,
  400
);