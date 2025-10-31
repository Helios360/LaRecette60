<?php
declare(strict_types=1);
require_once __DIR__ . '/../middleware/db.php';

$totalMsg = (int)$pdo->query('SELECT COUNT(*) FROM Chats')->fetchColumn();
$stmt= $pdo->query(
    'SELECT c.id, c.msg, c.date_msg, u.email
     FROM Chats c
     JOIN Users u ON u.id = c.user_id
     ORDER BY c.id DESC
     LIMIT 100'
);
$chatRows= $stmt->fetchAll();
function fmt_fr(string $ts): string{
    return date('d/m/Y H:i', strtotime($ts));
}

?>
<p>Bonjour <strong><?= htmlspecialchars($user['email'] ?? '', ENT_QUOTES) ?></strong></p>

<!-- Bouton logout : visible uniquement si connecté -->
<form action="../middleware/auth.php" method="post" style="margin:1rem 0;">
    <input type="hidden" name="action" value="logout" />
    <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf, ENT_QUOTES) ?>" />
    <button type="submit">Se déconnecter</button>
</form>

<section class="chat-card">
    <header class="chat-head">
        <h3 style="margin:0">Tchat global</h3>
        <span class="chat-count"><?= $totalMsg ?> message<?= $totalMsg>1?'s':'' ?></span>
        <?php if (!empty($_GET['ok'])): ?><span class="chat-badge ok">Message envoyé</span><?php endif; ?>
        <?php if (!empty($_GET['err'])): ?><span class="chat-badge err">Erreur : <?= htmlspecialchars($_GET['err'], ENT_QUOTES) ?></span><?php endif; ?>
    </header>

    <form action="../middleware/auth.php" method="post" class="chat-form" autocomplete="off">
        <input type="hidden" name="action" value="sendMsg" />
        <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf, ENT_QUOTES) ?>" />
        <textarea name="mess" rows="3" maxlength="2000" placeholder="Entrez votre message…" required></textarea>
        <button type="submit">Envoyer</button>
    </form>

    <div id="chat-feed" class="chat-feed">
        <?php if ($chatRows): ?>
            <?php foreach ($chatRows as $m): ?>
                <article class="chat-item">
                    <span class="author"><?= htmlspecialchars($m['email'] ?? 'Utilisateur', ENT_QUOTES) ?></span>
                    <time datetime="<?= htmlspecialchars($m['date_msg'], ENT_QUOTES) ?>">
                        <?= fmt_fr($m['date_msg']) ?>
                    </time>
                    <p><?= nl2br(htmlspecialchars($m['msg'], ENT_QUOTES)) ?></p>
                </article>
            <?php endforeach; ?>
        <?php else: ?>
            <p class="chat-empty">Aucun message pour le moment.</p>
        <?php endif; ?>
    </div>
</section>