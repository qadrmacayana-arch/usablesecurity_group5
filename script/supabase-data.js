(function () {
  function getClient() {
    if (window.secureAccessSupabaseReady) {
      return window.secureAccessSupabaseReady;
    }

    var script = document.createElement('script');
    script.src = '../script/supabase-client.js';
    script.async = true;
    document.head.appendChild(script);
    return new Promise(function (resolve, reject) {
      script.addEventListener('load', function () {
        if (window.secureAccessSupabaseReady) {
          window.secureAccessSupabaseReady.then(resolve).catch(reject);
        } else {
          reject(new Error('Supabase client did not initialize.'));
        }
      });
      script.addEventListener('error', function () {
        reject(new Error('Unable to load Supabase client.'));
      });
    });
  }

  window.secureAccessData = {
    getClient: getClient,
    getSession: async function () {
      var client = await getClient();
      var result = await client.auth.getSession();
      if (result.error) throw result.error;
      return { client: client, session: result.data.session };
    },
    getProfile: async function () {
      var state = await this.getSession();
      if (!state.session) return { client: state.client, session: null, profile: null };
      var result = await state.client
        .from('profiles')
        .select('id, student_id, full_name, email, institution, program, year_level, clearance_level, role, account_active')
        .eq('id', state.session.user.id)
        .maybeSingle();
      if (result.error) throw result.error;
      return { client: state.client, session: state.session, profile: result.data };
    },
    getRequests: async function () {
      var state = await this.getSession();
      if (!state.session) return [];
      var result = await state.client
        .from('access_requests')
        .select('id, request_number, permission, duration, urgency, justification, status, decision_reason, submitted_at, decided_at, resources(name, category, sensitivity)')
        .order('submitted_at', { ascending: false });
      if (result.error) throw result.error;
      return result.data || [];
    },
    getAuditLogs: async function () {
      var state = await this.getSession();
      if (!state.session) return [];
      var result = await state.client
        .from('audit_logs')
        .select('id, action, category, resource_name, outcome, metadata, created_at, actor:actor_id(full_name, role), subject:subject_id(full_name, student_id)')
        .order('created_at', { ascending: false });
      if (result.error) throw result.error;
      return result.data || [];
    }
  };
})();
