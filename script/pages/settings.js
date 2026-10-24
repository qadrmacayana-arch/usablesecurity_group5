var SETTINGS_KEY =
  'secureAccessSettings';

var PROFILE_KEY =
  'secureAccessProfile';


/*
 * =========================================================
 * SAFE JSON READER
 * =========================================================
 */

function readSettingsObject(key) {

  var saved =
    localStorage.getItem(key);

  if (!saved) {
    return {};
  }

  try {

    var data =
      JSON.parse(saved);

    if (
      data &&
      typeof data === 'object'
    ) {

      return data;

    }

  } catch (error) {

    console.warn(
      'Invalid stored settings:',
      error
    );

  }

  return {};

}


/*
 * =========================================================
 * SAVE SETTINGS
 * =========================================================
 */

function saveSettings(data) {

  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify(data)
  );

}


/*
 * =========================================================
 * GET CURRENT STUDENT
 * =========================================================
 */

function getCurrentStudentId() {

  return String(
    sessionStorage.getItem(
      'secureAccessStudentId'
    ) || ''
  ).toUpperCase();

}


/*
 * =========================================================
 * GET CURRENT REQUEST
 * =========================================================
 */

function getCurrentRequest() {

  var saved =
    localStorage.getItem(
      'secureAccessAdminRequest'
    );

  if (!saved) {
    return null;
  }

  try {

    var request =
      JSON.parse(saved);

    if (!request) {
      return null;
    }

    var currentStudent =
      getCurrentStudentId();

    var requestStudent =
      String(
        request.studentId || ''
      ).toUpperCase();

    if (
      currentStudent &&
      requestStudent &&
      currentStudent !== requestStudent
    ) {

      return null;

    }

    return request;

  } catch (error) {

    return null;

  }

}


/*
 * =========================================================
 * GET SUPABASE CLIENT
 * =========================================================
 */

async function getSupabaseClient() {

  try {

    if (
      window.secureAccessSupabaseReady
    ) {

      return await
        window.secureAccessSupabaseReady;

    }

    if (
      window.secureAccessSupabase
    ) {

      return window.secureAccessSupabase;

    }

  } catch (error) {

    console.error(
      'Unable to initialize Supabase:',
      error
    );

  }

  return null;

}


/*
 * =========================================================
 * GET AUTHENTICATED USER
 * =========================================================
 */

async function getAuthenticatedUser() {

  var supabase =
    await getSupabaseClient();

  if (!supabase) {
    return null;
  }

  try {

    var result =
      await supabase.auth.getUser();

    if (
      result &&
      result.data &&
      result.data.user
    ) {

      return result.data.user;

    }

  } catch (error) {

    console.error(
      'Unable to get authenticated user:',
      error
    );

  }

  return null;

}


async function getStudentEmail() {
  var user =
    await getAuthenticatedUser();

  return user && user.email ? user.email : '';
}


/*
 * =========================================================
 * NAME HELPERS
 * =========================================================
 */

function splitStudentName(name) {

  var parts =
    String(
      name || ''
    )
      .trim()
      .split(/\s+/)
      .filter(
        function (part) {
          return part !== '';
        }
      );

  if (!parts.length) {

    return {
      firstName: '',
      middleName: '',
      surname: ''
    };

  }

  if (parts.length === 1) {

    return {
      firstName: parts[0],
      middleName: '',
      surname: ''
    };

  }

  if (parts.length === 2) {

    return {
      firstName: parts[0],
      middleName: '',
      surname: parts[1]
    };

  }

  return {

    firstName:
      parts[0],

    middleName:
      parts.slice(
        1,
        parts.length - 1
      ).join(' '),

    surname:
      parts[
        parts.length - 1
      ]

  };

}


/*
 * =========================================================
 * BUILD NAME
 * =========================================================
 */

function buildFullName(profile) {

  var parts = [];

  if (profile.firstName) {

    parts.push(
      profile.firstName
    );

  }

  if (profile.middleName) {

    parts.push(
      profile.middleName
    );

  }

  if (profile.surname) {

    parts.push(
      profile.surname
    );

  }

  if (profile.suffix) {

    parts.push(
      profile.suffix
    );

  }

  return parts.join(' ');

}


/*
 * =========================================================
 * INITIALS
 * =========================================================
 */

function getInitials(name) {

  var parts =
    String(
      name || ''
    )
      .trim()
      .split(/\s+/)
      .filter(
        function (part) {
          return part !== '';
        }
      );

  if (!parts.length) {
    return '—';
  }

  var initials =
    parts[0]
      .charAt(0)
      .toUpperCase();

  if (parts.length > 1) {

    initials +=
      parts[
        parts.length - 1
      ]
        .charAt(0)
        .toUpperCase();

  }

  return initials;

}


/*
 * =========================================================
 * LOAD PROFILE
 * =========================================================
 */

async function loadProfile() {

  var savedProfile =
    readSettingsObject(
      PROFILE_KEY
    );


  var request =
    getCurrentRequest();


  /*
   * Always try to obtain the actual authenticated
   * email from Supabase.
   */
  var authEmail =
    await getStudentEmail();


  /*
   * If a local profile exists, preserve its
   * editable information while replacing the
   * email with the real authenticated email.
   */
  if (
    savedProfile &&
    (
      savedProfile.firstName ||
      savedProfile.surname ||
      savedProfile.middleName ||
      savedProfile.phone
    )
  ) {

    return {

      firstName:
        savedProfile.firstName ||
        '',

      middleName:
        savedProfile.middleName ||
        '',

      surname:
        savedProfile.surname ||
        '',

      suffix:
        savedProfile.suffix ||
        '',

      email:
        authEmail ||
        savedProfile.email ||
        '',

      phone:
        savedProfile.phone ||
        '',

      studentId:
        savedProfile.studentId ||
        getCurrentStudentId(),

      program:
        savedProfile.program ||
        '',

      year:
        savedProfile.year ||
        ''

    };

  }


  /*
   * If a current request exists, use it as
   * a fallback for profile information.
   */
  if (request) {

    var name =
      splitStudentName(
        request.student
      );

    return {

      firstName:
        name.firstName,

      middleName:
        name.middleName,

      surname:
        name.surname,

      suffix:
        '',

      email:
        authEmail ||
        request.email ||
        '',

      phone:
        request.phone ||
        '',

      studentId:
        request.studentId ||
        getCurrentStudentId(),

      program:
        request.course ||
        request.program ||
        '',

      year:
        request.year ||
        ''

    };

  }


  /*
   * Final fallback.
   */
  return {

    firstName: '',

    middleName: '',

    surname: '',

    suffix: '',

    email:
      authEmail,

    phone: '',

    studentId:
      getCurrentStudentId(),

    program: '',

    year: ''

  };

}


/*
 * =========================================================
 * RENDER PROFILE
 * =========================================================
 */

async function renderProfile() {

  var profile =
    await loadProfile();


  var fullName =
    buildFullName(
      profile
    );


  var displayName =
    fullName ||
    'Profile information unavailable';


  var avatar =
    document.getElementById(
      'profile-avatar'
    );


  var display =
    document.getElementById(
      'profile-display-name'
    );


  var program =
    document.getElementById(
      'profile-program'
    );


  var studentId =
    document.getElementById(
      'profile-student-id'
    );


  if (avatar) {

    avatar.textContent =
      getInitials(
        fullName
      );

  }


  if (display) {

    display.textContent =
      displayName;

  }


  if (program) {

    var programParts = [];


    if (profile.year) {

      programParts.push(
        profile.year
      );

    }


    if (profile.program) {

      programParts.push(
        profile.program
      );

    }


    program.textContent =
      programParts.length
        ? programParts.join(' • ')
        : 'Program information unavailable';

  }


  if (studentId) {

    studentId.textContent =
      profile.studentId ||
      'Student ID unavailable';

  }


  setInputValue(
    'profile-first-name',
    profile.firstName
  );


  setInputValue(
    'profile-surname',
    profile.surname
  );


  setInputValue(
    'profile-middle-name',
    profile.middleName
  );


  setInputValue(
    'profile-suffix',
    profile.suffix
  );


  setInputValue(
    'profile-email',
    profile.email
  );


  setInputValue(
    'profile-phone',
    profile.phone
  );

}


/*
 * =========================================================
 * SET INPUT VALUE
 * =========================================================
 */

function setInputValue(
  id,
  value
) {

  var element =
    document.getElementById(
      id
    );

  if (element) {

    element.value =
      value || '';

  }

}


/*
 * =========================================================
 * SAVE PROFILE
 * =========================================================
 */

async function saveProfile() {

  var oldProfile =
    await loadProfile();


  var profile = {

    firstName:
      getInputValue(
        'profile-first-name'
      ),

    surname:
      getInputValue(
        'profile-surname'
      ),

    middleName:
      getInputValue(
        'profile-middle-name'
      ),

    suffix:
      getInputValue(
        'profile-suffix'
      ),

    email:
      oldProfile.email ||
      getInputValue(
        'profile-email'
      ),

    phone:
      getInputValue(
        'profile-phone'
      ),

    studentId:
      oldProfile.studentId ||
      getCurrentStudentId(),

    program:
      oldProfile.program ||
      '',

    year:
      oldProfile.year ||
      ''

  };


  localStorage.setItem(
    PROFILE_KEY,
    JSON.stringify(
      profile
    )
  );


  await renderProfile();


  showProfileMessage(
    'Profile changes saved.',
    true
  );

}


/*
 * =========================================================
 * RESET PROFILE FORM
 * =========================================================
 */

async function resetProfileForm() {

  await renderProfile();


  showProfileMessage(
    '',
    true
  );

}


/*
 * =========================================================
 * INPUT HELPER
 * =========================================================
 */

function getInputValue(id) {

  var element =
    document.getElementById(
      id
    );

  return element
    ? element.value.trim()
    : '';

}


/*
 * =========================================================
 * PROFILE MESSAGE
 * =========================================================
 */

function showProfileMessage(
  message,
  success
) {

  var element =
    document.getElementById(
      'profile-message'
    );

  if (!element) {
    return;
  }


  if (!message) {

    element.style.display =
      'none';

    element.textContent =
      '';

    return;

  }


  element.style.display =
    'block';


  element.style.color =
    success
      ? 'var(--c-green)'
      : 'var(--c-red)';


  element.textContent =
    message;

}


/*
 * =========================================================
 * SHOW TAB
 * =========================================================
 */

function showTab(
  id,
  btn
) {

  document
    .querySelectorAll(
      '.tab-panel'
    )
    .forEach(
      function (panel) {

        panel.style.display =
          'none';

      }
    );


  var selected =
    document.getElementById(
      'tab-' + id
    );


  if (selected) {

    selected.style.display =
      'block';

  }


  document
    .querySelectorAll(
      '.stab'
    )
    .forEach(
      function (button) {

        button.classList.remove(
          'active'
        );

      }
    );


  if (btn) {

    btn.classList.add(
      'active'
    );

  }

}


/*
 * =========================================================
 * PASSWORD UPDATE
 * =========================================================
 *
 * This now performs a REAL Supabase Auth password change.
 *
 * Process:
 * 1. Validate the fields.
 * 2. Get the student's registered email.
 * 3. Re-authenticate using the current password.
 * 4. Update the Supabase Auth password.
 * 5. Clear the password fields.
 *
 * =========================================================
 */

async function updatePassword() {
  var currentPassword = document.getElementById('current-password').value.trim();
  var newPassword = document.getElementById('new-password').value;
  var confirmPassword = document.getElementById('confirm-password').value;
  var button = document.querySelector('[onclick="updatePassword()"]');

  clearPasswordMessage();

  // Basic validation
  if (!currentPassword || !newPassword || !confirmPassword) {
    showPasswordMessage('Please complete all password fields.', 'var(--c-red)');
    return;
  }

  if (newPassword.length < 8) {
    showPasswordMessage(
      'New password must be at least 8 characters long.',
      'var(--c-red)'
    );
    return;
  }

  if (newPassword !== confirmPassword) {
    showPasswordMessage(
      'New password and confirmation password do not match.',
      'var(--c-red)'
    );
    return;
  }

  if (currentPassword === newPassword) {
    showPasswordMessage(
      'Your new password must be different from your current password.',
      'var(--c-red)'
    );
    return;
  }

  try {
    if (button) {
      button.disabled = true;
      button.dataset.originalText = button.textContent;
      button.textContent = 'Updating...';
    }

    var supabase = await getSupabaseClient();

    if (!supabase) {
      throw new Error('Supabase client is not available.');
    }

    // Get the student's registered email
    var email = await getStudentEmail();

    if (!email) {
      throw new Error('Unable to determine your registered email address.');
    }

    /*
     * Step 1:
     * Re-authenticate using the current password.
     * This verifies that the current password is correct.
     */
    var loginResult = await supabase.auth.signInWithPassword({
      email: email,
      password: currentPassword
    });

    if (loginResult.error) {
      console.error('Password verification failed:', loginResult.error);

      showPasswordMessage(
        'Current password is incorrect.',
        'var(--c-red)'
      );
      return;
    }

    /*
     * Step 2:
     * Make sure Supabase actually returned an authentication session.
     */
    var loginSession =
      loginResult.data && loginResult.data.session
        ? loginResult.data.session
        : null;

    if (
      !loginSession ||
      !loginSession.access_token ||
      !loginSession.refresh_token
    ) {
      throw new Error(
        'Supabase authentication succeeded but no session was returned.'
      );
    }

    /*
     * Step 3:
     * Explicitly place the returned session into the Supabase client.
     * This prevents updateUser() from running with a missing session.
     */
    var sessionResult = await supabase.auth.setSession({
      access_token: loginSession.access_token,
      refresh_token: loginSession.refresh_token
    });

    if (sessionResult.error) {
      throw sessionResult.error;
    }

    /*
     * Step 4:
     * Confirm that the client now has an active session.
     */
    var verifiedSession = await supabase.auth.getSession();

    if (
      !verifiedSession.data ||
      !verifiedSession.data.session
    ) {
      throw new Error(
        'Authentication session could not be established.'
      );
    }

    /*
     * Step 5:
     * Now update the password.
     */
    var updateResult = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateResult.error) {
      throw updateResult.error;
    }

    /*
     * Step 6:
     * Success
     */
    showPasswordMessage(
      'Password updated successfully.',
      'var(--c-green)'
    );

    // Clear password fields
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';

    // Store only the timestamp locally.
    // Never store the actual password.
    localStorage.setItem(
      'passwordChangedAt',
      new Date().toISOString()
    );

  } catch (error) {
    console.error('Password update failed:', error);

    var message = 'Unable to update your password. Please try again.';

    if (error && error.message) {
      if (
        error.message.toLowerCase().includes('session')
      ) {
        message =
          'Your authentication session could not be established. Please sign in again and try changing your password.';
      } else if (
        error.message.toLowerCase().includes('same password')
      ) {
        message =
          'Your new password must be different from your current password.';
      }
    }

    showPasswordMessage(message, 'var(--c-red)');

  } finally {
    if (button) {
      button.disabled = false;
      button.textContent =
        button.dataset.originalText || 'Update Password';
    }
  }
}

function showPasswordMessage(text, color) {
  var element = document.getElementById('password-message');

  if (!element) return;

  element.style.display = 'block';
  element.style.color = color || 'var(--c-red)';
  element.textContent = text;
}

function clearPasswordMessage() {
  var element = document.getElementById('password-message');

  if (!element) return;

  element.style.display = 'none';
  element.textContent = '';
}
/*
 * =========================================================
 * SECURITY SETTINGS
 * =========================================================
 */

async function loadSecuritySettings() {

  var settings =
    readSettingsObject(
      SETTINGS_KEY
    );


  var emailOtp =
    settings.emailOtpEnabled;


  if (
    emailOtp === undefined
  ) {

    emailOtp =
      true;

  }


  setCheckbox(
    'email-otp-toggle',
    emailOtp
  );


  setCheckbox(
    'authenticator-toggle',
    settings.authenticatorEnabled === true
  );


  updateOtpStatus(
    emailOtp
  );


  var profile =
    await loadProfile();


  var otpDescription =
    document.getElementById(
      'otp-description'
    );


  if (otpDescription) {

    if (profile.email) {

      otpDescription.textContent =
        'OTP codes are used during account verification for your registered email address.';

    } else {

      otpDescription.textContent =
        'OTP codes are used during account verification.';

    }

  }

}


/*
 * =========================================================
 * SAVE SECURITY SETTINGS
 * =========================================================
 */

function saveSecuritySettings() {

  var settings =
    readSettingsObject(
      SETTINGS_KEY
    );


  var emailOtp =
    getCheckbox(
      'email-otp-toggle'
    );


  var authenticator =
    getCheckbox(
      'authenticator-toggle'
    );


  /*
   * At least one 2FA method must remain enabled.
   */
  if (
    !emailOtp &&
    !authenticator
  ) {

    setCheckbox(
      'email-otp-toggle',
      true
    );


    emailOtp =
      true;


    showSecurityMessage(
      'At least one two-factor authentication method must remain enabled.'
    );

  } else {

    clearSecurityMessage();

  }


  settings.emailOtpEnabled =
    emailOtp;


  settings.authenticatorEnabled =
    authenticator;


  saveSettings(
    settings
  );


  updateOtpStatus(
    emailOtp
  );

}


/*
 * =========================================================
 * OTP STATUS
 * =========================================================
 */

function updateOtpStatus(
  enabled
) {

  var status =
    document.getElementById(
      'otp-status'
    );


  if (!status) {
    return;
  }


  status.textContent =
    enabled
      ? '(Active)'
      : '(Inactive)';

}


/*
 * =========================================================
 * SECURITY MESSAGE
 * =========================================================
 */

function showSecurityMessage(
  text
) {

  var element =
    document.getElementById(
      'security-message'
    );


  if (!element) {
    return;
  }


  element.style.display =
    'block';


  element.style.color =
    'var(--c-amber)';


  element.textContent =
    text;

}


/*
 * =========================================================
 * CLEAR SECURITY MESSAGE
 * =========================================================
 */

function clearSecurityMessage() {

  var element =
    document.getElementById(
      'security-message'
    );


  if (!element) {
    return;
  }


  element.style.display =
    'none';


  element.textContent =
    '';

}


/*
 * =========================================================
 * NOTIFICATION SETTINGS
 * =========================================================
 */

async function loadNotificationSettings() {

  var settings =
    readSettingsObject(
      SETTINGS_KEY
    );


  setCheckbox(
    'notify-request-status',
    settings.requestStatusNotifications !== false
  );


  setCheckbox(
    'notify-expiry',
    settings.expiryReminders !== false
  );


  setCheckbox(
    'notify-security',
    settings.securityAlerts !== false
  );


  setCheckbox(
    'notify-email',
    settings.emailNotifications !== false
  );


  setCheckbox(
    'notify-sms',
    settings.smsNotifications === true
  );


  var profile =
    await loadProfile();


  var emailDescription =
    document.getElementById(
      'email-notification-description'
    );


  if (emailDescription) {

    emailDescription.textContent =
      profile.email
        ? 'Send notifications to your registered email address.'
        : 'No registered email address is currently available.';

  }


  var smsDescription =
    document.getElementById(
      'sms-notification-description'
    );


  if (smsDescription) {

    smsDescription.textContent =
      profile.phone
        ? 'Send SMS to your registered phone number.'
        : 'No registered phone number is currently available.';

  }

}


/*
 * =========================================================
 * SAVE NOTIFICATION SETTINGS
 * =========================================================
 */

function saveNotificationSettings() {

  var settings =
    readSettingsObject(
      SETTINGS_KEY
    );


  settings.requestStatusNotifications =
    getCheckbox(
      'notify-request-status'
    );


  settings.expiryReminders =
    getCheckbox(
      'notify-expiry'
    );


  settings.securityAlerts =
    getCheckbox(
      'notify-security'
    );


  settings.emailNotifications =
    getCheckbox(
      'notify-email'
    );


  settings.smsNotifications =
    getCheckbox(
      'notify-sms'
    );


  saveSettings(
    settings
  );

}


/*
 * =========================================================
 * PRIVACY SETTINGS
 * =========================================================
 */

function loadPrivacySettings() {

  var settings =
    readSettingsObject(
      SETTINGS_KEY
    );


  setCheckbox(
    'privacy-audit',
    settings.auditVisibility !== false
  );

}


/*
 * =========================================================
 * SAVE PRIVACY SETTINGS
 * =========================================================
 */

function savePrivacySettings() {

  var settings =
    readSettingsObject(
      SETTINGS_KEY
    );


  settings.auditVisibility =
    getCheckbox(
      'privacy-audit'
    );


  saveSettings(
    settings
  );

}


/*
 * =========================================================
 * CHECKBOX HELPERS
 * =========================================================
 */

function getCheckbox(id) {

  var element =
    document.getElementById(
      id
    );


  return element
    ? element.checked
    : false;

}


function setCheckbox(
  id,
  value
) {

  var element =
    document.getElementById(
      id
    );


  if (element) {

    element.checked =
      value === true;

  }

}


/*
 * =========================================================
 * SESSION INFORMATION
 * =========================================================
 */

function renderSessionInfo() {

  var device =
    document.getElementById(
      'session-device'
    );


  var details =
    document.getElementById(
      'session-details'
    );


  if (device) {

    device.textContent =
      'Current browser session';

  }


  if (details) {

    details.textContent =
      'This session • Active now';

  }

}


/*
 * =========================================================
 * EXPORT USER DATA
 * =========================================================
 */

async function exportUserData() {

  var studentId =
    getCurrentStudentId();


  var request =
    getCurrentRequest();


  var history = [];


  try {

    history =
      JSON.parse(
        localStorage.getItem(
          'secureAccessRequestHistory'
        ) || '[]'
      );


    if (!Array.isArray(history)) {

      history = [];

    }

  } catch (error) {

    history = [];

  }


  if (studentId) {

    history =
      history.filter(
        function (item) {

          return (
            String(
              item.studentId || ''
            ).toUpperCase() ===
            studentId
          );

        }
      );

  }


  var profile =
    await loadProfile();


  var exportData = {

    exportedAt:
      new Date().toISOString(),

    studentId:
      profile.studentId ||
      studentId,

    profile:
      profile,

    currentRequest:
      request,

    requestHistory:
      history,

    settings:
      readSettingsObject(
        SETTINGS_KEY
      )

  };


  var blob =
    new Blob(
      [
        JSON.stringify(
          exportData,
          null,
          2
        )
      ],
      {
        type:
          'application/json'
      }
    );


  var url =
    URL.createObjectURL(
      blob
    );


  var link =
    document.createElement(
      'a'
    );


  link.href =
    url;


  link.download =
    'secureaccess-account-data.json';


  document.body.appendChild(
    link
  );


  link.click();


  document.body.removeChild(
    link
  );


  URL.revokeObjectURL(
    url
  );

}


/*
 * =========================================================
 * INITIALIZE
 * =========================================================
 */

document.addEventListener(
  'DOMContentLoaded',
  async function () {

    /*
     * Load profile first because the authenticated
     * email is needed by several settings sections.
     */
    await renderProfile();


    await loadSecuritySettings();


    await loadNotificationSettings();


    loadPrivacySettings();


    renderSessionInfo();

  }
);