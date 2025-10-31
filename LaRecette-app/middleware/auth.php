<?php
session_start();
require_once __DIR__ . '/db.php';
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

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') redirect('/account?err=bad_credentials');

    $stmt = $pdo->prepare("SELECT * FROM Users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if(!$user || !password_verify($password, $user['password_hash'])) redirect('/account?err=bad_credentials');

    session_regenerate_id(true);

    $_SESSION['user'] = [
        'id' => (int)$user['id'],
        'email' => $user['email'],
        'role' => (int)$user['role'],
    ];

    if ($user['role'] == 1) {
        redirect('/admin-panel?ok=login');
    } else {redirect('/account?ok=login');}

} elseif ($action === 'register') {
    require_post();
    check_csrf();

    $street = trim((string)($_POST['street'] ?? ''));
    $street_num = trim((string)($_POST['street-number'] ?? ''));
    $city = trim((string)($_POST['city'] ?? ''));

    $email = trim((string)($_POST['email'] ?? ''));
    $password = (string)($_POST['password'] ?? '');
    $phone = trim((string)($_POST['phone'] ?? ''));
    $address = trim("$street_num $street, $city");

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '' || $address === '') redirect('/account?err=Il manque des champs');

    if (strlen($password) < 8) redirect('/account?err=weak_password');

    $stmt = $pdo->prepare('SELECT 1 FROM Users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) redirect('/account?err=email_taken');

    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare('INSERT INTO Users (email, password_hash, address, phone, role) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$email, $hash, $address, $phone, 0]);

    $userId = (int)$pdo->lastInsertId();
    session_regenerate_id(true);
    $_SESSION['user'] = [
        'id'    => $userId,
        'email' => $email,
        'role'  => 0,
    ];

    redirect('/account?ok=registered');

} elseif ($action === 'logout') {
    session_unset();
    session_destroy();
    redirect('/account?ok=logout');
} elseif ($action === 'sendMsg') {
    require_post();
    check_csrf();
    if(!isset($_SESSION['user'])) redirect('/account?err=login required');
    $userId=(int)$_SESSION['user']['id'];
    $mess=trim((string)($_POST['mess'] ?? ''));
    
    $stmt = $pdo->prepare('INSERT INTO Chats (user_id, msg) VALUES (?, ?)');
    $ok = $stmt->execute([$userId, $mess]);

    if (!$ok) redirect('/account?err=msg_insert_failed');
    redirect('/account?ok=msg_sent');

} else {
    redirect('/?err=unknown_action');
}

