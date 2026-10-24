<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/auth.php';

start_secure_session();

function is_local_demo_host(): bool
{
    $host = (string)($_SERVER['HTTP_HOST'] ?? '');
    $hostname = strtolower((string)parse_url('http://' . $host, PHP_URL_HOST));
    return in_array($hostname, ['localhost', '127.0.0.1', '::1'], true);
}

function get_student_identity(string $accessToken): array
{
    $userResult = supabase_request('GET', '/auth/v1/user', $accessToken);
    if (
        $userResult['status'] < 200 ||
        $userResult['status'] >= 300 ||
        empty($userResult['data']['id'])
    ) {
        json_response(['ok' => false, 'message' => 'Your sign-in expired. Please sign in again.'], 401);
    }

    $user = $userResult['data'];
    $profilePath = '/rest/v1/profiles?id=eq.' . rawurlencode((string)$user['id']) .
        '&select=id,student_id,staff_id,full_name,email,role,account_active';
    $profileResult = supabase_request('GET', $profilePath, $accessToken);
    if (
        $profileResult['status'] < 200 ||
        $profileResult['status'] >= 300 ||
        empty($profileResult['data'][0])
    ) {
        json_response(['ok' => false, 'message' => 'Your account profile could not be verified.'], 403);
    }

    $profile = $profileResult['data'][0];
    if (
        ($profile['role'] ?? '') !== 'student' ||
        ($profile['account_active'] ?? false) !== true
    ) {
        json_response(['ok' => false, 'message' => 'An active student account is required.'], 403);
    }

    return [$user, $profile];
}

if (!is_local_demo_host()) {
    json_response([
        'ok' => false,
        'message' => 'The popup verification code is for local demos only. Configure real email OTP before deployment.'
    ], 403);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['ok' => false, 'message' => 'Method not allowed.'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$action = is_array($input) ? (string)($input['action'] ?? '') : '';
$accessToken = is_array($input) ? trim((string)($input['access_token'] ?? '')) : '';

if (!in_array($action, ['issue', 'verify'], true) || $accessToken === '') {
    json_response(['ok' => false, 'message' => 'A valid action and authenticated session are required.'], 400);
}

try {
    [$user, $profile] = get_student_identity($accessToken);
    $userId = (string)$user['id'];

    if ($action === 'issue') {
        $previous = $_SESSION['demo_otp'] ?? null;
        if (
            !(is_array($input) && ($input['new_login'] ?? false) === true) &&
            is_array($previous) &&
            ($previous['user_id'] ?? '') === $userId &&
            time() - (int)($previous['issued_at'] ?? 0) < 30
        ) {
            json_response([
                'ok' => false,
                'message' => 'Please wait 30 seconds before requesting another demo code.'
            ], 429);
        }

        $code = (string)random_int(100000, 999999);
        $issuedAt = time();
        $_SESSION['demo_otp'] = [
            'user_id' => $userId,
            'hash' => password_hash($code, PASSWORD_DEFAULT),
            'issued_at' => $issuedAt,
            'expires_at' => $issuedAt + 300,
            'attempts' => 0
        ];

        json_response([
            'ok' => true,
            'code' => $code,
            'expires_at' => $issuedAt + 300
        ]);
    }

    $challenge = $_SESSION['demo_otp'] ?? null;
    $code = is_array($input) ? trim((string)($input['code'] ?? '')) : '';
    if (!is_array($challenge) || ($challenge['user_id'] ?? '') !== $userId) {
        json_response(['ok' => false, 'message' => 'No active demo code. Request a new code.'], 401);
    }

    if (time() >= (int)$challenge['expires_at']) {
        unset($_SESSION['demo_otp']);
        json_response(['ok' => false, 'message' => 'The demo code expired. Request a new code.'], 410);
    }

    if ((int)$challenge['attempts'] >= 5) {
        unset($_SESSION['demo_otp']);
        json_response(['ok' => false, 'message' => 'Too many incorrect attempts. Sign in again to request a new code.'], 429);
    }

    if (!preg_match('/^\d{6}$/', $code) || !password_verify($code, (string)$challenge['hash'])) {
        $_SESSION['demo_otp']['attempts'] = (int)$challenge['attempts'] + 1;
        json_response(['ok' => false, 'message' => 'That code is incorrect. Try again.'], 400);
    }

    unset($_SESSION['demo_otp']);
    session_regenerate_id(true);
    $_SESSION['user_id'] = $profile['id'];
    $_SESSION['role'] = 'student';
    $_SESSION['account_active'] = true;
    $_SESSION['student_id'] = $profile['student_id'] ?? null;
    $_SESSION['staff_id'] = $profile['staff_id'] ?? null;
    $_SESSION['full_name'] = $profile['full_name'] ?? '';
    $_SESSION['email'] = $profile['email'] ?? ($user['email'] ?? '');
    $_SESSION['supabase_access_token'] = $accessToken;

    json_response(['ok' => true, 'role' => 'student']);
} catch (Throwable $e) {
    error_log('SecureAccess demo OTP error: ' . $e->getMessage());
    json_response(['ok' => false, 'message' => 'Unable to process demo verification. Please try again.'], 500);
}
