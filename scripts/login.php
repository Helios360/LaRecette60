<?php
session_start();

$action   = $_GET['action'] ?? 'login';
$email    = trim($_GET['email'] ?? '');
$password = $_GET['password'] ?? '';
$adress   = trim($_GET['adress'] ?? '');

function redirect(string $url) {
    header("Location: $url");
    exit;
}
if ($action === 'login') { 
    $validEmail    = 'test@example.com'; // changer pour call bdd 
    $validPassword = '1234';// changer pour call bdd 

    if ($email === $validEmail && $password === $validPassword) {
        $_SESSION['user'] = [
            'email' => $email,
            'role'  => 'client'
        ];
        redirect('../views/account.php');
    } else {
        redirect('/?err=bad_credentials');
    }
} elseif ($action === 'register') {
    if ($email === '' || $password === '' || $adress === '') {
        redirect('/?err=missing_fields');
    }

    if (!isset($_SESSION['users'])) {
        $_SESSION['users'] = [];
    }
    $_SESSION['users'][$email] = [
        'email'   => $email,
        'password'=> $password,
        'adress'  => $adress,
        'role'    => 'client'
    ];
    // connexion direct
    $_SESSION['user'] = [
        'email' => $email,
        'role'  => 'client'
    ];
    // envoyer a la bdd
    redirect('../views/account.php');
} else {
    redirect('/');
}
