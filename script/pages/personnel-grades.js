(function () {
  'use strict';

  var context;

  function setStatus(text, isError) {
    var target = document.getElementById('grade-status');
    target.textContent = text;
    target.classList.toggle('is-error', Boolean(isError));
  }

  function addOption(select, value, label) {
    var option = document.createElement('option');
    option.value = value; option.textContent = label;
    select.appendChild(option);
  }

  function renderGrades(grades) {
    var body = document.getElementById('grade-list');
    body.textContent = '';
    if (!grades.length) {
      var empty = document.createElement('tr');
      var cell = document.createElement('td');
      cell.colSpan = 5; cell.className = 'personnel-empty-state';
      cell.textContent = 'No grades have been recorded yet.';
      empty.appendChild(cell); body.appendChild(empty); return;
    }
    grades.forEach(function (grade) {
      var row = document.createElement('tr');
      var student = grade.student || {};
      var content = grade.academic_content || {};
      [student.full_name || 'Student', content.title || 'Material', grade.score + ' / ' + grade.max_score].forEach(function (value) {
        var cell = document.createElement('td'); cell.textContent = value; row.appendChild(cell);
      });
      var statusCell = document.createElement('td');
      var badge = document.createElement('span');
      badge.className = 'badge ' + (grade.published ? 'b-green' : 'b-slate');
      badge.textContent = grade.published ? 'Published' : 'Private';
      statusCell.appendChild(badge); row.appendChild(statusCell);
      var dateCell = document.createElement('td');
      dateCell.textContent = new Date(grade.updated_at).toLocaleDateString();
      row.appendChild(dateCell); body.appendChild(row);
    });
  }

  async function load() {
    var supabase = context.supabase;
    var teacherId = context.profile.id;
    var results = await Promise.all([
      supabase.from('access_requests').select('requester_id').eq('recipient_id', teacherId),
      supabase.from('grades').select('student_id').eq('teacher_id', teacherId),
      supabase.from('academic_content').select('id, title, content_type').eq('teacher_id', teacherId).order('title'),
      supabase.from('grades').select('id, student_id, content_id, score, max_score, published, updated_at, academic_content(title), student:profiles!grades_student_id_fkey(full_name, student_id)')
        .eq('teacher_id', teacherId).order('updated_at', { ascending: false })
    ]);
    results.forEach(function (result) { if (result.error) throw result.error; });

    var ids = [];
    results[0].data.concat(results[1].data).forEach(function (row) {
      if (row.requester_id && !ids.includes(row.requester_id)) ids.push(row.requester_id);
      if (row.student_id && !ids.includes(row.student_id)) ids.push(row.student_id);
    });
    var students = [];
    if (ids.length) {
      var studentResult = await supabase.from('profiles').select('id, full_name, student_id').in('id', ids).order('full_name');
      if (studentResult.error) throw studentResult.error;
      students = studentResult.data || [];
    }

    var studentSelect = document.getElementById('grade-student');
    studentSelect.textContent = '';
    addOption(studentSelect, '', students.length ? 'Select a student' : 'No connected students yet');
    students.forEach(function (student) {
      addOption(studentSelect, student.id, student.full_name + (student.student_id ? ' · ' + student.student_id : ''));
    });
    var contentSelect = document.getElementById('grade-content');
    contentSelect.textContent = '';
    addOption(contentSelect, '', results[2].data.length ? 'Select a material' : 'Create a lesson or activity first');
    results[2].data.forEach(function (item) { addOption(contentSelect, item.id, item.title + ' · ' + item.content_type); });

    var grades = results[3].data || [];
    renderGrades(grades);
    setStatus(students.length + ' connected student(s) · ' + grades.length + ' grade record(s).', false);
  }

  document.getElementById('grade-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    var score = Number(document.getElementById('grade-score').value);
    var maxScore = Number(document.getElementById('grade-max').value);
    if (score > maxScore) {
      setStatus('Score cannot be greater than the maximum score.', true);
      return;
    }
    var button = document.getElementById('grade-save');
    button.disabled = true;
    try {
      var result = await context.supabase.from('grades').upsert({
        teacher_id: context.profile.id,
        student_id: document.getElementById('grade-student').value,
        content_id: document.getElementById('grade-content').value,
        score: score,
        max_score: maxScore,
        published: document.getElementById('grade-publish').checked
      }, { onConflict: 'content_id,student_id' });
      if (result.error) throw result.error;
      document.getElementById('grade-form').reset();
      document.getElementById('grade-max').value = '100';
      await load();
      setStatus('Grade saved successfully.', false);
    } catch (error) {
      console.error('Unable to save grade:', error);
      setStatus(error.message || 'Unable to save this grade.', true);
    } finally {
      button.disabled = false;
    }
  });

  window.secureAccessPersonnelReady.then(function (value) {
    context = value;
    return load();
  }).catch(function (error) {
    console.error('Unable to load gradebook:', error);
    setStatus(error.message || 'Unable to load your gradebook.', true);
  });
})();
