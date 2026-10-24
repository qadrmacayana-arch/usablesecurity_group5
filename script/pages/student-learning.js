(function () {
  'use strict';

  function setStatus(message, isError) {
    var target = document.getElementById('student-learning-status');
    target.textContent = message;
    target.classList.toggle('is-error', Boolean(isError));
  }

  async function load() {
    var supabase = await window.secureAccessSupabaseReady;
    var sessionResult = await supabase.auth.getSession();
    if (sessionResult.error) throw sessionResult.error;
    if (!sessionResult.data.session) throw new Error('Your session has expired. Please sign in again.');
    var result = await supabase.from('academic_content')
      .select('id, content_type, title, description, content_body, published_at, teacher:profiles!academic_content_teacher_id_fkey(full_name)')
      .eq('status', 'published').order('published_at', { ascending: false });
    if (result.error) throw result.error;

    var items = result.data || [];
    var list = document.getElementById('student-learning-list');
    list.textContent = '';
    if (!items.length) {
      var empty = document.createElement('p');
      empty.className = 'personnel-muted'; empty.textContent = 'Your teachers have not published any lessons or activities yet.';
      list.appendChild(empty);
      setStatus('No published materials yet.', false);
      return;
    }
    items.forEach(function (item) {
      var card = document.createElement('article');
      card.className = 'personnel-panel student-learning-card';
      var top = document.createElement('div'); top.className = 'personnel-content-item-top';
      var heading = document.createElement('div');
      var kind = document.createElement('span'); kind.className = 'personnel-content-kind'; kind.textContent = item.content_type;
      var title = document.createElement('h2'); title.textContent = item.title;
      heading.append(kind, title);
      var date = document.createElement('small');
      date.textContent = item.published_at ? new Date(item.published_at).toLocaleDateString() : '';
      top.append(heading, date);
      var teacher = document.createElement('p'); teacher.className = 'student-learning-teacher';
      teacher.textContent = 'By ' + ((item.teacher && item.teacher.full_name) || 'Faculty');
      var description = document.createElement('p'); description.className = 'student-learning-description';
      description.textContent = item.description || '';
      var body = document.createElement('div'); body.className = 'student-learning-body';
      body.textContent = item.content_body || 'No additional instructions.';
      card.append(top, teacher);
      if (item.description) card.appendChild(description);
      card.appendChild(body);
      list.appendChild(card);
    });
    setStatus(items.length + ' published material(s).', false);
  }

  load().catch(function (error) {
    console.error('Unable to load student learning materials:', error);
    setStatus(error.message || 'Unable to load learning materials.', true);
  });
})();
