<?php
declare(strict_types=1);

use App\Model\Database;
use App\Controller\Session;
use App\Model\UserModel;
use InvalidArgumentException;
use RuntimeException;

function redirect(string $url): never {
    header('Location: ' . $url);
    exit;
}

function require_post(): void {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') redirect('/?err=method_not_allowed');
}

$session = new Session();

function check_csrf(): void {
    $token = $_POST['csrf'] ?? '';
    if(!isset($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], $token)) redirect('/?err=csrf');
}

try {
    $database = Database::fromEnv();
} catch (RuntimeException $e) {
    http_response_code(500);
    exit('DB Error');
}

$AuthSession = new UserModel($database, $session);

$res = openssl_pkey_new();
openssl_pkey_export($res, $privateKey);
$publickey = openssl_pkey_get_details($res);
$publickey = $publickey['key'] ?? null;

// ACTION ROUTES
$action = $_POST['action'] ?? '';
if ($action === 'login'){
    require_post();
    check_csrf();

    $email = (string)($_POST['email'] ?? '');
    $password = (string)($_POST['password'] ?? '');

    try {
        $user = $AuthSession->login($email, $password);
    } catch (InvalidArgumentException $e) {
        redirect('/account?err='.urlencode($e->getMessage()));
    }

    if (($session->get('user_role') ?? 0) === 1) redirect('/admin-panel?ok=login');
    redirect('/account?ok=login');


} elseif ( $action === 'logout') {
    $AuthSession->logout();
    redirect('/account?ok=logout');
} else {
    redirect('/?err=unknown_action');
}