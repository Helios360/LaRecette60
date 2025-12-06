<?php
declare(strict_types=1);
session_start();

if (empty($_SESSION['csrf'])) {
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
}
$csrf = $_SESSION['csrf'];
$isAuth = isset($_SESSION['user']);
$user = $_SESSION['user'] ?? null;

$err = $_GET['err'] ?? '';
$ok = $_GET['ok'] ?? '';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pâtisseries artisanales dans l'Oise | La Recette</title>
    <meta name="description" content="Pâtisseries artisanales dans l'Oise : number cakes, gâteaux à thèmes, petits fours sucrés/salés. Ingrédients de qualité et décors faits main. Commandez en ligne.">
    <link rel="canonical" href="https://www.larecette60.com/index">
    <link rel="icon" href="../styles/images/larecetteIcon.ico">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="fr_FR">
    <meta property="og:title" content="Pâtisseries artisanales dans l'Oise | La Recette">
    <meta property="og:description" content="Number cakes, gâteaux à thèmes, petits fours sucrés/salés. Décors faits main.">
    <meta property="og:url" content="https://www.larecette60.com/">
    <meta property="og:image" content="https://www.larecette60.com/styles/images/larecette.webp">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="keywords" content="La recette, Larecette, larecette60, patisserie, oise, compiegne, recette, gourmandises, number cake, cake topper, gateaux a themes, petits fours, artisans, artisan, salé, sucré">
    <meta name="author" content="LaRecette"> 
    <link rel="preload" as="image" href="../styles/images/boutique.webp">
    
    <link rel="stylesheet" href="/assets/stylesheets/main.css">
    <link rel="stylesheet" href="/assets/stylesheets/commander.css">
    <script src="../scripts/account.js" defer></script>
</head>
<body>
    <?php include_once __DIR__ . "/../components/header.php"?>
    <main>
        <div class="hero">
            <!--<h1>📌 Espace compte</h1>-->
            <h1>Page en construction !</h1>
        </div>
        <div class="page-content">
            <?php if ($err): ?>
                <div class="alert error">Erreur : <?= htmlspecialchars($err, ENT_QUOTES) ?></div>
            <?php endif; ?>
            <?php if ($ok): ?>
                <div class="alert success">Succés : <?= htmlspecialchars($ok, ENT_QUOTES) ?></div>
            <?php endif; ?>
            <?php if ($isAuth):?>
                <section class="dashboard">
                <?php include_once __DIR__ . "/../components/CRUD.php"?>
                </section>
            <?php else :?>
            <div class="form-account">
                <form method="post" id="connexion-form" autocomplete="on" novalidate>
                    <input type="hidden" name="action" value="login" />
                    <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf, ENT_QUOTES) ?>" />
                    <h2 class="lisible2">Connexion</h2>
                    <input type="email" name="email" placeholder="Adresse e-mail" required />
                    <input type="password" name="password" placeholder="Mot de passe" required />
                    <button type="submit">Se connecter</button>
                    <span style="display:flex;justify-content:space-between;color:var(--secondary)">
                    <a id="register"><u>S'enregistrer</u></a>
                    <a id="forgotten-pwd"><u>Mot de passe oublié ?</u></a>
                    </span>
                </form>
                <form method="post" id="register-form" autocomplete="on" novalidate>
                    <input type="hidden" name="action" value="register" />
                    <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf, ENT_QUOTES) ?>" />
                    <h2 class="lisible2">Enregistrement</h2>
                    <input type="email" name="email" placeholder="Adresse e-mail" required />
                    <input type="password" name="password" placeholder="Mot de passe (min. 8)" required />
                    <input type="text" name="street-number" placeholder="Numéro de rue" required />
                    <input type="text" name="street" placeholder="Rue" required />
                    <input type="text" name="city" placeholder="Ville" required />
                    <input type="number" name="tel" placeholder="Numéro de téléphone" required /> 
                    <button type="submit">S'enregistrer</button>
                    <span style="display:flex;justify-content:space-between;color:var(--secondary)">
                    <a id="connexion"><u>Se connecter</u></a>
                    <a id="forgotten-pwd"><u>Mot de passe oublié ?</u></a>
                    </span>
                </form>
            <div>
            <?php endif; ?>
        </div>
    </main>
    <?php include_once __DIR__ . "/../components/footer.php"?>
</body>
</html>