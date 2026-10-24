(function () {
  'use strict';

  async function load() {
    var supabase = await window.secureAccessSupabaseReady;
    var sessionResult = await supabase.auth.getSession();
    if (sessionResult.error) throw sessionResult.error;
    if (!sessionResult.data.session) throw new Error('Your session has expired. Please sign in again.');
    var studentId = sessionResult.data.session.user.id;
    var results = await Promise.all([
      supabase.from('profiles')
        .select('role, program, year_level, account_active')
        .eq('id', studentId)
        .single(),
      supabase.from('grades')
        .select('id, score, max_score, updated_at, academic_content(title), teacher:profiles!grades_teacher_id_fkey(full_name)')
        .eq('student_id', studentId).eq('published', true).order('updated_at', { ascending: false })
    ]);
    results.forEach(function (result) { if (result.error) throw result.error; });
    var profile = results[0].data;
    if (profile.role !== 'student' || !profile.account_active) {
      throw new Error('An active student account is required to view grades.');
    }
    var academicDetails = [profile.program, profile.year_level ? 'Year ' + profile.year_level : '']
      .filter(Boolean).join(' · ');
    document.getElementById('grades-profile-summary').textContent =
      academicDetails ? 'Published assessment scores · ' + academicDetails : 'Scores published by your teachers.';
    var grades = results[1].data || [];
    var body = document.getElementById('student-published-grade-list');
    body.textContent = '';
    if (!grades.length) {
      var empty = document.createElement('tr');
      var emptyCell = document.createElement('td'); emptyCell.colSpan = 4;
      emptyCell.className = 'personnel-empty-state'; emptyCell.textContent = 'Your teachers have not published any grades yet.';
      empty.appendChild(emptyCell); body.appendChild(empty);
    } else {
      grades.forEach(function (grade) {
        var row = document.createElement('tr');
        var values = [
          (grade.academic_content && grade.academic_content.title) || 'Learning material',
          (grade.teacher && grade.teacher.full_name) || 'Faculty',
          grade.score + ' / ' + grade.max_score,
          new Date(grade.updated_at).toLocaleDateString()
        ];
        values.forEach(function (value) {
          var cell = document.createElement('td'); cell.textContent = value; row.appendChild(cell);
        });
        body.appendChild(row);
      });
    }
    document.getElementById('student-grades-status').textContent = grades.length + ' published grade record(s).';
  }

  load().catch(function (error) {
    console.error('Unable to load published grades:', error);
    document.getElementById('student-grades-status').textContent = error.message || 'Unable to load published grades.';
    document.getElementById('student-grades-status').classList.add('is-error');
  });
})();
