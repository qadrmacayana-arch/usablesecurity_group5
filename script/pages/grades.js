var GRADES_KEY = 'secureAccessGrades';


/*
 * =========================================================
 * LOAD GRADE DATA
 * =========================================================
 *
 * The page reads the student's grade information from
 * localStorage.
 *
 * Later, when Supabase is connected, this function can
 * be replaced with the database query without changing
 * the HTML structure.
 *
 * =========================================================
 */

function loadGrades() {

  var saved =
    localStorage.getItem(GRADES_KEY);

  if (!saved) {

    return {
      student: null,
      semester: null,
      cumulativeGpa: null,
      academicStanding: null,
      badges: [],
      subjects: []
    };

  }


  try {

    var data =
      JSON.parse(saved);

    if (!data || typeof data !== 'object') {

      return {
        student: null,
        semester: null,
        cumulativeGpa: null,
        academicStanding: null,
        badges: [],
        subjects: []
      };

    }


    if (!Array.isArray(data.subjects)) {

      data.subjects = [];

    }


    if (!Array.isArray(data.badges)) {

      data.badges = [];

    }


    return data;

  } catch (error) {

    return {
      student: null,
      semester: null,
      cumulativeGpa: null,
      academicStanding: null,
      badges: [],
      subjects: []
    };

  }

}


/*
 * =========================================================
 * HTML ESCAPING
 * =========================================================
 */

function escapeGradeHtml(value) {

  return String(
    value == null ? '' : value
  )
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

}


/*
 * =========================================================
 * GPA CALCULATION
 * =========================================================
 */

function calculateSemesterGpa(subjects) {

  var totalUnits = 0;
  var totalPoints = 0;


  subjects.forEach(function (subject) {

    var units =
      Number(subject.units);

    var points =
      Number(subject.points);


    if (
      !isNaN(units) &&
      !isNaN(points) &&
      units > 0
    ) {

      totalUnits +=
        units;

      totalPoints +=
        units * points;

    }

  });


  if (totalUnits === 0) {

    return null;

  }


  return (
    totalPoints /
    totalUnits
  ).toFixed(2);

}


/*
 * =========================================================
 * TOTAL UNITS
 * =========================================================
 */

function calculateTotalUnits(subjects) {

  return subjects.reduce(
    function (total, subject) {

      var units =
        Number(subject.units);

      return total +
        (
          !isNaN(units)
            ? units
            : 0
        );

    },
    0
  );

}


/*
 * =========================================================
 * REMARKS
 * =========================================================
 */

function getRemark(subject) {

  if (subject.remarks) {

    return String(
      subject.remarks
    );

  }


  var status =
    String(
      subject.status || ''
    ).toLowerCase();


  if (
    status === 'passed' ||
    status === 'passing' ||
    status === 'pass'
  ) {

    return 'Passing';

  }


  if (
    status === 'failed' ||
    status === 'failing' ||
    status === 'fail'
  ) {

    return 'Failed';

  }


  if (subject.grade) {

    return 'Recorded';

  }


  return 'Pending';

}


/*
 * =========================================================
 * REMARK BADGE
 * ========================================================= */

function getRemarkBadge(subject) {

  var remark =
    getRemark(subject)
      .toLowerCase();


  if (
    remark === 'passing' ||
    remark === 'passed' ||
    remark === 'pass'
  ) {

    return 'b-green';

  }


  if (
    remark === 'failed' ||
    remark === 'failing' ||
    remark === 'fail'
  ) {

    return 'b-red';

  }


  if (
    remark === 'distinction' ||
    remark === 'excellent'
  ) {

    return 'b-blue';

  }


  return 'b-amber';

}


/*
 * =========================================================
 * GRADE COLOR
 * ========================================================= */

function getGradeColor(subject) {

  var remark =
    getRemark(subject)
      .toLowerCase();


  if (
    remark === 'failed' ||
    remark === 'failing' ||
    remark === 'fail'
  ) {

    return 'var(--c-red)';

  }


  if (
    subject.grade
  ) {

    return 'var(--c-green)';

  }


  return 'var(--c-400)';

}


/*
 * =========================================================
 * FORMAT SCORE
 * ========================================================= */

function formatScore(value) {

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {

    return '—';

  }


  return escapeGradeHtml(
    value
  );

}


/*
 * =========================================================
 * RENDER STUDENT INFORMATION
 * ========================================================= */

function renderStudentInfo(data) {

  var subtitle =
    document.getElementById(
      'grades-subtitle'
    );


  if (
    subtitle &&
    data.student
  ) {

    var year =
      data.student.year || '';

    var program =
      data.student.program || '';


    var parts = [];

    if (year) {
      parts.push(year);
    }

    if (program) {
      parts.push(program);
    }


    if (parts.length) {

      subtitle.textContent =
        'Your academic performance records — ' +
        parts.join(', ') +
        '.';

    }

  }

}


/*
 * =========================================================
 * RENDER GPA SUMMARY
 * ========================================================= */

function renderGpaSummary(data) {

  var subjects =
    Array.isArray(data.subjects)
      ? data.subjects
      : [];


  var calculatedGpa =
    calculateSemesterGpa(
      subjects
    );


  var cumulativeGpa =
    data.cumulativeGpa;


  if (
    cumulativeGpa === null ||
    cumulativeGpa === undefined ||
    cumulativeGpa === ''
  ) {

    cumulativeGpa =
      calculatedGpa;

  }


  var ring =
    document.getElementById(
      'overall-gpa-ring'
    );

  var gpa =
    document.getElementById(
      'overall-gpa'
    );

  var standing =
    document.getElementById(
      'academic-standing'
    );


  if (ring) {

    ring.textContent =
      cumulativeGpa != null
        ? escapeGradeHtml(
            Number(cumulativeGpa)
              .toFixed(2)
          )
        : '—';

  }


  if (gpa) {

    gpa.textContent =
      cumulativeGpa != null
        ? Number(cumulativeGpa)
            .toFixed(2)
        : '—';

  }


  if (standing) {

    standing.textContent =
      data.academicStanding ||
      'Not available';

  }


  var badges =
    document.getElementById(
      'academic-badges'
    );


  if (badges) {

    badges.innerHTML =
      '';


    if (
      Array.isArray(data.badges)
    ) {

      data.badges.forEach(
        function (badge) {

          if (!badge) {
            return;
          }


          var text =
            typeof badge === 'string'
              ? badge
              : badge.label;


          if (!text) {
            return;
          }


          var className =
            typeof badge === 'object' &&
            badge.className
              ? badge.className
              : 'b-blue';


          var span =
            document.createElement(
              'span'
            );


          span.className =
            'badge ' +
            className;


          span.textContent =
            text;


          badges.appendChild(
            span
          );

        }
      );

    }

  }

}


/*
 * =========================================================
 * RENDER SEMESTER INFORMATION
 * ========================================================= */

function renderSemester(data) {

  var semesterTitle =
    document.getElementById(
      'semester-title'
    );


  if (semesterTitle) {

    semesterTitle.textContent =
      data.semester ||
      'Current Semester';

  }


  var subjects =
    Array.isArray(data.subjects)
      ? data.subjects
      : [];


  var tbody =
    document.getElementById(
      'grades-tbody'
    );

  var empty =
    document.getElementById(
      'grades-empty'
    );

  var semesterCard =
    document.getElementById(
      'semester-card'
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML =
    '';


  if (!subjects.length) {

    if (semesterCard) {

      semesterCard.style.display =
        'none';

    }


    if (empty) {

      empty.style.display =
        'block';

    }


    return;

  }


  if (semesterCard) {

    semesterCard.style.display =
      'block';

  }


  if (empty) {

    empty.style.display =
      'none';

  }


  subjects.forEach(
    function (subject) {

      var row =
        document.createElement(
          'tr'
        );


      var grade =
        subject.grade ||
        '—';


      var remark =
        getRemark(
          subject
        );


      var badgeClass =
        getRemarkBadge(
          subject
        );


      row.innerHTML =

        '<td class="mono" style="font-size:12px;color:var(--c-400);">' +
          escapeGradeHtml(
            subject.code || ''
          ) +
        '</td>' +

        '<td style="color:var(--c-200);font-weight:500;">' +
          escapeGradeHtml(
            subject.subject || ''
          ) +
        '</td>' +

        '<td style="color:var(--c-400);font-size:13px;">' +
          formatScore(
            subject.units
          ) +
        '</td>' +

        '<td style="color:var(--c-300);font-size:13px;">' +
          formatScore(
            subject.prelim
          ) +
        '</td>' +

        '<td style="color:var(--c-300);font-size:13px;">' +
          formatScore(
            subject.midterm
          ) +
        '</td>' +

        '<td style="color:var(--c-600);font-size:13px;">' +
          formatScore(
            subject.final
          ) +
        '</td>' +

        '<td style="font-size:14px;font-weight:700;color:' +
          getGradeColor(subject) +
        ';">' +
          escapeGradeHtml(
            grade
          ) +
        '</td>' +

        '<td>' +
          '<span class="badge ' +
            badgeClass +
          '">' +
            escapeGradeHtml(
              remark
            ) +
          '</span>' +
        '</td>';


      tbody.appendChild(
        row
      );

    }
  );


  var semesterGpa =
    document.getElementById(
      'semester-gpa'
    );


  var totalUnits =
    document.getElementById(
      'total-units'
    );


  var calculatedGpa =
    calculateSemesterGpa(
      subjects
    );


  var units =
    calculateTotalUnits(
      subjects
    );


  if (semesterGpa) {

    semesterGpa.textContent =
      data.semesterGpa ||
      calculatedGpa ||
      '—';

  }


  if (totalUnits) {

    totalUnits.textContent =
      units > 0
        ? units
        : '—';

  }

}


/*
 * =========================================================
 * INITIALIZE
 * ========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  function () {

    var data =
      loadGrades();


    renderStudentInfo(
      data
    );


    renderGpaSummary(
      data
    );


    renderSemester(
      data
    );

  }
);