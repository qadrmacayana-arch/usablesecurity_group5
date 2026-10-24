<?php
declare(strict_types=1);

const SUPABASE_URL = 'https://hxzwypdepseficyrnbhd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_s5hQ970ey0OtCLRGsHPLZg_yRs-lCsQ';

function start_secure_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    session_set_cookie_params([
        'httponly' => true,
        'secure' => false, // Set true when deployed over HTTPS.
        'samesite' => 'Lax',
        'path' => '/',
    ]);

    session_start();
}

function json_response(array $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}

function supabase_request(string $method, string $path, ?string $accessToken = null, ?array $body = null): array
{
    $url = SUPABASE_URL . $path;
    $headers = [
        'apikey: ' . SUPABASE_PUBLISHABLE_KEY,
        'Content-Type: application/json',
    ];

    if ($accessToken) {
        $headers[] = 'Authorization: Bearer ' . $accessToken;
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 15,
    ]);

    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }

    $responseBody = curl_exec($ch);
    $curlError = curl_error($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($responseBody === false || $curlError) {
        throw new RuntimeException('Unable to contact the authentication service.');
    }

    $decoded = json_decode($responseBody, true);

    return [
        'status' => $status,
        'data' => $decoded,
        'raw' => $responseBody,
    ];
}

function require_role(string $requiredRole): void
{
    start_secure_session();

    if (empty($_SESSION['user_id']) || empty($_SESSION['role'])) {
        header('Location: ../auth/login.php');
        exit;
    }

    if ($_SESSION['role'] !== $requiredRole) {
        http_response_code(403);
        header('Content-Type: text/html; charset=utf-8');
        echo '<!doctype html><html><head><meta charset="utf-8"><title>403 Access Denied</title></head><body style="font-family:Arial,sans-serif;padding:40px"><h1>403 — Access Denied</h1><p>You are not authorized to access this area.</p></body></html>';
        exit;
    }

    if (isset($_SESSION['account_active']) && $_SESSION['account_active'] !== true) {
        session_unset();
        session_destroy();
        header('Location: ../auth/login.php');
        exit;
    }
}
