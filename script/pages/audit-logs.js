(function () {
    'use strict';

    var auditEvents = [];
    var currentCategory = '';

    function escapeAuditHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatAuditDate(value) {
        if (!value) {
            return '—';
        }

        var date = new Date(value);

        if (isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    function getCategoryClass(category) {
        if (category === 'Authentication') {
            return 'cat-auth';
        }

        if (category === 'Access Request') {
            return 'cat-request';
        }

        if (category === 'Access Grant') {
            return 'cat-grant';
        }

        return 'cat-control';
    }

    function getOutcomeClass(outcome) {
        var value = String(outcome || '').toLowerCase();

        if (
            value.indexOf('approved') !== -1 ||
            value.indexOf('success') !== -1 ||
            value.indexOf('granted') !== -1 ||
            value.indexOf('allowed') !== -1
        ) {
            return 'b-green';
        }

        if (
            value.indexOf('rejected') !== -1 ||
            value.indexOf('denied') !== -1 ||
            value.indexOf('revoked') !== -1 ||
            value.indexOf('failed') !== -1
        ) {
            return 'b-red';
        }

        if (
            value.indexOf('pending') !== -1 ||
            value.indexOf('submitted') !== -1
        ) {
            return 'b-amber';
        }

        return 'b-blue';
    }

    function getRequestReference(entry) {
        if (!entry.request) {
            return '—';
        }

        if (entry.request.request_number == null) {
            return '—';
        }

        return (
            'REQ-2026-' +
            String(entry.request.request_number).padStart(3, '0')
        );
    }

    function getMetadataValue(metadata, key) {
        if (!metadata || typeof metadata !== 'object') {
            return '';
        }

        return metadata[key] == null
            ? ''
            : String(metadata[key]);
    }

    function updateAuditStats() {
        var total = auditEvents.length;

        var authentication = auditEvents.filter(function (event) {
            return event.category === 'Authentication';
        }).length;

        var grants = auditEvents.filter(function (event) {
            return event.category === 'Access Grant';
        }).length;

        var requests = auditEvents.filter(function (event) {
            return event.category === 'Access Request';
        }).length;

        var totalElement =
            document.getElementById('audit-total');

        var authenticationElement =
            document.getElementById('audit-authentication');

        var grantsElement =
            document.getElementById('audit-grants');

        var requestsElement =
            document.getElementById('audit-requests');

        if (totalElement) {
            totalElement.textContent = total;
        }

        if (authenticationElement) {
            authenticationElement.textContent = authentication;
        }

        if (grantsElement) {
            grantsElement.textContent = grants;
        }

        if (requestsElement) {
            requestsElement.textContent = requests;
        }
    }

    function renderAuditLogs() {
        var tbody =
            document.getElementById('audit-tbody');

        var empty =
            document.getElementById('audit-empty');

        var table =
            document.getElementById('audit-table');

        if (!tbody) {
            return;
        }

        tbody.innerHTML = '';

        var filtered = auditEvents.filter(function (event) {
            return (
                !currentCategory ||
                event.category === currentCategory
            );
        });

        if (!filtered.length) {
            if (table) {
                table.style.display = 'none';
            }

            if (empty) {
                empty.style.display = 'block';
            }

            return;
        }

        if (table) {
            table.style.display = 'table';
        }

        if (empty) {
            empty.style.display = 'none';
        }

        filtered.forEach(function (event) {
            var row =
                document.createElement('tr');

            row.setAttribute(
                'data-cat',
                event.category
            );

            row.innerHTML =
                '<td class="mono" style="font-size:11px;color:var(--c-500);white-space:nowrap;">' +
                    escapeAuditHtml(
                        formatAuditDate(event.timestamp)
                    ) +
                '</td>' +

                '<td style="color:var(--c-200);font-size:13px;">' +
                    escapeAuditHtml(event.event) +
                '</td>' +

                '<td>' +
                    '<span class="cat-tag ' +
                        getCategoryClass(event.category) +
                    '">' +
                        escapeAuditHtml(event.category) +
                    '</span>' +
                '</td>' +

                '<td style="color:var(--c-400);font-size:12px;">' +
                    escapeAuditHtml(event.target || '—') +
                '</td>' +

                '<td class="mono" style="font-size:11px;color:var(--c-500);">' +
                    escapeAuditHtml(event.reference || '—') +
                '</td>' +

                '<td>' +
                    '<span class="badge ' +
                        getOutcomeClass(event.outcome) +
                    '">' +
                        escapeAuditHtml(
                            event.outcome || 'Recorded'
                        ) +
                    '</span>' +
                '</td>';

            tbody.appendChild(row);
        });
    }

    /*
     * =====================================================
     * LOAD AUDIT LOGS FROM SUPABASE
     * =====================================================
     */

    async function loadAuditEvents() {
        try {
            await window.secureAccessSupabaseReady;

            var supabase =
                window.secureAccessSupabase;

            if (!supabase) {
                throw new Error(
                    'Supabase client is unavailable.'
                );
            }

            var sessionResult =
                await supabase.auth.getSession();

            if (sessionResult.error) {
                throw sessionResult.error;
            }

            var session =
                sessionResult.data.session;

            if (
                !session ||
                !session.user
            ) {
                throw new Error(
                    'No authenticated session was found.'
                );
            }

            /*
             * Retrieve the actual audit_logs records.
             *
             * request_id is joined to access_requests
             * so we can display REQ-2026-XXX.
             */
            var result =
                await supabase
                    .from('audit_logs')
                    .select(`
                        id,
                        actor_id,
                        subject_id,
                        request_id,
                        action,
                        category,
                        resource_name,
                        outcome,
                        metadata,
                        created_at,
                        request:access_requests(
                            request_number
                        )
                    `)
                    .order(
                        'created_at',
                        {
                            ascending: false
                        }
                    );

            if (result.error) {
                throw result.error;
            }

            var records =
                result.data || [];

            auditEvents =
                records.map(function (entry) {
                    var metadata =
                        entry.metadata || {};

                    var target =
                        entry.resource_name ||
                        getMetadataValue(
                            metadata,
                            'target'
                        ) ||
                        '—';

                    var reference =
                        getRequestReference(entry);

                    /*
                     * If this is not associated with a request,
                     * use useful metadata when available.
                     */
                    if (reference === '—') {
                        reference =
                            getMetadataValue(
                                metadata,
                                'reference'
                            ) ||
                            getMetadataValue(
                                metadata,
                                'student_id'
                            ) ||
                            '—';
                    }

                    return {
                        id: entry.id,

                        timestamp:
                            entry.created_at,

                        event:
                            entry.action ||
                            'Audit Event',

                        category:
                            entry.category ||
                            'Access Control',

                        target:
                            target,

                        reference:
                            reference,

                        outcome:
                            entry.outcome ||
                            'Recorded',

                        metadata:
                            metadata
                    };
                });

            console.log(
                'Supabase audit logs loaded:',
                auditEvents
            );

            updateAuditStats();
            renderAuditLogs();

        } catch (error) {
            console.error(
                'Unable to load audit logs from Supabase:',
                error
            );

            auditEvents = [];

            updateAuditStats();
            renderAuditLogs();
        }
    }

    /*
     * =====================================================
     * FILTER
     * =====================================================
     */

    window.filterLogs = function () {
        var select =
            document.getElementById('log-filter');

        currentCategory =
            select
                ? select.value
                : '';

        renderAuditLogs();
    };

    /*
     * =====================================================
     * CSV ESCAPING
     * =====================================================
     */

    function escapeCsv(value) {
        var text =
            String(
                value == null
                    ? ''
                    : value
            );

        if (/^[=+\-@]/.test(text)) {
            text = "'" + text;
        }

        return '"' +
            text.replace(/"/g, '""') +
            '"';
    }

    /*
     * =====================================================
     * EXPORT
     * =====================================================
     */

    window.exportLogs = function () {
        var events =
            auditEvents.filter(function (event) {
                return (
                    !currentCategory ||
                    event.category === currentCategory
                );
            });

        if (!events.length) {
            alert(
                'There are no audit events available to export.'
            );
            return;
        }

        var rows = [];

        rows.push([
            'Timestamp',
            'Event',
            'Category',
            'Resource / Target',
            'Reference',
            'Outcome'
        ]);

        events.forEach(function (event) {
            rows.push([
                formatAuditDate(event.timestamp),
                event.event,
                event.category,
                event.target,
                event.reference,
                event.outcome
            ]);
        });

        var csv =
            rows
                .map(function (row) {
                    return row
                        .map(escapeCsv)
                        .join(',');
                })
                .join('\n');

        var blob =
            new Blob(
                [csv],
                {
                    type:
                        'text/csv;charset=utf-8;'
                }
            );

        var url =
            URL.createObjectURL(blob);

        var link =
            document.createElement('a');

        link.href = url;

        link.download =
            'secureaccess-audit-logs.csv';

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    /*
     * =====================================================
     * INITIALIZE
     * =====================================================
     */

    document.addEventListener(
        'DOMContentLoaded',
        function () {
            loadAuditEvents();
        }
    );

})();