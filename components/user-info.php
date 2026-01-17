<?php
declare(strict_types=1);
require_once __DIR__ . '/../middleware/db.php';
?>
<p>Bonjour <strong><?= htmlspecialchars($user['email'] ?? '', ENT_QUOTES) ?></strong></p>

<form action="../middleware/auth.php" method="post" style="margin:1rem 0;">
    <input type="hidden" name="action" value="logout" />
    <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf, ENT_QUOTES) ?>" />
    <button type="submit">Se déconnecter</button>
</form>