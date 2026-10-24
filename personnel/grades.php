<?php
$personnelPage = 'grades';
$personnelTitle = 'Gradebook';
$personnelScript = '../script/pages/personnel-grades.js';
require __DIR__ . '/layout-start.php';
?>
<div class="page-content fade-in personnel-content">
  <section class="personnel-page-heading">
    <div><p class="personnel-eyebrow">Academic records</p><h1>Gradebook</h1>
      <p>Record and publish grades for students connected to your requests or existing grade records.</p></div>
    <span class="personnel-context-pill">Private until published</span>
  </section>
  <div id="grade-status" class="personnel-status" role="status">Loading your gradebook…</div>
  <section class="personnel-content-layout personnel-grade-layout">
    <form id="grade-form" class="personnel-panel personnel-form">
      <div class="personnel-panel-heading"><div><p class="personnel-eyebrow">New or update</p><h2>Record a grade</h2></div></div>
      <label>Student
        <select id="grade-student" class="sel" required><option value="">Loading students…</option></select>
      </label>
      <label>Lesson or activity
        <select id="grade-content" class="sel" required><option value="">Loading materials…</option></select>
      </label>
      <div class="personnel-grade-inputs">
        <label>Score<input id="grade-score" class="inp" type="number" min="0" step="0.01" required></label>
        <label>Out of<input id="grade-max" class="inp" type="number" min="0.01" step="0.01" value="100" required></label>
      </div>
      <label class="personnel-check"><input id="grade-publish" type="checkbox"> Publish this grade for the student</label>
      <button id="grade-save" class="btn btn-primary" type="submit">Save grade</button>
      <p class="personnel-form-note">Grades remain private until you publish them. Saving the same student and material updates that grade.</p>
    </form>
    <section class="personnel-panel personnel-gradebook-panel">
      <div class="personnel-panel-heading"><div><p class="personnel-eyebrow">Your records</p><h2>Student grades</h2></div></div>
      <div class="personnel-table-wrap">
        <table class="tbl personnel-grade-table">
          <thead><tr><th>Student</th><th>Material</th><th>Score</th><th>Visibility</th><th>Updated</th></tr></thead>
          <tbody id="grade-list"><tr><td colspan="5" class="personnel-empty-state">Loading grades…</td></tr></tbody>
        </table>
      </div>
    </section>
  </section>
</div>
<?php require __DIR__ . '/layout-end.php'; ?>
