<script lang="ts">
    import Hero from '$lib/components/hero.svelte';
</script>

<svelte:head>
    <title>Mariages & Baptêmes | La Recette - Pâtisserie artisanale</title>
    <meta name="description" content="Pièces montées, wedding cakes, gâteaux de baptême et buffets sucrés sur mesure dans l'Oise. La Recette donne à vos grands événements une touche gourmande et personnalisée.">
</svelte:head>

<Hero
    title="Mariages & Baptêmes"
    subtitle="Des créations sur mesure pour vos plus beaux jours"
    cta="Demander un devis"
    link="about"
    background="/images/macaron-tower.webp"
/>

<div class="page-content events-page">
    <section class="card split-content intro">
        <h2 class="section-title">Vos grands événements .</h2>
        <span>
            <p>La Recette accompagne vos plus belles occasions : mariages, baptêmes, communions et fiançailles.</p>
            <p>De la <em>pièce montée classique</em> au <em>fameux wedding cake</em>, chaque création est imaginée avec vous pour clore le repas sur une note gourmande et inoubliable.</p>
            <p>Je prends le temps d'échanger avec vous, de comprendre votre thème, vos couleurs et vos envies, afin de réaliser un dessert qui vous ressemble.</p>
        </span>
    </section>

    <section class="event-block">
        <div class="event-card card">
            <div class="event-image" style="background-image: url('/images/theme-cake.webp')"></div>
            <div class="event-content">
                <h2 class="section-title">Mariages</h2>
                <p>Un mariage, c'est une journée unique. Le gâteau qui la clôture doit l'être aussi.</p>
                <p>Je crée des <strong>wedding cakes</strong> à étages et des <strong>pièces montées</strong> traditionnelles, déclinés selon votre thème, vos fleurs et la palette de couleurs de votre événement.</p>
                <ul class="feature-list">
                    <li>Wedding cakes à étages, décors faits main</li>
                    <li>Pièces montées choux / nougatine</li>
                    <li>Number cakes personnalisés aux initiales</li>
                    <li>Macarons et mignardises pour vin d'honneur</li>
                    <li>Buffets sucrés sur mesure</li>
                </ul>
            </div>
        </div>
    </section>

    <section class="event-block reversed">
        <div class="event-card card">
            <div class="event-image" style="background-image: url('/images/cupcakes-perso.webp')"></div>
            <div class="event-content">
                <h2 class="section-title">Baptêmes & Communions</h2>
                <p>Pour célébrer l'arrivée d'un enfant ou un moment de partage en famille, La Recette imagine des douceurs tendres et joyeuses.</p>
                <p>Des décors faits main, des couleurs douces et des saveurs choisies avec soin pour faire briller les yeux des petits comme des grands.</p>
                <ul class="feature-list">
                    <li>Gâteaux à thème personnalisés (animaux, prénoms, motifs)</li>
                    <li>Cupcakes décorés en lot</li>
                    <li>Number cakes en forme d'âge ou d'initiale</li>
                    <li>Plaques décor et photos en sucre</li>
                    <li>Mignardises et macarons assortis</li>
                </ul>
            </div>
        </div>
    </section>

    <section class="card split-content traiteur">
        <h2 class="section-title">Et côté salé ?</h2>
        <span>
            <p>Pour compléter le buffet, je propose également une sélection <strong>traiteur</strong> : navettes fraîcheur, mini-burgers, mini-kebabs et plateaux apéritifs.</p>
            <p>De quoi prolonger le plaisir tout au long de la réception, avec une qualité artisanale et des saveurs travaillées.</p>
            <p><strong>Tarif traiteur :</strong> 16 € les 20 pièces.</p>
        </span>
    </section>

    <section class="steps">
        <h2 class="section-title steps-title">Comment ça se passe .</h2>
        <div class="steps-grid">
            <div class="step card">
                <span class="step-number">1</span>
                <h3>Échange</h3>
                <p>Vous me contactez par téléphone ou par mail pour me parler de votre événement, de la date et du nombre de convives.</p>
            </div>
            <div class="step card">
                <span class="step-number">2</span>
                <h3>Création</h3>
                <p>Je vous propose une création sur mesure : saveurs, formes, décors, couleurs. Tout est adaptable à vos envies.</p>
            </div>
            <div class="step card">
                <span class="step-number">3</span>
                <h3>Confirmation</h3>
                <p>Une fois le projet validé, votre commande est confirmée et la fabrication est planifiée pour le jour J.</p>
            </div>
            <div class="step card">
                <span class="step-number">4</span>
                <h3>Réception</h3>
                <p>Vous récupérez votre commande à la boutique de Canny-sur-Matz, fraîche et prête pour le grand jour.</p>
            </div>
        </div>
    </section>

    <section class="cta-section card">
        <h2 class="section-title">Parlons de votre événement .</h2>
        <p>Chaque mariage et chaque baptême est unique. Contactez-moi pour un devis personnalisé et donnons vie à votre projet gourmand.</p>
        <div class="cta-buttons">
            <a class="cta" href="tel:0659723666">06 59 72 36 66</a>
            <a class="cta outline" href="mailto:larecette60@gmail.com">larecette60@gmail.com</a>
        </div>
    </section>
</div>

<style>
.page-content { gap: 3rem; }
.page-content > section { width: 100%; max-width: 1400px; }
.card { border: none; }

.intro { text-align: left; }

.event-block { display: flex; }
.event-card {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 2rem;
    overflow: hidden;
    width: 100%;
    align-items: stretch;
    padding: 1rem;
}
.event-block.reversed .event-card { grid-template-columns: 1.2fr 1fr; }
.event-block.reversed .event-image { order: 2; }
.event-block.reversed .event-content { order: 1; }

.event-image {
    background-size: cover;
    background-position: center;
    min-height: 360px;
    border-radius: var(--smaller-radius);
}
.event-content {
    padding: 1.5rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
}
.event-content p { line-height: 1.6; }
.feature-list {
    list-style: none;
    padding: 0;
    margin-top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}
.feature-list li {
    position: relative;
    padding-left: 1.6rem;
    font-family: "Visibility", serif;
    font-size: 1.05rem;
    line-height: 1.4;
    color: var(--secondary);
}
.feature-list li::before {
    content: "✦";
    position: absolute;
    left: 0;
    top: 0;
    color: var(--headers);
    font-size: 1rem;
}

.traiteur strong { font-weight: 600; }

.steps-title {
    text-align: center;
    margin-bottom: 0.5rem;
}
.steps-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
}
.step {
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    text-align: center;
    align-items: center;
    transition: transform 0.3s ease;
}
.step:hover { transform: translateY(-4px); }
.step-number {
    font-family: "Artistic", serif;
    font-size: 2.4rem;
    color: var(--headers);
    line-height: 1;
}
.step h3 { font-size: 1.4rem; }
.step p { line-height: 1.5; font-size: 1rem; }

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
    .event-card,
    .event-block.reversed .event-card { grid-template-columns: 1fr; }
    .event-block.reversed .event-image { order: 0; }
    .event-block.reversed .event-content { order: 0; }
    .event-image { min-height: 240px; }
    .steps-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 800px), (hover: none), (pointer: coarse) {
    .steps-grid { grid-template-columns: 1fr; }
    .event-content { padding: 1rem; }
}
</style>
