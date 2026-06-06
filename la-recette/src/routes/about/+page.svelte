<script lang="ts">
    import Hero from '$lib/components/hero.svelte';
</script>

<svelte:head>
    <title>À propos | La Recette - Pâtisserie artisanale dans l'Oise</title>
    <meta name="description" content="Découvrez La Recette : pâtisserie artisanale à Canny-sur-Matz. Tarifs, contact, horaires, services traiteur et décors faits main pour vos événements.">
</svelte:head>

<Hero
    title="A propos de La Recette"
    subtitle="Une pâtisserie artisanale au cœur de l'Oise"
    background="/images/Boutique.png"
/>

<div class="page-content about-page">
    <section class="card split-content">
        <h2 class="section-title">Qui sommes-nous .</h2>
        <span>
            <p>La Recette est une pâtisserie artisanale où chaque gourmandise est préparée avec des ingrédients de qualité et beaucoup de soin.</p>
            <p>Je mets à disposition mon savoir-faire et mon sérieux pour répondre à vos attentes, pour vos mariages, baptêmes, anniversaires, événements professionnels ou simplement pour le plaisir.</p>
            <p>J'accorde une attention particulière aux décors faits main, la partie la plus créative et joyeuse de mon travail. Toujours à l'écoute, je prends le temps de comprendre vos envies afin de créer des douceurs uniques.</p>
        </span>
    </section>

    <section class="address-section">
        <div class="info-card card">
            <h3 class="section-title">Adresse</h3>
            <p>1459 rue de Picardie</p>
            <p>60310 Canny-sur-Matz</p>
            <p class="mt">Venez récupérer vos commandes sur place.</p>
            <a
                class="map-link"
                href="https://www.openstreetmap.org/?mlat=49.596508&mlon=2.795366#map=18/49.596507/2.795366"
                target="_blank"
                rel="noopener noreferrer">Ouvrir dans OpenStreetMap →</a>
        </div>
        <div class="map-wrapper card">
            <iframe
                title="Carte - La Recette, Canny-sur-Matz"
                src="https://www.openstreetmap.org/export/embed.html?bbox=2.794201970100403%2C49.59340322716253%2C2.79653012752533%2C49.59960973492138&amp;layer=mapnik&amp;marker=49.59650831829307%2C2.795366048812866"
                loading="lazy"
            ></iframe>
        </div>
    </section>

    <section class="info-grid">
        <div class="info-card card">
            <h3 class="section-title">Contact</h3>
            <p><a href="tel:0659723666">06 59 72 36 66</a></p>
            <p><a href="tel:0344309034">03 44 30 90 34</a></p>
            <p><a href="mailto:larecette60@gmail.com">larecette60@gmail.com</a></p>
        </div>
        <div class="info-card card">
            <h3 class="section-title">Paiement</h3>
            <p>Chèque</p>
            <p>Espèces</p>
            <p>Carte bancaire</p>
        </div>
    </section>

    <section class="tarifs">
        <h2 class="section-title tarifs-title">Tarifs .</h2>
        <div class="tarifs-grid">
            <div class="tarif-item card">
                <h3>Entremets aux fruits</h3>
                <p class="price">4 € la part</p>
                <p class="detail">en 8 / 10 / 12 / 25 parts</p>
            </div>
            <div class="tarif-item card">
                <h3>Entremets au chocolat</h3>
                <p class="price">4 € la part</p>
                <p class="detail">en 8 / 10 / 12 / 25 parts</p>
            </div>
            <div class="tarif-item card">
                <h3>Number cake</h3>
                <p class="price">4,50 € la part</p>
                <p class="detail">5 € avec un thème</p>
            </div>
            <div class="tarif-item card">
                <h3>Tartes</h3>
                <p class="price">3,80 € la part</p>
                <p class="detail">en 6 ou 8 parts</p>
            </div>
            <div class="tarif-item card">
                <h3>Les classiques</h3>
                <p class="price">3,80 € la part</p>
                <p class="detail">en 8 / 10 / 12 parts</p>
            </div>
            <div class="tarif-item card">
                <h3>Gateaux a theme</h3>
                <p class="price">à partir de 5,50 € la part</p>
                <p class="detail">décors personnalisés</p>
            </div>
            <div class="tarif-item card">
                <h3>Macarons</h3>
                <p class="price">10 €</p>
                <p class="detail">le lot de 10 (même parfum)</p>
            </div>
            <div class="tarif-item card">
                <h3>Mignardises</h3>
                <p class="price">13 €</p>
                <p class="detail">les 10 mignardises identiques</p>
            </div>
            <div class="tarif-item card">
                <h3>Moelleux</h3>
                <p class="price">15 €</p>
                <p class="detail">les 20 moelleux identiques</p>
            </div>
            <div class="tarif-item card">
                <h3>Cupcakes</h3>
                <p class="price">15 € / 10 €</p>
                <p class="detail">lot de 5 (grands) ou de 10 (petits)</p>
            </div>
            <div class="tarif-item card">
                <h3>Traiteur</h3>
                <p class="price">16 €</p>
                <p class="detail">les 20 pièces</p>
            </div>
        </div>
    </section>

    <section class="decors card split-content">
        <h2 class="section-title">Plus de decors .</h2>
        <span>
            <p><strong>Plaque décor fait main :</strong> 10 € (en fonction de la taille du décor).</p>
            <p><strong>Photo en sucre / disque :</strong> 10 €.</p>
            <p>Tous les décors sont réalisés à la main, sur demande, pour personnaliser vos pâtisseries selon votre thème.</p>
        </span>
    </section>

    <section class="cta-section card">
        <h2 class="section-title">Pret a commander ?</h2>
        <p>Découvrez la carte et passez commande en ligne, ou contactez-nous directement pour un projet sur mesure.</p>
        <div class="cta-buttons">
            <a class="cta" href="/articles">Voir la carte</a>
            <a class="cta outline" href="mailto:larecette60@gmail.com">Nous écrire</a>
        </div>
    </section>
</div>

<style>
.page-content { gap: 3rem; }
.page-content > section { width: 100%; max-width: 1400px; }
.card { border: none; }

.address-section {
    display: grid;
    grid-template-columns: 1fr 1.4fr;
    gap: 1.5rem;
    align-items: stretch;
}
.map-link {
    margin-top: 1rem;
    font-family: "Visibility", serif;
    color: var(--secondary);
    font-weight: 600;
    align-self: flex-start;
}
.map-link:hover { text-decoration: underline; }
.map-wrapper {
    overflow: hidden;
    min-height: 320px;
    display: flex;
}
.map-wrapper iframe {
    width: 100%;
    height: 100%;
    min-height: 320px;
    border: 0;
    display: block;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
}
.info-card {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
.info-card h3 { margin-bottom: 0.8rem; }
.info-card p { line-height: 1.5; }
.info-card a:hover { text-decoration: underline; }
.info-card .mt {
    margin-top: 1rem;
    font-style: italic;
}

.tarifs-title {
    margin-bottom: 1.5rem;
    text-align: center;
}
.tarifs-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
}
.tarif-item {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    transition: transform 0.3s ease;
}
.tarif-item:hover { transform: translateY(-4px); }
.tarif-item h3 { font-size: 1.4rem; }
.tarif-item .price {
    font-family: "Artistic", serif;
    font-size: 1.5rem;
    color: var(--secondary);
}
.tarif-item .detail {
    font-size: 0.95rem;
    font-style: italic;
    opacity: 0.85;
}

.decors { padding: 3rem 5%; }
.decors strong { font-weight: 600; }

.cta-section {
    text-align: center;
    padding: 3rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}
.cta-section p {
    max-width: 600px;
    line-height: 1.6;
}
.cta-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 1rem;
}

@media (max-width: 1000px) {
    .tarifs-grid { grid-template-columns: repeat(2, 1fr); }
    .info-grid { grid-template-columns: 1fr; }
    .address-section { grid-template-columns: 1fr; }
    .map-wrapper { min-height: 280px; }
}
@media (max-width: 800px), (hover: none), (pointer: coarse) {
    .tarifs-grid { grid-template-columns: 1fr; }
}
</style>
