<?php
declare(strict_types=1);

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => '',
    'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

$DB_DSN = 'pgsql:host=localhost;port=5432;dbname=test;';
$DB_USER = 'larecette';
$DB_PASS = '2004';

try{
    $pdo = new PDO($DB_DSN, $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    die($e->getMessage());
}

function redirect(string $url): never {
    header("Location: $url");
    exit;
}
function require_post(): void {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') redirect('/?err=method_not_allowed');
}
function check_csrf(): void {
    $token = $_POST['csrf'] ?? '';
    if (!isset($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], $token)) redirect('/?err=csrf');
}

$action = $_POST['action'] ?? '';

if ($action === 'login') {
    require_post();
    check_csrf();

    $email = trim((string)($_POST['email'] ?? ''));
    $password = (string)($_POST['password'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') redirect('/views/account.php?err=bad_credentials');

    $stmt = $pdo->prepare("SELECT id, email, password_hash FROM  users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if(!$user || !password_verify($password, $user['password_hash'])) redirect('/views/account.php?err=bad_credentials');

    session_regenerate_id(true);

    $_SESSION['user'] = [
        'id' => (int)$user['id'],
        'email' => $user['email'],
        'role' => $user['role'] ?: 'client',
    ];
    
    redirect('/views/account.php?ok=login');

} elseif ($action === 'register') {
    require_post();
    check_csrf();

    $email    = trim((string)($_POST['email'] ?? ''));
    $password = (string)($_POST['password'] ?? '');
    $address  = trim((string)($_POST['address'] ?? ''));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '' || $address === '') redirect('/views/account.php?err=missing_fields');

    if (strlen($password) < 8) redirect('/views/account.php?err=weak_password');

    $stmt = $pdo->prepare('SELECT 1 FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) redirect('/views/account.php?err=email_taken');

    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare('INSERT INTO users (email, password_hash, address, role) VALUES (?, ?, ?, ?)');
    $stmt->execute([$email, $hash, $address, 'client']);

    $userId = (int)$pdo->lastInsertId();
    session_regenerate_id(true);
    $_SESSION['user'] = [
        'id'    => $userId,
        'email' => $email,
        'role'  => 'client',
    ];

    redirect('/views/account.php?ok=registered');

} elseif ($action === 'logout') {
    session_unset();
    session_destroy();
    redirect('/?ok=logout');

} else {
    redirect('/?err=unknown_action');
}

