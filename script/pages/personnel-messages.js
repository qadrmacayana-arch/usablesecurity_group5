(function () {
  'use strict';

  var context;
  var contacts = [];
  var messages = [];
  var profiles = {};

  function setStatus(text, isError) {
    var target = document.getElementById('personnel-message-status');
    target.textContent = text;
    target.classList.toggle('is-error', Boolean(isError));
  }

  function populateContacts() {
    var select = document.getElementById('message-contact');
    var previous = select.value;
    select.textContent = '';
    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = contacts.length ? 'Choose a conversation' : 'No contacts available';
    select.appendChild(placeholder);
    contacts.forEach(function (contact) {
      var option = document.createElement('option');
      option.value = contact.id;
      option.textContent = contact.full_name + (contact.role === 'administrator' ? ' · Administrator' : ' · Student');
      select.appendChild(option);
    });
    if (contacts.some(function (contact) { return contact.id === previous; })) select.value = previous;
    else if (contacts.length) select.value = contacts[0].id;
  }

  function renderMessages() {
    var activeContact = document.getElementById('message-contact').value;
    var list = document.getElementById('personnel-message-list');
    list.textContent = '';
    var filtered = messages.filter(function (message) {
      return !activeContact || message.sender_id === activeContact || message.recipient_id === activeContact;
    });
    if (!filtered.length) {
      var empty = document.createElement('p');
      empty.className = 'personnel-muted';
      empty.textContent = activeContact ? 'No messages in this conversation yet. Send the first one below.' : 'Choose a contact to start a conversation.';
      list.appendChild(empty);
      return;
    }
    filtered.forEach(function (message) {
      var mine = message.sender_id === context.profile.id;
      var item = document.createElement('article');
      item.className = 'personnel-message ' + (mine ? 'is-mine' : 'is-theirs');
      var meta = document.createElement('div');
      meta.className = 'personnel-message-meta';
      meta.textContent = (mine ? 'You' : (profiles[message.sender_id] || {}).full_name || 'Contact') +
        ' · ' + new Date(message.created_at).toLocaleString();
      var body = document.createElement('p');
      body.textContent = message.body;
      item.append(meta, body);
      list.appendChild(item);
    });
    list.scrollTop = list.scrollHeight;
  }

  async function loadContacts() {
    var supabase = context.supabase;
    var requestResult = await supabase.from('access_requests').select('requester_id')
      .eq('recipient_id', context.profile.id);
    if (requestResult.error) throw requestResult.error;
    var gradeResult = await supabase.from('grades').select('student_id')
      .eq('teacher_id', context.profile.id);
    if (gradeResult.error) throw gradeResult.error;
    var conversationsResult = await supabase.from('messages')
      .select('sender_id, recipient_id')
      .or('sender_id.eq.' + context.profile.id + ',recipient_id.eq.' + context.profile.id);
    if (conversationsResult.error) throw conversationsResult.error;
    var adminResult = await supabase.from('profiles').select('id, full_name, role')
      .eq('role', 'administrator').eq('account_active', true);
    if (adminResult.error) throw adminResult.error;

    var ids = [];
    (requestResult.data || []).concat(gradeResult.data || [], conversationsResult.data || []).forEach(function (row) {
      var id = row.requester_id || row.student_id;
      if (!id) {
        id = row.sender_id === context.profile.id ? row.recipient_id : row.sender_id;
      }
      if (id && !ids.includes(id)) ids.push(id);
    });
    var studentResult = ids.length
      ? await supabase.from('profiles').select('id, full_name, role').in('id', ids).order('full_name')
      : { data: [], error: null };
    if (studentResult.error) throw studentResult.error;
    contacts = (adminResult.data || []).concat((studentResult.data || []).filter(function (contact) {
      return contact.role === 'student';
    }));
    contacts.forEach(function (contact) { profiles[contact.id] = contact; });
    populateContacts();
  }

  async function loadMessages() {
    var result = await context.supabase.from('messages')
      .select('id, sender_id, recipient_id, body, created_at, read_at')
      .or('sender_id.eq.' + context.profile.id + ',recipient_id.eq.' + context.profile.id)
      .order('created_at', { ascending: true });
    if (result.error) throw result.error;
    messages = result.data || [];
    var ids = [];
    messages.forEach(function (message) {
      [message.sender_id, message.recipient_id].forEach(function (id) {
        if (id !== context.profile.id && !ids.includes(id)) ids.push(id);
      });
    });
    if (ids.length) {
      var profilesResult = await context.supabase.from('profiles').select('id, full_name, role').in('id', ids);
      if (profilesResult.error) throw profilesResult.error;
      (profilesResult.data || []).forEach(function (profile) { profiles[profile.id] = profile; });
    }
    var unreadIds = messages.filter(function (message) {
      return message.recipient_id === context.profile.id && !message.read_at;
    }).map(function (message) { return message.id; });
    if (unreadIds.length) {
      var readResult = await context.supabase.from('messages')
        .update({ read_at: new Date().toISOString() }).in('id', unreadIds)
        .eq('recipient_id', context.profile.id);
      if (readResult.error) throw readResult.error;
    }
    renderMessages();
  }

  document.getElementById('message-contact').addEventListener('change', renderMessages);
  document.getElementById('personnel-message-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    var recipientId = document.getElementById('message-contact').value;
    var body = document.getElementById('personnel-message-body').value.trim();
    if (!recipientId) {
      setStatus('Choose a contact before sending a message.', true);
      return;
    }
    if (!body) return;
    var button = document.getElementById('personnel-message-send');
    button.disabled = true;
    try {
      var result = await context.supabase.from('messages').insert({
        sender_id: context.profile.id, recipient_id: recipientId, body: body
      });
      if (result.error) throw result.error;
      document.getElementById('personnel-message-body').value = '';
      await loadMessages();
      setStatus('Message sent.', false);
    } catch (error) {
      console.error('Unable to send faculty message:', error);
      setStatus(error.message || 'Unable to send your message.', true);
    } finally {
      button.disabled = false;
    }
  });

  window.secureAccessPersonnelReady.then(async function (value) {
    context = value;
    await loadContacts();
    await loadMessages();
    setStatus(contacts.length + ' available contact(s).', false);
  }).catch(function (error) {
    console.error('Unable to load faculty messages:', error);
    setStatus(error.message || 'Unable to load your messages.', true);
  });
})();
