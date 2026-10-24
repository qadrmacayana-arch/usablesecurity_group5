(function () {
    'use strict';

    function $(id) {
        return document.getElementById(id);
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatDate(value) {
        if (!value) return '—';

        var date = new Date(value);

        if (isNaN(date.getTime())) {
            return '—';
        }

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    function showLoading() {
        if ($('credential-loading')) {
            $('credential-loading').style.display = '';
        }

        if ($('credential-error')) {
            $('credential-error').style.display = 'none';
        }

        if ($('credential-content')) {
            $('credential-content').style.display = 'none';
        }
    }

    function showError(message) {
        if ($('credential-loading')) {
            $('credential-loading').style.display = 'none';
        }

        if ($('credential-content')) {
            $('credential-content').style.display = 'none';
        }

        if ($('credential-error')) {
            $('credential-error').style.display = '';
        }

        if ($('credential-error-message')) {
            $('credential-error-message').textContent = message;
        }
    }

    function showContent() {
        if ($('credential-loading')) {
            $('credential-loading').style.display = 'none';
        }

        if ($('credential-error')) {
            $('credential-error').style.display = 'none';
        }

        if ($('credential-content')) {
            $('credential-content').style.display = '';
        }
    }

    function getRequestNumberFromUrl() {
        var params = new URLSearchParams(window.location.search);
        var requestNumber = params.get('request');

        if (!requestNumber) {
            return null;
        }

        var match = requestNumber.match(/^REQ-2026-(\d+)$/i);

        if (!match) {
            return null;
        }

        return parseInt(match[1], 10);
    }

    function calculateDaysLeft(expiresAt) {
        if (!expiresAt) return 0;

        var now = new Date();
        var expires = new Date(expiresAt);

        var difference = expires.getTime() - now.getTime();

        return Math.max(0, Math.ceil(difference / (1000 * 60 * 60 * 24)));
    }

    function calculateProgress(startAt, expiresAt) {
        if (!startAt || !expiresAt) return 0;

        var start = new Date(startAt).getTime();
        var end = new Date(expiresAt).getTime();
        var now = new Date().getTime();

        if (end <= start) return 100;

        var total = end - start;
        var elapsed = now - start;

        var percentage = (elapsed / total) * 100;

        return Math.min(100, Math.max(0, percentage));
    }

    function getSecurityLevel(minimumClearance) {
        var clearance = Number(minimumClearance);

        if (clearance >= 4) {
            return 'Restricted';
        }

        if (clearance >= 3) {
            return 'Confidential';
        }

        if (clearance >= 2) {
            return 'Standard';
        }

        return 'Public';
    }

    function setText(id, value) {
        var element = $(id);

        if (element) {
            element.textContent = value ?? '—';
        }
    }

    async function loadCredential() {
        showLoading();

        try {
            await window.secureAccessSupabaseReady;

            var supabase = window.secureAccessSupabase;

            if (!supabase) {
                throw new Error('Supabase client is unavailable.');
            }

            /*
             * IMPORTANT:
             * We use the request number from the URL.
             *
             * Example:
             * credential.php?request=REQ-2026-021
             *
             * This prevents the page from accidentally displaying
             * another active credential such as REQ-2026-015.
             */
            var requestNumber = getRequestNumberFromUrl();

            if (!requestNumber) {
                throw new Error('No valid request reference was provided.');
            }

            /* -----------------------------------------
               1. Get logged-in user
            ----------------------------------------- */

            var sessionResult = await supabase.auth.getSession();

            if (sessionResult.error) {
                throw sessionResult.error;
            }

            var session = sessionResult.data.session;

            if (!session || !session.user) {
                throw new Error('Your session has expired. Please log in again.');
            }

            var userId = session.user.id;

            /* -----------------------------------------
               2. Get student profile
            ----------------------------------------- */

            var profileResult = await supabase
                .from('profiles')
                .select(`
                    id,
                    student_id,
                    full_name,
                    program,
                    year_level,
                    clearance_level,
                    role
                `)
                .eq('id', userId)
                .maybeSingle();

            if (profileResult.error) {
                throw profileResult.error;
            }

            var profile = profileResult.data;

            if (!profile) {
                throw new Error('Student profile could not be found.');
            }

            /* -----------------------------------------
               3. Get EXACT request from URL
            ----------------------------------------- */

            var requestResult = await supabase
                .from('access_requests')
                .select(`
                    id,
                    request_number,
                    requester_id,
                    resource_id,
                    permission,
                    duration,
                    status,
                    submitted_at,
                    decided_at
                `)
                .eq('requester_id', userId)
                .eq('request_number', requestNumber)
                .maybeSingle();

            if (requestResult.error) {
                throw requestResult.error;
            }

            var request = requestResult.data;

            if (!request) {
                throw new Error(
                    'Request REQ-2026-' +
                    String(requestNumber).padStart(3, '0') +
                    ' could not be found.'
                );
            }

            if (request.status !== 'approved') {
                throw new Error(
                    'This request is not approved and does not have an active credential.'
                );
            }

            /* -----------------------------------------
               4. Get resource belonging to THIS request
            ----------------------------------------- */

            var resourceResult = await supabase
                .from('resources')
                .select(`
                    id,
                    name,
                    category,
                    minimum_clearance,
                    description
                `)
                .eq('id', request.resource_id)
                .maybeSingle();

            if (resourceResult.error) {
                throw resourceResult.error;
            }

            var resource = resourceResult.data;

            if (!resource) {
                throw new Error('The resource for this request could not be found.');
            }

            /* -----------------------------------------
               5. Get grant belonging to THIS request
            ----------------------------------------- */

            var grantResult = await supabase
                .from('access_grants')
                .select(`
                    id,
                    request_id,
                    status,
                    starts_at,
                    expires_at,
                    permission
                `)
                .eq('request_id', request.id)
                .maybeSingle();

            if (grantResult.error) {
                throw grantResult.error;
            }

            var grant = grantResult.data;

            if (!grant) {
                throw new Error(
                    'No access credential was found for REQ-2026-' +
                    String(requestNumber).padStart(3, '0') +
                    '.'
                );
            }

            /* -----------------------------------------
               6. Calculate credential information
            ----------------------------------------- */

            var daysLeft = calculateDaysLeft(grant.expires_at);

            var progress = calculateProgress(
                grant.starts_at,
                grant.expires_at
            );

            var securityLevel = getSecurityLevel(
                resource.minimum_clearance
            );

            var statusText = grant.status
                ? grant.status.charAt(0).toUpperCase() + grant.status.slice(1)
                : 'Active';

            var permission = grant.permission || request.permission || '—';

            var requestReference =
                'REQ-2026-' + String(request.request_number).padStart(3, '0');

            /* -----------------------------------------
               7. Student information
            ----------------------------------------- */

            var studentName = profile.full_name || 'Student';
            var studentId = profile.student_id || '—';

            var initials = studentName
                .split(/\s+/)
                .filter(Boolean)
                .map(function (name) {
                    return name.charAt(0);
                })
                .join('')
                .substring(0, 2)
                .toUpperCase();

            /* -----------------------------------------
               8. Populate credential page
            ----------------------------------------- */

            setText('credential-student-name', studentName);
            setText('credential-student-id', studentId);

            setText('credential-status', statusText);
            setText('credential-detail-status', statusText);

            setText('credential-days-left', daysLeft);

            setText('credential-resource', resource.name);
            setText('credential-detail-resource', resource.name);

            setText('credential-permission', permission);
            setText('credential-detail-permission', permission);

            setText('credential-start', formatDate(grant.starts_at));
            setText('credential-expires', formatDate(grant.expires_at));

            setText('credential-id', grant.id);

            setText('credential-detail-name', studentName);
            setText('credential-detail-student-id', studentId);

            setText('credential-security', securityLevel);

            setText('credential-request', requestReference);

            setText(
                'credential-time-used',
                daysLeft + ' days remaining'
            );

            var progressElement = $('credential-progress');

            if (progressElement) {
                progressElement.style.width = progress + '%';
            }

            setText(
                'credential-expiration-message',
                'Your access remains valid until ' +
                formatDate(grant.expires_at) +
                '.'
            );

            var avatar = $('credential-avatar');

            if (avatar) {
                avatar.textContent = initials;
            }

            /* -----------------------------------------
               9. Make sure renewal link uses this request
            ----------------------------------------- */

            var renewalLink = document.querySelector(
                'a[href*="submission-form.php"]'
            );

            if (renewalLink) {
                renewalLink.href =
                    'submission-form.php?request=' +
                    encodeURIComponent(requestReference);
            }

            /* -----------------------------------------
               10. Show credential
            ----------------------------------------- */

            showContent();

            console.log('Credential loaded successfully:', {
                request: requestReference,
                requestId: request.id,
                grantId: grant.id,
                resource: resource.name,
                permission: permission
            });

        } catch (error) {
            console.error('Credential loading error:', error);

            showError(
                error && error.message
                    ? error.message
                    : 'Unable to load the access credential.'
            );
        }
    }

    if (window.secureAccessSupabaseReady) {
        window.secureAccessSupabaseReady
            .then(loadCredential)
            .catch(function (error) {
                console.error('Supabase initialization error:', error);
                showError('Unable to connect to the security system.');
            });
    } else {
        showError('Supabase is not available.');
    }

})();