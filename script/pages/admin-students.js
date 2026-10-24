(function () {
  'use strict';

  var students = [];
  var tableBody = document.getElementById('student-list');
  var status = document.getElementById('student-list-status');

  function filterStudents() {
    var query = document.getElementById('student-search').value.trim().toLowerCase();
    tableBody.querySelectorAll('tr[data-student]').forEach(function (row) {
      row.hidden = !row.textContent.toLowerCase().includes(query);
    });
  }

  function addCell(row, value) {
    var cell = document.createElement('td');
    cell.textContent = value;
    row.appendChild(cell);
    return cell;
  }

  async function loadAllRows(queryFactory) {
    var rows = [];
    for (var offset = 0; ; offset += 1000) {
      var result = await queryFactory().range(offset, offset + 999);
      if (result.error) throw result.error;
      var page = result.data || [];
      rows = rows.concat(page);
      if (page.length < 1000) return rows;
    }
  }

  function renderStudents(requestCounts) {
    tableBody.textContent = '';
    if (!students.length) {
      var emptyRow = document.createElement('tr');
      var emptyCell = addCell(emptyRow, 'No student profiles found.');
      emptyCell.colSpan = 5;
      emptyCell.className = 'personnel-empty-state';
      tableBody.appendChild(emptyRow);
      return;
    }

    students.forEach(function (student) {
      var row = document.createElement('tr');
      row.dataset.student = 'true';

      var identity = document.createElement('td');
      var name = document.createElement('strong');
      name.style.color = 'var(--c-200)';
      name.textContent = student.full_name;
      var studentNumber = document.createElement('span');
      studentNumber.className = 'mono';
      studentNumber.style.cssText = 'display:block;font-size:11px;color:var(--c-500);';
      studentNumber.textContent = student.student_id || 'Student ID not assigned';
      identity.append(name, studentNumber);
      row.appendChild(identity);

      var academic = [student.program, student.year_level ? 'Year ' + student.year_level : '']
        .filter(Boolean).join(' · ');
      addCell(row, academic || 'Academic details not provided');

      var clearanceCell = addCell(row, '');
      var clearance = document.createElement('span');
      clearance.className = 'pip pip-standard';
      clearance.textContent = 'Level ' + student.clearance_level;
      clearanceCell.appendChild(clearance);

      var counts = requestCounts[student.id] || { total: 0, pending: 0 };
      addCell(row, counts.total + ' total · ' + counts.pending + ' pending');

      var accountCell = addCell(row, '');
      var account = document.createElement('span');
      account.className = 'badge ' + (student.account_active ? 'b-green' : 'b-red');
      account.textContent = student.account_active ? 'Active' : 'Inactive';
      accountCell.appendChild(account);
      tableBody.appendChild(row);
    });

    filterStudents();
  }

  async function loadStudents() {
    status.textContent = 'Loading student profiles from Supabase…';
    try {
      var supabase = await window.secureAccessSupabaseReady;
      var [profileRows, requestRows] = await Promise.all([
        loadAllRows(function () {
          return supabase.from('profiles')
          .select('id, student_id, full_name, email, program, year_level, clearance_level, account_active')
          .eq('role', 'student')
          .order('full_name');
        }),
        loadAllRows(function () {
          return supabase.from('access_requests').select('requester_id, status');
        })
      ]);

      students = profileRows;
      var requestCounts = Object.create(null);
      requestRows.forEach(function (request) {
        var counts = requestCounts[request.requester_id] ||
          (requestCounts[request.requester_id] = { total: 0, pending: 0 });
        counts.total += 1;
        if (request.status === 'pending') counts.pending += 1;
      });
      renderStudents(requestCounts);
      status.textContent = students.length + ' student profile(s) loaded from Supabase.';
    } catch (error) {
      console.error('Unable to load student directory:', error);
      status.textContent = error.message || 'Unable to load student profiles.';
      status.classList.add('is-error');
      tableBody.textContent = '';
      var row = document.createElement('tr');
      var cell = addCell(row, 'Student profiles could not be loaded. Check your connection and permissions.');
      cell.colSpan = 5;
      cell.className = 'personnel-empty-state';
      tableBody.appendChild(row);
    }
  }

  window.filterStudents = filterStudents;
  document.getElementById('student-search').addEventListener('input', filterStudents);
  loadStudents();
})();
