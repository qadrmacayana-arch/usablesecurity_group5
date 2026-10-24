(function () {
  'use strict';

  var materials = [];
  var context;
  var form = document.getElementById('content-form');

  function setStatus(text, isError) {
    var target = document.getElementById('content-status');
    target.textContent = text;
    target.classList.toggle('is-error', Boolean(isError));
  }

  function clearForm() {
    form.reset();
    document.getElementById('content-id').value = '';
    document.getElementById('content-form-title').textContent = 'Create material';
    document.getElementById('content-save').textContent = 'Save as draft';
    document.getElementById('content-cancel').hidden = true;
  }

  function render() {
    var filter = document.getElementById('content-filter').value;
    var list = document.getElementById('content-list');
    var filtered = materials.filter(function (item) {
      return filter === 'all' || item.status === filter;
    });
    list.textContent = '';
    if (!filtered.length) {
      var empty = document.createElement('p');
      empty.className = 'personnel-muted';
      empty.textContent = materials.length ? 'No materials match this status.' : 'Your library is empty. Create your first lesson or activity.';
      list.appendChild(empty);
      return;
    }
    filtered.forEach(function (item) {
      var card = document.createElement('article');
      card.className = 'personnel-content-item';
      var top = document.createElement('div');
      top.className = 'personnel-content-item-top';
      var heading = document.createElement('div');
      var kind = document.createElement('span');
      kind.className = 'personnel-content-kind';
      kind.textContent = item.content_type;
      var title = document.createElement('h3');
      title.textContent = item.title;
      heading.append(kind, title);
      var badge = document.createElement('span');
      badge.className = 'badge ' + (item.status === 'published' ? 'b-green' : item.status === 'draft' ? 'b-slate' : 'b-amber');
      badge.textContent = item.status;
      top.append(heading, badge);
      var desc = document.createElement('p');
      desc.className = 'personnel-content-description';
      desc.textContent = item.description || item.content_body || 'No description provided.';
      var meta = document.createElement('small');
      meta.textContent = 'Updated ' + new Date(item.updated_at).toLocaleString();
      var actions = document.createElement('div');
      actions.className = 'personnel-card-actions';
      var edit = document.createElement('button');
      edit.type = 'button'; edit.className = 'btn btn-ghost btn-sm'; edit.textContent = 'Edit';
      edit.addEventListener('click', function () { editMaterial(item); });
      var toggle = document.createElement('button');
      toggle.type = 'button'; toggle.className = 'btn btn-ghost btn-sm';
      toggle.textContent = item.status === 'published' ? 'Unpublish' : 'Publish';
      toggle.addEventListener('click', function () { changePublication(item); });
      actions.append(edit, toggle);
      card.append(top, desc, meta, actions);
      list.appendChild(card);
    });
  }

  function editMaterial(item) {
    document.getElementById('content-id').value = item.id;
    document.getElementById('content-type').value = item.content_type;
    document.getElementById('content-title').value = item.title;
    document.getElementById('content-description').value = item.description || '';
    document.getElementById('content-body').value = item.content_body || '';
    document.getElementById('content-form-title').textContent = 'Edit material';
    document.getElementById('content-save').textContent = 'Save changes';
    document.getElementById('content-cancel').hidden = false;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function changePublication(item) {
    var nextStatus = item.status === 'published' ? 'unpublished' : 'published';
    var result = await context.supabase.from('academic_content')
      .update({ status: nextStatus, published_at: nextStatus === 'published' ? new Date().toISOString() : null })
      .eq('id', item.id).eq('teacher_id', context.profile.id);
    if (result.error) throw result.error;
    await load();
    setStatus(nextStatus === 'published' ? 'Material published for students.' : 'Material unpublished and hidden from students.', false);
  }

  async function load() {
    var result = await context.supabase.from('academic_content')
      .select('id, content_type, title, description, content_body, status, published_at, updated_at')
      .eq('teacher_id', context.profile.id).order('updated_at', { ascending: false });
    if (result.error) throw result.error;
    materials = result.data || [];
    render();
    if (!materials.length) setStatus('Create a draft, then publish it when students are ready to view it.', false);
    else setStatus(materials.length + ' learning material(s) in your library.', false);
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    var id = document.getElementById('content-id').value;
    var values = {
      teacher_id: context.profile.id,
      content_type: document.getElementById('content-type').value,
      title: document.getElementById('content-title').value.trim(),
      description: document.getElementById('content-description').value.trim() || null,
      content_body: document.getElementById('content-body').value.trim() || null
    };
    var save = document.getElementById('content-save');
    save.disabled = true;
    try {
      var result = id
        ? await context.supabase.from('academic_content').update(values).eq('id', id).eq('teacher_id', context.profile.id)
        : await context.supabase.from('academic_content').insert(Object.assign({}, values, { status: 'draft' }));
      if (result.error) throw result.error;
      clearForm();
      await load();
      setStatus(id ? 'Your changes were saved.' : 'Draft created. Publish it when it is ready for students.', false);
    } catch (error) {
      console.error('Unable to save academic content:', error);
      setStatus(error.message || 'Unable to save this material.', true);
    } finally {
      save.disabled = false;
    }
  });

  document.getElementById('content-cancel').addEventListener('click', clearForm);
  document.getElementById('content-filter').addEventListener('change', render);

  window.secureAccessPersonnelReady.then(function (value) {
    context = value;
    return load();
  }).catch(function (error) {
    console.error('Unable to load academic content:', error);
    setStatus(error.message || 'Unable to load your materials.', true);
  });
})();
