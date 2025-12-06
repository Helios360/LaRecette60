<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pâtisseries artisanales dans l'Oise | La Recette</title>
    <meta name="description" content="Pâtisseries artisanales dans l'Oise : number cakes, gâteaux à thèmes, petits fours sucrés/salés. Ingrédients de qualité et décors faits main. Commandez en ligne.">
    <link rel="canonical" href="https://www.larecette60.com/commander">
    <link rel="icon" href="/assets/images/larecetteIcon.ico">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="fr_FR">
    <meta property="og:title" content="Pâtisseries artisanales dans l'Oise | La Recette">
    <meta property="og:description" content="Number cakes, gâteaux à thèmes, petits fours sucrés/salés. Décors faits main.">
    <meta property="og:url" content="https://www.larecette60.com/">
    <meta property="og:image" content="https://www.larecette60.com/styles/images/larecette.webp">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="keywords" content="La recette, Larecette, larecette60, patisserie, oise, compiegne, recette, gourmandises, number cake, cake topper, gateaux a themes, petits fours, artisans, artisan, salé, sucré">
    <meta name="author" content="Hellios"> 
    <link rel="preload" as="image" href="/assets/images/boutique.webp">
    <link rel="stylesheet" href="/assets/stylesheets/main.css">
    <link rel="stylesheet" href="/assets/stylesheets/commander.css">
    <script src="../../scripts/main.js" defer></script>
</head>
<body>
    <?php include_once __DIR__ . "/../components/header.php"?>
    <main>
        <div class="hero">
            <div>
                <h1>Passer commande</h1>
                <h2>Faites une estimation/commande simple et rapide</h2>
            </div>
        </div>
        <div class="page-content">
            <a href="account"><h2 class="lisible"><u>Client régulier ? Connectez vous et profitez des avantages</u></h2></a>
            <div class="add">
                <div class="add1">
                    <h2 id="addShow">Ajouter un item</h2>
                    <form id="addItem" method="post" novalidate>
                        <div class="field">
                            <label for="type">Type de gateau</label>
                            <select name="type" id="type">
                                <option selected>Sélectionner</option>
                                <option value="gateau-a-theme">Gâteau à thème</option>
                                <option value="entremet">Entremet</option>

                                <option value="mignardises">Mignardises</option>
                                <option value="mini-donuts">Minis donuts</option>
                                <option value="cake-pops">Cake pops</option>
                                <option value="magnums-cakes">Magnums cakes</option>
                                <option value="cupcakes">Cupcakes individuels</option>
                                <option value="minis-cupcakes">Minis cupcakes</option>

                                <option value="classiques">Les Classiques</option>
                                <option value="number-cake">Number cake</option>
                                <option value="traiteur">Le Traiteur</option>

                            </select>
                        </div>
                    </form>
                </div>
                <form id="selectedForm" class="item">
                    <p id="checkoutMsg" aria-live="polite"></p>
                </form>
            </div>
            <div class="add">
                <h2>Panier :</h2>
                <div class="cart" id="cart">
                </div>
                <input type="email" id="user-email" placeholder="Entrez votre email . . .">
                <input type="Nom Prénom" id="user-name-fname" placeholder="Entrez votre Nom Prénom . . .">
                <input type="Adresse" id="user-adresse" placeholder="Entrez votre adresse . . .">
                <button type="button" id="send-cart" class="send-cart-btn">Envoyer le panier par e-mail</button>
                <p id="sendStatus" role="status" aria-live="polite"></p>
            </div>
        </div>
    </main>
    <?php include_once __DIR__ . "/../components/footer.php"?>
</body>
</html>