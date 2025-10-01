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
    
    <link rel="stylesheet" href="../styles/stylesheets/main.css">
    <link rel="stylesheet" href="../styles/stylesheets/commander.css">
    <script src="../scripts/account.js" defer></script>
</head>
<body>
    <?php include_once "components/header.php"?>
    <main>
        <div class="hero">
            <h2>📌 Espace compte</h2>
        </div>
        <div class="page-content">
            <div class="form-account">
                <form action="../scripts/login.php" method="get" id="connexion-form">
                    <input type="hidden" name="action" value="connexion">
                    <h2 class="lisible2">Connexion</h2>
                    <input type="email" name="email" placeholder="Adresse e-mail" required>
                    <input type="password" name="password" placeholder="Mot de passe" required>
                    <button type="submit">Se connecter</button>
                    <span style="display:flex;justify-content:space-between; color:var(--secondary)">
                        <a id="register"><u>S'enregistrer</u></a>
                        <a id="forgotten-pwd"><u>Mot de passe oublié ?</u></a>
                    </span>
                </form>
                <form action="../scripts/login.php" method="get" id="register-form">
                    <input type="hidden" name="action" value="register">
                    <h2 class="lisible2">Enregistrement</h2>
                    <input type="email" name="email" placeholder="Adresse e-mail" required>
                    <input type="password" name="password" placeholder="Mot de passe" required>
                    <input type="text" name="adress" placeholder="Adresse" required>
                    <button type="submit">S'enregistrer</button>
                    <span style="display:flex; justify-content:space-between; color:var(--secondary)">
                        <a id="connexion"><u>Se connecter</u></a>
                        <a id="forgotten-pwd"><u>Mot de passe oublié ?</u></a>
                    </span>
                </form>
                <a href="../scripts/logout.php">Logout</a>
            <div>
        </div>
    </main>
    <?php include_once "components/footer.php"?>
</body>
</html>