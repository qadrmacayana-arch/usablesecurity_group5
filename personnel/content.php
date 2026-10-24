<?php
$personnelPage = 'content';
$personnelTitle = 'Lessons & activities';
$personnelScript = '../script/pages/personnel-content.js';
require __DIR__ . '/layout-start.php';
?>
<div class="page-content fade-in personnel-content">
  <section class="personnel-page-heading">
    <div><p class="personnel-eyebrow">Academic content</p><h1>Lessons &amp; activities</h1>
      <p>Create materials, keep them as drafts, or publish them for students.</p></div>
    <span class="personnel-context-pill">Only your materials are shown</span>
  </section>
  <div id="content-status" class="personnel-status" role="status">Loading your learning materials…</div>
  <section class="personnel-content-layout">
    <form id="content-form" class="personnel-panel personnel-form">
      <div class="personnel-panel-heading"><div><p class="personnel-eyebrow">Workspace</p><h2 id="content-form-title">Create material</h2></div></div>
      <input id="content-id" type="hidden">
      <label>Type
        <select id="content-type" class="sel" required>
          <option value="lesson">Lesson</option><option value="activity">Activity</option>
        </select>
      </label>
      <label>Title
        <input id="content-title" class="inp" maxlength="200" minlength="2" required placeholder="e.g. Introduction to network security">
      </label>
      <label>Short description
        <textarea id="content-description" class="textarea" maxlength="4000" rows="3" placeholder="What will students learn or complete?"></textarea>
      </label>
      <label>Learning material
        <textarea id="content-body" class="textarea" maxlength="50000" rows="8" placeholder="Write instructions, notes, or activity details…"></textarea>
      </label>
      <div class="personnel-form-actions">
        <button id="content-save" class="btn btn-primary" type="submit">Save as draft</button>
        <button id="content-cancel" class="btn btn-ghost" type="button" hidden>Cancel edit</button>
      </div>
      <p class="personnel-form-note">Published material is visible to students in the academic portal.</p>
    </form>
    <section class="personnel-panel">
      <div class="personnel-panel-heading"><div><p class="personnel-eyebrow">Your library</p><h2>Learning materials</h2></div>
        <select id="content-filter" class="sel personnel-inline-filter" aria-label="Filter materials by status">
          <option value="all">All statuses</option><option value="draft">Draft</option><option value="published">Published</option><option value="unpublished">Unpublished</option>
        </select>
      </div>
      <div id="content-list" class="personnel-content-list"><p class="personnel-muted">Loading materials…</p></div>
    </section>
  </section>
</div>
<?php require __DIR__ . '/layout-end.php'; ?>
