<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/auth.php';
start_secure_session();

$accessToken = $_SESSION['supabase_access_token'] ?? null;
if (is_string($accessToken) && $accessToken !== '') {
    try {
        $result = supabase_request('POST', '/auth/v1/logout?scope=local', $accessToken);
        if ($result['status'] < 200 || $result['status'] >= 300) {
            error_log('SecureAccess Supabase logout failed with HTTP ' . $result['status']);
        }
    } catch (Throwable $e) {
        error_log('SecureAccess Supabase logout error: ' . $e->getMessage());
    }
}

$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', $params['secure'], $params['httponly']);
}
session_destroy();
header('Location: ../auth/login.php');
exit;
