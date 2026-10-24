// ============================================================
// Submission Form - Supabase Version
// ============================================================

var resources = [];
var currentProfile = null;


// ------------------------------------------------------------
// Get Supabase client
// ------------------------------------------------------------

async function getSupabase() {
  if (window.secureAccessSupabaseReady) {
    await window.secureAccessSupabaseReady;
  }

  if (!window.secureAccessSupabase) {
    throw new Error('Supabase client is not available.');
  }

  return window.secureAccessSupabase;
}


// ------------------------------------------------------------
// Escape HTML
// ------------------------------------------------------------

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


// ------------------------------------------------------------
// Get security level
// ------------------------------------------------------------

function getSecurityLevel(resource) {
  if (!resource) {
    return 'Unknown';
  }

  return resource.sensitivity || 'Standard';
}


// ------------------------------------------------------------
// Find selected resource
// ------------------------------------------------------------

function findSelectedResource(value) {
  if (!value) {
    return null;
  }

  return resources.find(function (resource) {
    return String(resource.id) === String(value);
  }) || null;
}


// ------------------------------------------------------------
// Load resources from Supabase
// ------------------------------------------------------------

async function loadResources(supabase) {
  var result = await supabase
    .from('resources')
    .select(
      'id, name, category, sensitivity, minimum_clearance, description, active'
    )
    .eq('active', true)
    .order('name', { ascending: true });

  if (result.error) {
    throw result.error;
  }

  resources = result.data || [];

  var select = document.getElementById('resource-sel');

  if (!select) {
    throw new Error('Resource selector was not found.');
  }

  // Remove hard-coded resources and load actual database resources.
  select.innerHTML = '';

  var placeholder = document.createElement('option');

  placeholder.value = '';
  placeholder.textContent = 'Select a resource';
  placeholder.disabled = true;
  placeholder.selected = true;

  select.appendChild(placeholder);

  resources.forEach(function (resource) {
    var option = document.createElement('option');

    option.value = resource.id;
    option.textContent = resource.name;

    select.appendChild(option);
  });

  var panel = document.getElementById('res-info');

  if (panel) {
    panel.style.display = 'none';
  }
}

async function loadRecipients(supabase) {
  var result = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .in('role', ['teacher', 'administrator'])
    .eq('account_active', true)
    .order('full_name', { ascending: true });

  if (result.error) {
    throw result.error;
  }

  var select = document.getElementById('recipient-sel');

  if (!select) {
    throw new Error('Reviewer selector was not found.');
  }

  select.textContent = '';

  var placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select an active reviewer';
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);

  (result.data || []).forEach(function (profile) {
    var option = document.createElement('option');
    option.value = profile.id;
    option.textContent =
      profile.full_name +
      ' (' +
      (profile.role === 'administrator' ? 'Administrator' : 'Teacher') +
      ')';
    select.appendChild(option);
  });

  if (!result.data || result.data.length === 0) {
    throw new Error('There are no active reviewers available for new requests.');
  }
}


// ------------------------------------------------------------
// Load current student profile
// ------------------------------------------------------------

async function loadCurrentProfile(supabase) {
  var sessionResult = await supabase.auth.getSession();

  if (sessionResult.error) {
    throw sessionResult.error;
  }

  var session = sessionResult.data.session;

  if (!session || !session.user) {
    throw new Error(
      'You must be logged in before submitting a request.'
    );
  }

  var profileResult = await supabase
    .from('profiles')
    .select(
      'id, student_id, full_name, email, program, year_level, clearance_level, role, account_active'
    )
    .eq('id', session.user.id)
    .single();

  if (profileResult.error) {
    throw profileResult.error;
  }

  currentProfile = profileResult.data;

  if (!currentProfile) {
    throw new Error(
      'Your student profile could not be found.'
    );
  }

  if (currentProfile.role !== 'student') {
    throw new Error(
      'Only student accounts can submit access requests.'
    );
  }

  if (currentProfile.account_active !== true) {
    throw new Error(
      'Your account is currently inactive.'
    );
  }

  return currentProfile;
}


// ------------------------------------------------------------
// Resource selection change
// ------------------------------------------------------------

function onResourceChange(select) {
  var panel = document.getElementById('res-info');

  if (!panel) {
    return;
  }

  var resource = findSelectedResource(select.value);

  if (!resource) {
    panel.style.display = 'none';
    return;
  }

  var securityElement =
    document.getElementById('res-level');

  var descriptionElement =
    document.getElementById('res-desc');

  if (securityElement) {
    securityElement.textContent =
      getSecurityLevel(resource);
  }

  if (descriptionElement) {
    descriptionElement.textContent =
      resource.description ||
      'No description available.';
  }

  panel.style.display = 'block';
}


// ------------------------------------------------------------
// Terms checkbox
// ------------------------------------------------------------

function toggleTerms() {
  var checkbox =
    document.getElementById('terms-cb');

  var submitButton =
    document.getElementById('submit-btn');

  if (!checkbox || !submitButton) {
    return;
  }

  if (checkbox.checked) {
    submitButton.disabled = false;
    submitButton.style.opacity = '1';
    submitButton.style.cursor = 'pointer';
  } else {
    submitButton.disabled = true;
    submitButton.style.opacity = '.5';
    submitButton.style.cursor = 'not-allowed';
  }
}


// ------------------------------------------------------------
// Format request number
// ------------------------------------------------------------

function formatRequestNumber(number) {
  if (
    number === null ||
    number === undefined ||
    number === ''
  ) {
    return '';
  }

  var numericNumber = Number(number);

  if (!Number.isFinite(numericNumber)) {
    return String(number);
  }

  var year = new Date().getFullYear();

  return (
    'REQ-' +
    year +
    '-' +
    String(numericNumber).padStart(3, '0')
  );
}


// ------------------------------------------------------------
// Show success modal
// ------------------------------------------------------------

function showSuccessModal(requestNumber) {
  var modal =
    document.getElementById('success-modal');

  if (!modal) {
    return;
  }

  var monoElements =
    modal.querySelectorAll('.mono');

  monoElements.forEach(function (element) {
    element.textContent = requestNumber;
  });

  var statusLink =
    modal.querySelector(
      'a[href="request-pending.php"]'
    );

  if (statusLink) {
    statusLink.href =
      'request-pending.php?request=' +
      encodeURIComponent(requestNumber);
  }

  modal.style.display = 'flex';
  modal.classList.add('show');
}


// ------------------------------------------------------------
// Show error
// ------------------------------------------------------------

function showErrorMessage(message) {
  console.error(
    'Access request submission error:',
    message
  );

  var errorModal =
    document.getElementById('error-modal') ||
    document.querySelector('.error-modal');

  if (errorModal) {
    var messageElement =
      errorModal.querySelector(
        '.error-message'
      ) ||
      errorModal.querySelector(
        '[data-error-message]'
      ) ||
      errorModal.querySelector('p');

    if (messageElement) {
      messageElement.textContent = message;
    }

    errorModal.style.display = 'flex';
    errorModal.classList.add('show');

    return;
  }

  // No alert popup.
  console.error(message);
}


// ------------------------------------------------------------
// Submit form
// ------------------------------------------------------------

async function submitForm(event) {
  if (event) {
    event.preventDefault();
  }

  var form =
    document.getElementById('access-form');

  if (!form) {
    showErrorMessage(
      'The access request form could not be found.'
    );
    return;
  }

  try {

    // --------------------------------------------------------
    // Browser validation
    // --------------------------------------------------------

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }


    // --------------------------------------------------------
    // Get Supabase
    // --------------------------------------------------------

    var supabase =
      await getSupabase();


    // --------------------------------------------------------
    // Get current profile
    // --------------------------------------------------------

    if (!currentProfile) {
      await loadCurrentProfile(supabase);
    }


    // --------------------------------------------------------
    // Resource
    // --------------------------------------------------------

    var resourceSelect =
      document.getElementById('resource-sel');

    if (!resourceSelect) {
      throw new Error(
        'Resource selector was not found.'
      );
    }

    var resource =
      findSelectedResource(
        resourceSelect.value
      );

    if (!resource) {
      throw new Error(
        'Please select a valid resource.'
      );
    }


    // --------------------------------------------------------
    var permission =
      String(
        document.getElementById('permission-sel').value || ''
      ).trim();
    var duration =
      String(
        document.getElementById('duration-sel').value || ''
      ).trim();
    var urgency =
      String(
        document.getElementById('urgency-sel').value || 'normal'
      ).trim().toLowerCase();
    var recipientId =
      String(
        document.getElementById('recipient-sel').value || ''
      ).trim();


    // --------------------------------------------------------
    // Permission validation
    // --------------------------------------------------------

    if (!permission) {
      throw new Error(
        'Please select a permission type.'
      );
    }

    if (!recipientId) {
      throw new Error(
        'Please select an active reviewer.'
      );
    }

    if (urgency !== 'normal' && urgency !== 'urgent') {
      throw new Error(
        'Please choose either normal or urgent priority.'
      );
    }


    // --------------------------------------------------------
    // Duration validation
    //
    // Database constraint:
    // 2 to 80 characters
    // --------------------------------------------------------

    if (!duration || duration.length < 2) {
      throw new Error(
        'Please select an access duration.'
      );
    }

    if (duration.length > 80) {
      throw new Error(
        'The access duration cannot exceed 80 characters.'
      );
    }


    // --------------------------------------------------------
    // Justification
    // --------------------------------------------------------

    var textareas =
      form.querySelectorAll('textarea');

    var justification = '';
    var additionalMessage = '';


    // First textarea = Access Justification
    if (textareas[0]) {
      justification =
        String(
          textareas[0].value || ''
        ).trim();
    }


    // Second textarea = Additional Message
    if (textareas[1]) {
      additionalMessage =
        String(
          textareas[1].value || ''
        ).trim();
    }


    // --------------------------------------------------------
    // Justification validation
    //
    // Database constraint:
    // 10 to 4000 characters
    // --------------------------------------------------------

    if (justification.length < 10) {
      throw new Error(
        'Please provide a justification with at least 10 characters.'
      );
    }

    if (justification.length > 4000) {
      throw new Error(
        'Your justification cannot exceed 4000 characters.'
      );
    }

    if (additionalMessage.length > 4000) {
      throw new Error(
        'Your additional message cannot exceed 4000 characters.'
      );
    }


    // --------------------------------------------------------
    // Terms
    // --------------------------------------------------------

    var termsCheckbox =
      document.getElementById('terms-cb');

    if (
      termsCheckbox &&
      !termsCheckbox.checked
    ) {
      throw new Error(
        'Please agree to the Terms & Agreement before submitting.'
      );
    }


    // --------------------------------------------------------
    // Clearance check
    // --------------------------------------------------------

    var studentClearance =
      Number(
        currentProfile.clearance_level || 0
      );

    var minimumClearance =
      Number(
        resource.minimum_clearance || 0
      );

    if (
      Number.isFinite(minimumClearance) &&
      studentClearance < minimumClearance
    ) {
      throw new Error(
        'Your clearance level does not meet the minimum clearance required for this resource.'
      );
    }


    // --------------------------------------------------------
    // INSERT
    //
    // IMPORTANT:
    // request_number is GENERATED ALWAYS AS IDENTITY.
    // Do NOT insert request_number manually.
    // --------------------------------------------------------

    var insertResult =
      await supabase
        .from('access_requests')
        .insert({
          requester_id:
            currentProfile.id,

          recipient_id:
            recipientId,

          resource_id:
            resource.id,

          permission:
            permission,

          duration:
            duration,

          urgency:
            urgency || 'normal',

          justification:
            justification,

          additional_message:
            additionalMessage || '',

          status:
            'pending'
        })
        .select(
          'id, request_number, status, submitted_at'
        )
        .single();


    // --------------------------------------------------------
    // Supabase error
    // --------------------------------------------------------

    if (insertResult.error) {

      console.error(
        'SUPABASE INSERT ERROR'
      );

      console.error(
        'message:',
        insertResult.error.message
      );

      console.error(
        'details:',
        insertResult.error.details
      );

      console.error(
        'hint:',
        insertResult.error.hint
      );

      console.error(
        'code:',
        insertResult.error.code
      );

      console.error(
        'full error:',
        insertResult.error
      );

      throw insertResult.error;
    }


    // --------------------------------------------------------
    // Inserted request
    // --------------------------------------------------------

    var insertedRequest =
      insertResult.data;

    if (!insertedRequest) {
      throw new Error(
        'The request was submitted, but no request record was returned.'
      );
    }


    // --------------------------------------------------------
    // Generated request number
    // --------------------------------------------------------

    var requestNumber =
      formatRequestNumber(
        insertedRequest.request_number
      );


    // --------------------------------------------------------
    // Temporary UI state only
    // --------------------------------------------------------

    try {

      sessionStorage.setItem(
        'secureAccessLastRequestId',
        String(insertedRequest.id)
      );

      sessionStorage.setItem(
        'secureAccessLastRequestNumber',
        requestNumber
      );

    } catch (storageError) {

      console.warn(
        'Could not save temporary request information:',
        storageError
      );

    }


    // --------------------------------------------------------
    // Reset form
    // --------------------------------------------------------

    form.reset();

    var resourceInfo =
      document.getElementById('res-info');

    if (resourceInfo) {
      resourceInfo.style.display = 'none';
    }


    // Reset submit button to disabled
    // because the checkbox was reset.
    toggleTerms();


    // --------------------------------------------------------
    // Show success
    // --------------------------------------------------------

    showSuccessModal(
      requestNumber
    );


    console.log(
      'Access request submitted successfully:',
      requestNumber
    );

  } catch (error) {

    console.error(
      'ACCESS REQUEST SUBMISSION FAILED'
    );

    console.error(error);

    showErrorMessage(
      error && error.message
        ? error.message
        : 'Unable to submit the access request.'
    );
  }
}


// ------------------------------------------------------------
// Initialize page
// ------------------------------------------------------------

async function initializePage() {

  try {

    var supabase =
      await getSupabase();

    await loadCurrentProfile(
      supabase
    );

    await loadResources(
      supabase
    );

    await loadRecipients(
      supabase
    );

    // Make sure the button starts
    // disabled until Terms is checked.
    toggleTerms();

    console.log(
      'Submission form initialized successfully.'
    );

  } catch (error) {

    console.error(
      'SUBMISSION FORM INITIALIZATION FAILED'
    );

    console.error(error);

    showErrorMessage(
      error && error.message
        ? error.message
        : 'Unable to load the submission form.'
    );
  }
}


// ------------------------------------------------------------
// Start page
// ------------------------------------------------------------

if (
  document.readyState === 'loading'
) {

  document.addEventListener(
    'DOMContentLoaded',
    initializePage
  );

} else {

  initializePage();

}