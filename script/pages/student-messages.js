(function () {
  'use strict';

  var context;
  var contacts = [];
  var messages = [];
  var profiles = {};

  function setStatus(text, isError) {
    var target = document.getElementById('student-message-status');
    target.textContent = text;
    target.classList.toggle('is-error', Boolean(isError));
  }

  function render() {
    var selected = document.getElementById('student-message-contact').value;
    var list = document.getElementById('student-message-list');
    list.textContent = '';
    var filtered = messages.filter(function (message) {
      return !selected || message.sender_id === selected || message.recipient_id === selected;
    });
    if (!filtered.length) {
      var empty = document.createElement('p');
      empty.className = 'personnel-muted';
      empty.textContent = selected ? 'No messages yet. Start the conversation below.' : 'Choose a staff contact to view the conversation.';
      list.appendChild(empty);
      return;
    }
    filtered.forEach(function (message) {
      var mine = message.sender_id === context.user.id;
      var item = document.createElement('article');
      item.className = 'personnel-message ' + (mine ? 'is-mine' : 'is-theirs');
      var meta = document.createElement('div');
      meta.className = 'personnel-message-meta';
      meta.textContent = (mine ? 'You' : (profiles[message.sender_id] || {}).full_name || 'Staff') +
        ' · ' + new Date(message.created_at).toLocaleString();
      var body = document.createElement('p'); body.textContent = message.body;
      item.append(meta, body); list.appendChild(item);
    });
    list.scrollTop = list.scrollHeight;
  }

  async function load() {
    var supabase = context.supabase;
    var staffResult = await supabase.from('profiles').select('id, full_name, role')
      .in('role', ['teacher', 'administrator']).eq('account_active', true).order('full_name');
    if (staffResult.error) throw staffResult.error;
    contacts = staffResult.data || [];
    contacts.forEach(function (contact) { profiles[contact.id] = contact; });
    var select = document.getElementById('student-message-contact');
    select.textContent = '';
    var placeholder = document.createElement('option');
    placeholder.value = ''; placeholder.textContent = contacts.length ? 'Choose a staff contact' : 'No active staff available';
    select.appendChild(placeholder);
    contacts.forEach(function (contact) {
      var option = document.createElement('option');
      option.value = contact.id;
      option.textContent = contact.full_name + (contact.role === 'administrator' ? ' · Administrator' : ' · Teacher');
      select.appendChild(option);
    });

    var result = await supabase.from('messages').select('id, sender_id, recipient_id, body, created_at, read_at')
      .or('sender_id.eq.' + context.user.id + ',recipient_id.eq.' + context.user.id)
      .order('created_at', { ascending: true });
    if (result.error) throw result.error;
    messages = result.data || [];
    var ids = [];
    messages.forEach(function (message) {
      [message.sender_id, message.recipient_id].forEach(function (id) {
        if (id !== context.user.id && !ids.includes(id)) ids.push(id);
      });
    });
    if (ids.length) {
      var profileResult = await supabase.from('profiles').select('id, full_name, role').in('id', ids);
      if (profileResult.error) throw profileResult.error;
      (profileResult.data || []).forEach(function (profile) { profiles[profile.id] = profile; });
    }
    var unreadIds = messages.filter(function (message) {
      return message.recipient_id === context.user.id && !message.read_at;
    }).map(function (message) { return message.id; });
    if (unreadIds.length) {
      var updateResult = await supabase.from('messages').update({ read_at: new Date().toISOString() })
        .in('id', unreadIds).eq('recipient_id', context.user.id);
      if (updateResult.error) throw updateResult.error;
    }
    render();
  }

  document.getElementById('student-message-contact').addEventListener('change', render);
  document.getElementById('student-message-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    var recipientId = document.getElementById('student-message-contact').value;
    var body = document.getElementById('student-message-body').value.trim();
    if (!recipientId) { setStatus('Choose a staff contact before sending.', true); return; }
    if (!body) return;
    var button = document.getElementById('student-message-send');
    button.disabled = true;
    try {
      var result = await context.supabase.from('messages').insert({
        sender_id: context.user.id, recipient_id: recipientId, body: body
      });
      if (result.error) throw result.error;
      document.getElementById('student-message-body').value = '';
      await load();
      setStatus('Message sent.', false);
    } catch (error) {
      console.error('Unable to send student message:', error);
      setStatus(error.message || 'Unable to send your message.', true);
    } finally {
      button.disabled = false;
    }
  });

  (async function init() {
    try {
      var supabase = await window.secureAccessSupabaseReady;
      var sessionResult = await supabase.auth.getSession();
      if (sessionResult.error) throw sessionResult.error;
      if (!sessionResult.data.session) throw new Error('Your session has expired. Please sign in again.');
      var profileResult = await supabase.from('profiles').select('id, role, account_active')
        .eq('id', sessionResult.data.session.user.id).single();
      if (profileResult.error) throw profileResult.error;
      if (profileResult.data.role !== 'student' || !profileResult.data.account_active) {
        throw new Error('An active student account is required.');
      }
      context = { supabase: supabase, user: sessionResult.data.session.user };
      await load();
      setStatus(contacts.length + ' available staff contact(s).', false);
    } catch (error) {
      console.error('Unable to load student messages:', error);
      setStatus(error.message || 'Unable to load your messages.', true);
    }
  })();
})();
