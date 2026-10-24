(function () {
  'use strict';

  var supabase;
  var profile;
  var profiles = {};
  var messages = [];

  function setStatus(text, isError) {
    var target = document.getElementById('admin-direct-message-status');
    target.textContent = text;
    target.classList.toggle('is-error', Boolean(isError));
  }

  function render() {
    var list = document.getElementById('admin-direct-message-list');
    list.textContent = '';
    if (!messages.length) {
      var empty = document.createElement('p');
      empty.className = 'personnel-muted';
      empty.textContent = 'No direct messages yet.';
      list.appendChild(empty);
      return;
    }
    messages.forEach(function (message) {
      var item = document.createElement('article');
      item.className = 'admin-direct-message-item';
      var meta = document.createElement('div');
      meta.className = 'personnel-message-meta';
      var sender = (profiles[message.sender_id] || {}).full_name || 'Account';
      var recipient = (profiles[message.recipient_id] || {}).full_name || 'Account';
      meta.textContent = sender + ' → ' + recipient + ' · ' + new Date(message.created_at).toLocaleString();
      var body = document.createElement('p');
      body.textContent = message.body;
      item.append(meta, body);
      if (message.recipient_id === profile.id && !message.read_at) {
        var unread = document.createElement('span');
        unread.className = 'badge b-blue';
        unread.textContent = 'Unread';
        item.appendChild(unread);
      }
      list.appendChild(item);
    });
  }

  async function load() {
    var profileResult = await supabase.from('profiles')
      .select('id, full_name, role, account_active').eq('id', profile.id).single();
    if (profileResult.error) throw profileResult.error;
    if (profileResult.data.role !== 'administrator' || !profileResult.data.account_active) {
      throw new Error('An active administrator account is required.');
    }
    var contactsResult = await supabase.from('profiles')
      .select('id, full_name, role').eq('account_active', true).order('full_name');
    if (contactsResult.error) throw contactsResult.error;
    var select = document.getElementById('admin-message-recipient');
    select.textContent = '';
    var placeholder = document.createElement('option');
    placeholder.value = ''; placeholder.textContent = 'Select a student or teacher'; placeholder.disabled = true; placeholder.selected = true;
    select.appendChild(placeholder);
    (contactsResult.data || []).filter(function (contact) { return contact.id !== profile.id; }).forEach(function (contact) {
      profiles[contact.id] = contact;
      var option = document.createElement('option');
      option.value = contact.id;
      option.textContent = contact.full_name + (contact.role === 'teacher' ? ' · Teacher' : ' · Student');
      select.appendChild(option);
    });
    profiles[profile.id] = profileResult.data;

    var result = await supabase.from('messages')
      .select('id, sender_id, recipient_id, body, created_at, read_at')
      .order('created_at', { ascending: false }).limit(100);
    if (result.error) throw result.error;
    messages = result.data || [];
    var ids = [];
    messages.forEach(function (message) {
      [message.sender_id, message.recipient_id].forEach(function (id) {
        if (!profiles[id] && !ids.includes(id)) ids.push(id);
      });
    });
    if (ids.length) {
      var profileResult = await supabase.from('profiles').select('id, full_name, role').in('id', ids);
      if (profileResult.error) throw profileResult.error;
      (profileResult.data || []).forEach(function (person) { profiles[person.id] = person; });
    }
    var unreadIds = messages.filter(function (message) {
      return message.recipient_id === profile.id && !message.read_at;
    }).map(function (message) { return message.id; });
    if (unreadIds.length) {
      var readResult = await supabase.from('messages').update({ read_at: new Date().toISOString() })
        .in('id', unreadIds).eq('recipient_id', profile.id);
      if (readResult.error) throw readResult.error;
    }
    render();
  }

  document.getElementById('admin-direct-message-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    var recipientId = document.getElementById('admin-message-recipient').value;
    var body = document.getElementById('admin-direct-message-body').value.trim();
    if (!recipientId || !body) return;
    var button = document.getElementById('admin-direct-message-send');
    button.disabled = true;
    try {
      var result = await supabase.from('messages').insert({
        sender_id: profile.id, recipient_id: recipientId, body: body
      });
      if (result.error) throw result.error;
      document.getElementById('admin-direct-message-body').value = '';
      await load();
      setStatus('Message sent.', false);
    } catch (error) {
      console.error('Unable to send administrator message:', error);
      setStatus(error.message || 'Unable to send your message.', true);
    } finally {
      button.disabled = false;
    }
  });

  (async function init() {
    try {
      supabase = await window.secureAccessSupabaseReady;
      var sessionResult = await supabase.auth.getSession();
      if (sessionResult.error) throw sessionResult.error;
      if (!sessionResult.data.session) throw new Error('Your session has expired. Please sign in again.');
      profile = { id: sessionResult.data.session.user.id };
      await load();
      setStatus(messages.length + ' recent direct message(s).', false);
    } catch (error) {
      console.error('Unable to load administrator conversations:', error);
      setStatus(error.message || 'Unable to load direct messages.', true);
    }
  })();
})();
