/*
 * Supabase browser client
 *
 * This key is intended for browser use. Never put a service_role key in
 * this file. Database access must still be restricted with RLS policies.
 */
(function () {
  var SUPABASE_URL = 'https://hxzwypdepseficyrnbhd.supabase.co';
  var SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_s5hQ970ey0OtCLRGsHPLZg_yRs-lCsQ';
  var CDN_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

  function loadSdk() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      return Promise.resolve(window.supabase);
    }

    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = CDN_URL;
      script.async = true;
      script.onload = function () {
        if (!window.supabase || typeof window.supabase.createClient !== 'function') {
          reject(new Error('Supabase SDK loaded without its client factory.'));
          return;
        }
        resolve(window.supabase);
      };
      script.onerror = function () {
        reject(new Error('Unable to load the Supabase browser SDK.'));
      };
      document.head.appendChild(script);
    });
  }

  window.secureAccessSupabaseReady = loadSdk().then(function (sdk) {
    var client = sdk.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    window.secureAccessSupabase = client;
    return client;
  });
})();
