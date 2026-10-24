var STATIC_DOCUMENTS = [
  {
    id: 'DOC-001',
    name: 'Certificate of Enrollment',
    category: 'Academic',
    type: 'PDF',
    date: '2026-09-01',
    status: 'Valid'
  },
  {
    id: 'DOC-002',
    name: 'Student ID Copy',
    category: 'Identity',
    type: 'PNG',
    date: '2026-09-01',
    status: 'Valid'
  },
  {
    id: 'DOC-003',
    name: 'Official Transcript',
    category: 'Academic',
    type: 'PDF',
    date: '2026-09-01',
    status: 'Valid'
  },
  {
    id: 'DOC-004',
    name: 'Government-Issued ID',
    category: 'Identity',
    type: 'PDF',
    date: '2026-09-01',
    status: 'Valid'
  }
];

var allDocuments = [];

async function loadDocuments() {
  var documents = STATIC_DOCUMENTS.map(function (doc) {
    return Object.assign({}, doc);
  });

  try {
    var supabase = await window.secureAccessSupabaseReady;

    var authResult = await supabase.auth.getUser();

    if (authResult.error || !authResult.data || !authResult.data.user) {
      console.error('Unable to get current student:', authResult.error);
      allDocuments = documents;
      renderDocuments();
      return;
    }

    var userId = authResult.data.user.id;

    var result = await supabase
      .from('access_requests')
      .select(`
        id,
        request_number,
        requester_id,
        resource_id,
        permission,
        duration,
        urgency,
        justification,
        additional_message,
        status,
        decision_reason,
        submitted_at,
        decided_at,
        updated_at,
        resources (
          id,
          name,
          category,
          minimum_clearance,
          description
        )
      `)
      .eq('requester_id', userId)
      .order('submitted_at', { ascending: false });

    if (result.error) {
      console.error('Error loading access requests:', result.error);
      allDocuments = documents;
      renderDocuments();
      return;
    }

    var requests = result.data || [];

    requests.forEach(function (request) {
      var resource = request.resources || {};

      documents.push({
        id: 'DOC-REQUEST-' + request.id,
        requestId: request.id,
        requestNumber: formatRequestNumber(request.request_number),
        name: 'Access Request Form ' + formatRequestNumber(request.request_number),
        category: 'request',
        type: 'PDF',
        date: request.submitted_at,
        status: getRequestDocumentStatus(request.status),
        resource: resource.name || 'Unknown Resource',
        permission: request.permission || 'Not specified',
        duration: request.duration || 'Not specified',
        urgency: request.urgency || 'normal',
        justification: request.justification || '',
        additionalMessage: request.additional_message || '',
        decisionReason: request.decision_reason || '',
        submittedAt: request.submitted_at,
        decidedAt: request.decided_at
      });
    });

    allDocuments = documents;

    console.log('STUDENT DOCUMENTS LOADED:', allDocuments);

    renderDocuments();

  } catch (error) {
    console.error('Unexpected error loading documents:', error);
    allDocuments = documents;
    renderDocuments();
  }
}

function formatRequestNumber(number) {
  if (!number) {
    return 'REQ-UNKNOWN';
  }

  return 'REQ-2026-' + String(number).padStart(3, '0');
}

function getRequestDocumentStatus(status) {
  if (status === 'approved') {
    return 'Approved';
  }

  if (status === 'rejected') {
    return 'Rejected';
  }

  return 'Pending';
}

function getDocumentStatusClass(status) {
  if (status === 'Approved' || status === 'Valid') {
    return 'status-approved';
  }

  if (status === 'Rejected') {
    return 'status-rejected';
  }

  return 'status-pending';
}

function getDocumentIcon(category) {
if (category === 'Identity' || category === 'identity') {
return '🪪';
}

if (category === 'request' || category === 'Access Request') {
return '📄';
}

if (category === 'Academic' || category === 'academic') {
return '📑';
}

return '📑';
}

function getCategoryLabel(category) {
if (category === 'request') {
return 'Access Request';
}

if (category === 'academic') {
return 'Academic';
}

if (category === 'identity') {
return 'Identity';
}

return category;
}

function formatDocumentDate(dateValue) {
  if (!dateValue) {
    return '—';
  }

  var date = new Date(dateValue);

  if (isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function escapeDocumentHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function createDocumentCard(item) {
  var statusClass = getDocumentStatusClass(item.status);
  var icon = getDocumentIcon(item.category);
  var categoryLabel = getCategoryLabel(item.category);

  return `
    <div class="doc-card"
         data-category="${escapeDocumentHtml(item.category)}"
         data-name="${escapeDocumentHtml(item.name.toLowerCase())}"
         onclick="previewDoc('${escapeDocumentHtml(item.id)}')">

      <div class="doc-icon">
        ${icon}
      </div>

      <div class="doc-info">
        <h3>${escapeDocumentHtml(item.name)}</h3>

        <div class="doc-meta">
          <span>${escapeDocumentHtml(categoryLabel)}</span>
          <span>•</span>
          <span>${escapeDocumentHtml(item.type)}</span>
        </div>

        <div class="doc-date">
          ${formatDocumentDate(item.date)}
        </div>
      </div>

      <div class="doc-status ${statusClass}">
        ${escapeDocumentHtml(item.status)}
      </div>

    </div>
  `;
}

function renderDocuments() {
  var grid = document.getElementById('doc-grid');
  var emptyState = document.getElementById('documents-empty');

  if (!grid) {
    return;
  }

  var filteredDocuments = allDocuments.slice();

  var activeFilter = document.querySelector('.filter-btn.active');

  if (activeFilter) {
    var filter = activeFilter.getAttribute('data-filter');

    if (filter && filter !== 'all') {
      filteredDocuments = filteredDocuments.filter(function (doc) {
        return doc.category.toLowerCase() === filter.toLowerCase();
      });
    }
  }

  var searchInput = document.getElementById('document-search');

  if (searchInput) {
    var searchValue = searchInput.value.trim().toLowerCase();

    if (searchValue) {
      filteredDocuments = filteredDocuments.filter(function (doc) {
        return (
          doc.name.toLowerCase().includes(searchValue) ||
          doc.category.toLowerCase().includes(searchValue) ||
          (doc.resource && doc.resource.toLowerCase().includes(searchValue))
        );
      });
    }
  }

  if (!filteredDocuments.length) {
    grid.innerHTML = '';

    if (emptyState) {
      emptyState.style.display = 'block';

      var emptyTitle = document.getElementById('documents-empty-title');
      var emptyText = document.getElementById('documents-empty-text');

      if (emptyTitle) {
        emptyTitle.textContent = 'No documents found';
      }

      if (emptyText) {
        emptyText.textContent =
          'There are no documents matching your current filter or search.';
      }
    }

    return;
  }

  if (emptyState) {
    emptyState.style.display = 'none';
  }

  grid.innerHTML = filteredDocuments.map(function (item) {
    return createDocumentCard(item);
  }).join('');
}

function filterDocs(filter, button) {
  var buttons = document.querySelectorAll('.filter-btn');

  buttons.forEach(function (btn) {
    btn.classList.remove('active');
  });

  if (button) {
    button.classList.add('active');
  }

  renderDocuments();
}

function searchDocs() {
  renderDocuments();
}

window.previewDoc = function (documentId) {
  var item = allDocuments.find(function (doc) {
    return doc.id === documentId;
  });

  if (!item) {
    console.error('Document not found:', documentId);
    return;
  }

  var modal = document.getElementById('document-preview-modal');

  if (!modal) {
    console.error('Document preview modal not found.');
    return;
  }

  var title = document.getElementById('preview-title');
  var documentName = document.getElementById('preview-document-name');
  var icon = document.getElementById('preview-icon');
  var category = document.getElementById('preview-category');
  var type = document.getElementById('preview-type');
  var status = document.getElementById('preview-status');
  var details = document.getElementById('preview-details');

  if (title) {
    title.textContent = 'Document Preview';
  }

  if (documentName) {
    documentName.textContent = item.name;
  }

  if (icon) {
    icon.textContent = getDocumentIcon(item.category);
  }

  if (category) {
    category.textContent = getCategoryLabel(item.category);
  }

  if (type) {
    type.textContent = item.type;
  }

  if (status) {
    status.textContent = item.status;
  }

  if (details) {

    if (item.category === 'request') {

      details.innerHTML = `
        <div class="preview-detail-row">
          <strong>Request Number</strong>
          <span>${escapeDocumentHtml(item.requestNumber)}</span>
        </div>

        <div class="preview-detail-row">
          <strong>Resource</strong>
          <span>${escapeDocumentHtml(item.resource)}</span>
        </div>

        <div class="preview-detail-row">
          <strong>Permission</strong>
          <span>${escapeDocumentHtml(item.permission)}</span>
        </div>

        <div class="preview-detail-row">
          <strong>Duration</strong>
          <span>${escapeDocumentHtml(item.duration)}</span>
        </div>

        <div class="preview-detail-row">
          <strong>Urgency</strong>
          <span>${escapeDocumentHtml(item.urgency)}</span>
        </div>

        <div class="preview-detail-row">
          <strong>Date Submitted</strong>
          <span>${formatDocumentDate(item.submittedAt)}</span>
        </div>

        ${
          item.decisionReason
            ? `
              <div class="preview-detail-row">
                <strong>Decision</strong>
                <span>${escapeDocumentHtml(item.decisionReason)}</span>
              </div>
            `
            : ''
        }

        ${
          item.justification
            ? `
              <div class="preview-detail-block">
                <strong>Justification</strong>
                <p>${escapeDocumentHtml(item.justification)}</p>
              </div>
            `
            : ''
        }

        ${
          item.additionalMessage
            ? `
              <div class="preview-detail-block">
                <strong>Additional Message</strong>
                <p>${escapeDocumentHtml(item.additionalMessage)}</p>
              </div>
            `
            : ''
        }
      `;

    } else {

      details.innerHTML = `
        <div class="preview-detail-row">
          <strong>Document Type</strong>
          <span>${escapeDocumentHtml(item.type)}</span>
        </div>

        <div class="preview-detail-row">
          <strong>Category</strong>
          <span>${escapeDocumentHtml(item.category)}</span>
        </div>

        <div class="preview-detail-row">
          <strong>Date</strong>
          <span>${formatDocumentDate(item.date)}</span>
        </div>

        <div class="preview-detail-row">
          <strong>Status</strong>
          <span>${escapeDocumentHtml(item.status)}</span>
        </div>
      `;
    }
  }

  modal.style.display = 'flex';
};

  window.closeDocumentPreview = function () {
  var modal = document.getElementById('document-preview-modal');

  if (modal) {
    modal.style.display = 'none';
  }
};

document.addEventListener('DOMContentLoaded', function () {
  loadDocuments();
});