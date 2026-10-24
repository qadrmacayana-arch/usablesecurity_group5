<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/auth.php';

start_secure_session();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$accessToken = is_array($input) ? trim((string)($input['access_token'] ?? '')) : '';

if ($accessToken === '') {
    json_response(['ok' => false, 'message' => 'Authentication token is required.'], 401);
}

try {
    $userResult = supabase_request('GET', '/auth/v1/user', $accessToken);

    if ($userResult['status'] < 200 || $userResult['status'] >= 300 || empty($userResult['data']['id'])) {
        json_response(['ok' => false, 'message' => 'Authentication could not be verified.'], 401);
    }

    $userId = $userResult['data']['id'];
    $profilePath = '/rest/v1/profiles?id=eq.' . rawurlencode($userId) . '&select=id,student_id,staff_id,full_name,email,role,account_active';
    $profileResult = supabase_request('GET', $profilePath, $accessToken);

    if ($profileResult['status'] < 200 || $profileResult['status'] >= 300 || empty($profileResult['data'][0])) {
        json_response(['ok' => false, 'message' => 'Account profile could not be verified.'], 403);
    }

    $profile = $profileResult['data'][0];
    $role = (string)($profile['role'] ?? '');
    $active = $profile['account_active'] === true;

    if (!in_array($role, ['student', 'teacher', 'administrator'], true) || !$active) {
        json_response(['ok' => false, 'message' => 'This account is not authorized for the portal.'], 403);
    }

    session_regenerate_id(true);
    $_SESSION['user_id'] = $profile['id'];
    $_SESSION['role'] = $role;
    $_SESSION['account_active'] = true;
    $_SESSION['student_id'] = $profile['student_id'] ?? null;
    $_SESSION['staff_id'] = $profile['staff_id'] ?? null;
    $_SESSION['full_name'] = $profile['full_name'] ?? '';
    $_SESSION['email'] = $profile['email'] ?? ($userResult['data']['email'] ?? '');
    $_SESSION['supabase_access_token'] = $accessToken;

    json_response(['ok' => true, 'role' => $role]);
} catch (Throwable $e) {
    error_log('SecureAccess create-session error: ' . $e->getMessage());
    json_response(['ok' => false, 'message' => 'Unable to establish the secure server session.'], 500);
}
