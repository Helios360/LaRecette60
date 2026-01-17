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
        <div class="hero" style="--hero-bg: url('../images/boutique-irl.webp')">
            <div>
                <h1>Passer commande</h1>
            </div>
        </div>
        <div class="page-content">
            <!--<a href="account"><h2 class="lisible"><u>Client régulier ? Connectez vous !</u></h2></a>-->
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
                <hr>
                <input type="email" id="user-email" placeholder="*Entrez votre email . . ." autocomplete="email" required>
                <input type="tel" id="user-phone" placeholder="*Entrez votre numéro . . ." autocomplete="tel" required>
                <input type="text" id="user-name" placeholder="*Entrez votre Nom . . ." autocomplete="family-name" required>
                <input type="text" id="user-fname" placeholder="*Entrez votre Prénom . . ." autocomplete="given-name" required>
                <select name="retrieval" id="retrieval" required>
                    <option value="" disabled>Séléctionnez un créneau horaire pour venir chercher la commande</option>
                    <option value="11h-12h">11h-12h</option>
                    <option value="15h-16h">15h-16h</option>
                </select>
                <hr>
                <p>Vous pouvez ci-dessous lier des images qui représentent vos besoins</p>
                <div class="file-upload">
                    <input type="file" id="user-file-1" class="file-input" accept="image/*">
                    <label for="user-file-1" class="file-label">Ajouter une 1ere photo</label>
                    <span class="file-name" id="file-name-1">Aucun fichier sélectionné</span>
                </div>
                <div class="file-upload">
                    <input type="file" id="user-file-2" class="file-input" accept="image/*">
                    <label for="user-file-2" class="file-label">Ajouter une 2eme photo</label>
                    <span class="file-name" id="file-name-2">Aucun fichier sélectionné</span>
                </div>
                <div class="file-upload">
                    <input type="file" id="user-file-3" class="file-input" accept="image/*">
                    <label for="user-file-3" class="file-label">Ajouter une 3eme photo</label>
                    <span class="file-name" id="file-name-3">Aucun fichier sélectionné</span>
                </div>
                <hr>
                <button type="button" id="send-cart" class="send-cart-btn">Envoyer le panier par e-mail</button>
                <p id="sendStatus" role="status" aria-live="polite"></p>
            </div>
        </div>
    </main>
    <?php include_once __DIR__ . "/../components/footer.php"?>
</body>
</html>