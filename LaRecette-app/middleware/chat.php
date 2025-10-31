<?php
declare(strict_types=1);
session_start();
require_once __DIR__ . '/db.php';

// CSRF
if (empty($_SESSION['csrf'])) {
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
}
$csrf = $_SESSION['csrf'];

// On force login pour associer user_id, sinon autoriser un pseudo anonyme (à toi de choisir)
$isAuth = isset($_SESSION['user']);
$userId = $isAuth ? (int)$_SESSION['user']['id'] : null;

// POST handling
$err = '';
$ok  = '';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && ($_POST['action'] ?? '') === 'send') {

    // CSRF
    $token = $_POST['csrf'] ?? '';
    if (!hash_equals($_SESSION['csrf'], $token)) {
        $err = 'csrf';
    } else {
        // Récup & contrôles
        $message = trim((string)($_POST['message'] ?? ''));
        if ($message === '') {
            $err = 'message_vide';
        } elseif (mb_strlen($message) > 2000) {
            $err = 'message_trop_long';
        } elseif (!$isAuth) {
            $err = 'login_requis';
        } else {
            // Insert
            $stmt = $pdo->prepare('INSERT INTO Chats (user_id, msg) VALUES (?, ?)');
            $ok = $stmt->execute([$userId, $message]) ? 'ok' : '';
            if (!$ok) $err = 'insert_fail';
        }
    }

    // PRG pattern
    $qs = http_build_query(array_filter(['ok' => $ok, 'err' => $err]));
    header('Location: '.$_SERVER['PHP_SELF'].($qs ? '?'.$qs : ''));
    exit;
}

// Récup messages + count
$total = (int)$pdo->query('SELECT COUNT(*) FROM Chats')->fetchColumn();

$stmt = $pdo->query(
    'SELECT c.id, c.msg, c.date_msg, u.email 
     FROM Chats c 
     JOIN Users u ON u.id = c.user_id 
     ORDER BY c.id DESC 
     LIMIT 100'
);
$messages = $stmt->fetchAll();

// petite fonction d’affichage date FR d/m/Y H:i
function fmt(string $ts): string {
    return date('d/m/Y H:i', strtotime($ts));
}

?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Tchat</title>
<link rel="stylesheet" href="chat.css">
</head>
<body>
<main class="container">
    <h1>Tchat</h1>

    <div class="meta">
        <strong><?= (int)$total ?></strong> message<?= $total>1?'s':'' ?> au total
        <?php if (isset($_GET['ok'])): ?><span class="badge success">Message envoyé</span><?php endif; ?>
        <?php if (isset($_GET['err'])): ?><span class="badge error">Erreur : <?= htmlspecialchars($_GET['err'], ENT_QUOTES) ?></span><?php endif; ?>
    </div>

    <?php if ($isAuth): ?>
    <form method="post" class="chat-form" autocomplete="off">
        <input type="hidden" name="action" value="send">
        <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf, ENT_QUOTES) ?>">
        <label class="sr-only" for="message">Votre message</label>
        <textarea id="message" name="message" rows="3" maxlength="2000" placeholder="Écrivez votre message…" required></textarea>
        <button type="submit">Envoyer</button>
    </form>
    <?php else: ?>
        <p class="info">Connectez-vous pour écrire dans le tchat.</p>
    <?php endif; ?>

    <section class="messages">
        <?php foreach ($messages as $m): ?>
            <article class="msg">
                <span class="author"><?= htmlspecialchars($m['email'] ?? 'Utilisateur', ENT_QUOTES) ?></span>
                <time datetime="<?= htmlspecialchars($m['date_msg']) ?>"><?= fmt($m['date_msg']) ?></time>
                <p><?= nl2br(htmlspecialchars($m['msg'], ENT_QUOTES)) ?></p>
            </article>
        <?php endforeach; ?>
        <?php if (!$messages): ?>
            <p class="empty">Aucun message pour le moment.</p>
        <?php endif; ?>
    </section>
</main>
</body>
</html>
