<?php require_once __DIR__ . "/../includes/student-guard.php"; ?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documents — SecureAccess</title>

  <link rel="stylesheet" href="../style/shared.css">
</head>

<body data-page="documents">

  <div id="sidebar-overlay"></div>

  <div class="app-shell">

    <aside id="sidebar"></aside>

    <div class="main-area">

      <div id="top-bar" data-title="Documents"></div>

      <div class="page-content fade-in">

        <div class="page-header">
          <h1>Documents</h1>

          <p>
            Your academic and identity documents stored securely in the portal.
          </p>
        </div>

        <!-- Search and Filters -->
        <div
          style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap;"
        >

          <div style="position:relative;flex:1;max-width:320px;">

            <svg
              style="position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none;"
              width="14"
              height="14"
              fill="none"
              stroke="var(--c-500)"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
              id="document-search"
              class="inp"
              type="text"
              placeholder="Search documents..."
              style="padding-left:34px;"
              oninput="searchDocs(this)"
            >

          </div>

          <div class="filter-tabs">

            <button
              class="ftab active"
              onclick="filterDocs('all', this)"
            >
              All
            </button>

            <button
              class="ftab"
              onclick="filterDocs('academic', this)"
            >
              Academic
            </button>

            <button
              class="ftab"
              onclick="filterDocs('identity', this)"
            >
              Identity
            </button>

            <button
              class="ftab"
              onclick="filterDocs('request', this)"
            >
              Requests
            </button>

          </div>

        </div>

        <!-- Documents Grid -->
        <div
          id="doc-grid"
          style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;"
        >

          <div
            style="grid-column:1/-1;color:var(--c-500);font-size:13px;"
          >
            Loading documents...
          </div>

        </div>

        <!-- Empty State -->
        <div
          id="documents-empty"
          style="display:none;text-align:center;padding:40px 20px;"
        >

          <p
            id="documents-empty-title"
            style="font-size:14px;font-weight:600;color:var(--c-300);margin:0 0 6px;"
          >
            No documents found
          </p>

          <p
            id="documents-empty-text"
            style="font-size:12px;color:var(--c-500);margin:0;"
          >
            No documents are currently available for your account.
          </p>

        </div>

      </div>

    </div>

  </div>

  <!-- Document Preview Modal -->

  <div
    id="document-preview-modal"
    class="modal-backdrop"
    style="display:none;"
    onclick="if(event.target === this) closeDocumentPreview()"
  >

    <div class="modal">

      <div class="modal-header">

        <div>

          <p
            id="preview-title"
            class="lbl"
            style="margin:0 0 4px;"
          >
            Document Preview
          </p>

          <h2
            id="preview-document-name"
            style="font-size:18px;color:#fff;margin:0;"
          >
            Document
          </h2>

        </div>

        <button
          class="close-btn"
          onclick="closeDocumentPreview()"
          aria-label="Close"
        >
          ×
        </button>

      </div>

      <div class="modal-body">

        <div
          style="display:flex;align-items:center;gap:14px;margin-bottom:20px;"
        >

          <div
            id="preview-icon"
            style="width:46px;height:46px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"
          >
          </div>

          <div>

            <p
              class="lbl"
              style="margin:0 0 4px;"
            >
              Category
            </p>

            <p
              id="preview-category"
              style="color:var(--c-200);margin:0;font-size:13px;"
            >
              —
            </p>

          </div>

        </div>

        <div
          style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;"
        >

          <div>

            <p class="lbl">
              Type
            </p>

            <p
              id="preview-type"
              style="color:var(--c-200);margin:0;"
            >
              —
            </p>

          </div>

          <div>

            <p class="lbl">
              Status
            </p>

            <p
              id="preview-status"
              style="color:var(--c-200);margin:0;"
            >
              —
            </p>

          </div>

        </div>

        <div
          style="background:rgba(99,102,241,.06);border:1px solid rgba(99,102,241,.2);border-radius:8px;padding:14px;"
        >

          <p
            class="lbl"
            style="margin-bottom:6px;"
          >
            Details
          </p>

          <div
            id="preview-details"
            style="font-size:13px;color:var(--c-400);line-height:1.7;margin:0;"
          >
            —
          </div>

        </div>

      </div>

      <div class="modal-footer">

        <button
          class="btn btn-secondary"
          onclick="closeDocumentPreview()"
        >
          Close
        </button>

      </div>

    </div>

  </div>

  <script src="../script/shared.js"></script>
  <script src="../script/supabase-client.js"></script>
  <script src="../script/pages/documents.js"></script>

</body>
</html>