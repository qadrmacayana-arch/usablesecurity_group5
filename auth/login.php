<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Login — SecureAccess Student Portal</title>
<link rel="stylesheet" href="../style/shared.css">
</head>
<body>
<div class="login-wrap">
  <div class="login-shell fade-in">
    <section class="login-intro">
      <div class="login-brand">
        <div class="login-brand-mark">
          <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
        </div>
        <div>
          <p class="login-brand-name">SecureAccess</p>
          <p class="login-brand-subtitle">Student Permission Portal</p>
        </div>
      </div>
      <div class="login-intro-copy">
        <p class="eyebrow">UNIVERSITY ACCESS MANAGEMENT</p>
        <h1>Access what you need.<br><span>With confidence.</span></h1>
        <p>Request, review, and monitor permissions through one transparent and secure workspace.</p>
      </div>
      <div class="login-trust-list">
        <div><span class="login-trust-icon">✓</span><span>Identity verification before access</span></div>
        <div><span class="login-trust-icon">✓</span><span>Clear approval and audit history</span></div>
      </div>
    </section>

    <section class="login-card">
      <div class="login-form-heading">
        <p class="eyebrow">WELCOME BACK</p>
        <h2>Sign in to your account</h2>
        <p>Use your university credentials to continue.</p>
      </div>

      <form id="login-form" onsubmit="handleLogin(event)" novalidate>
        <div class="login-field">
          <label class="lbl" for="login-email">University email</label>
          <input class="inp" type="email" id="login-email" placeholder="name@university.edu.ph" autocomplete="username" maxlength="254" required>
        </div>
        <div class="login-field">
          <div class="login-label-row">
            <label class="lbl" for="password">Password</label>
            <a href="#" class="login-help" onclick="return false;">Need help?</a>
          </div>
          <div class="password-wrap">
            <input class="inp" type="password" id="password" placeholder="Enter your password" autocomplete="current-password">
            <button type="button" onclick="togglePw()" class="password-toggle" id="pw-eye" aria-label="Show password">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7z"/></svg>
            </button>
          </div>
        </div>

        <div id="login-error" class="login-error" role="alert" aria-live="polite"></div>

        <button type="submit" class="btn btn-primary login-submit" id="login-btn">
          <span id="btn-text">Continue securely</span>
          <svg id="btn-spin" class="spin" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display:none;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
        </button>
      </form>

      <div class="login-demo-note">
        <strong>Prototype environment</strong>
        <span>Sign in with the university email and password registered to your account.</span>
      </div>

      <div class="login-footer">
        <span>Authorized personnel only</span><span>•</span><span>Sessions are monitored and logged</span>
      </div>
    </section>
  </div>
</div>
<script src="../script/supabase-client.js"></script>
<script src="../script/pages/login.js?v=20261017"></script>
</body>
</html>
