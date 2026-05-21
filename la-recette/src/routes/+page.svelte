<script lang="ts">
    import Hero from '$lib/components/hero.svelte';
    import { onMount } from 'svelte';
    import type { PageData } from './$types';

    let { data } : { data: PageData } = $props();

    type Article = { id: number; category_id: number; slug: string; title: string };
    type Category = { id: number; name: string };
    type GalleryItem = { category: Category; articles: Article[] };

    function shuffle<T>(arr: T[]): T[] {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    const cats = (data.categories as Category[]) ?? [];
    const arts = (data.articles as Article[]) ?? [];
    const baseGallery: GalleryItem[] = cats.map((cat) => ({
        category: cat,
        articles: arts.filter((a) => a.category_id === cat.id),
    }));

    // Initial render (SSR + first client paint) keeps DB order so hydration matches; shuffle happens in onMount.
    let galleryItems = $state<GalleryItem[]>(baseGallery);
    let activeIndices = $state<number[]>(baseGallery.map(() => 0));

    onMount(() => {
        galleryItems = baseGallery.map((g) => ({ ...g, articles: shuffle(g.articles) }));
        const timeouts: ReturnType<typeof setTimeout>[] = [];
        const intervals: ReturnType<typeof setInterval>[] = [];
        galleryItems.forEach((g, idx) => {
            if (g.articles.length < 2) return;
            timeouts.push(setTimeout(() => {
                intervals.push(setInterval(() => {
                    activeIndices[idx] = (activeIndices[idx] + 1) % g.articles.length;
                }, 4000));
            }, idx * 800));
        });
        return () => {
            timeouts.forEach(clearTimeout);
            intervals.forEach(clearInterval);
        };
    });
</script>
<Hero
    title="La Recette Pâtisserie"
    subtitle="Bienvenue dans un monde de douceur et de gourmandises"
    cta="Commander"
    link="articles"
    img="/images/cakesHero.webp"
    background="/images/Boutique.png"
    />
<div class="page-content home">
    <section class="about card split-content">
        <h2 class="section-title">A propos .</h2>
        <span>
            <p>À La Recette, chaque pâtisserie est faite avec passion et souci du détail.</p>
            <p>J'accorde une attention particulière aux décors faits main, la partie la plus créative et joyeuse de mon travail.</p>
            <p>Je choisis des ingrédients de qualité, adaptables à vos envies, pour vous garantir des saveurs qui vous ressemblent.</p>
            <p>Toujours à l'écoute, je prends le temps de comprendre vos demandes afin de créer des douceurs uniques, pour vos occasions spéciales ou simplement pour le plaisir.</p>
        </span>
    </section>

    <section class="gallery-section">
        <h2 class="section-title gallery-title">Découvrez la carte .</h2>
        <p class="gallery-subtitle">Cliquez sur une catégorie pour la parcourir</p>
        <div class="menu-gallery">
            {#each galleryItems as item, idx (item.category.id)}
                <a href="/articles?category={item.category.id}" aria-label={item.category.name} data-label={item.category.name}>
                    {#if item.articles.length === 0}
                        <div class="slide-placeholder"></div>
                    {:else}
                        {#each item.articles as article, i (article.id)}
                            <img
                                src="/images/{article.slug}.webp"
                                alt={article.title}
                                class="slide"
                                class:active={activeIndices[idx] === i}
                                loading={i === 0 ? 'eager' : 'lazy'}
                                decoding="async"
                            />
                        {/each}
                    {/if}
                </a>
            {/each}
        </div>
    </section>

    <section class="values">
        <h2 class="section-title values-title">L'esprit La Recette .</h2>
        <div class="values-grid">
            <div class="value card">
                <div class="value-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2 9.5 8.5 2 9l5.5 5L6 22l6-3.5L18 22l-1.5-8L22 9l-7.5-.5z"/>
                    </svg>
                </div>
                <h3>Faits main</h3>
                <p>Décors modelés à la main, sur mesure pour votre thème et vos couleurs.</p>
            </div>
            <div class="value card">
                <div class="value-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2v6"/><path d="M5 8h14l-1.5 12h-11z"/><path d="M9 12v4M12 12v4M15 12v4"/>
                    </svg>
                </div>
                <h3>Artisanal</h3>
                <p>Tout est préparé dans l'atelier de Canny-sur-Matz, en petites quantités.</p>
            </div>
            <div class="value card">
                <div class="value-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="9"/><path d="M8 12c2 4 6 4 8 0"/><circle cx="9" cy="9.5" r="0.6" fill="currentColor"/><circle cx="15" cy="9.5" r="0.6" fill="currentColor"/>
                    </svg>
                </div>
                <h3>Sur mesure</h3>
                <p>Saveurs, tailles et décors adaptés à vos envies et à votre événement.</p>
            </div>
            <div class="value card">
                <div class="value-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10z"/>
                    </svg>
                </div>
                <h3>Avec passion</h3>
                <p>Une attention particulière portée à chaque gourmandise, du choix des produits à la finition.</p>
            </div>
        </div>
    </section>

    <section class="events-teaser card">
        <div class="events-content">
            <h2 class="section-title">Mariages & Baptêmes</h2>
            <p>De la pièce montée traditionnelle au wedding cake à étages, La Recette accompagne vos plus belles occasions avec des créations sur mesure.</p>
            <a class="cta" href="/events">Découvrir les prestations</a>
        </div>
        <div class="events-image" style="background-image: url('/images/macaron-tower.webp')"></div>
    </section>

    <section class="cta-section card">
        <h2 class="section-title">Une envie de douceur ?</h2>
        <p>Parcourez la carte et passez commande en ligne, ou contactez-nous pour un projet sur mesure.</p>
        <div class="cta-buttons">
            <a class="cta" href="/articles">Voir la carte</a>
            <a class="cta outline" href="/about">Tarifs & contact</a>
        </div>
    </section>
</div>
<style>
.home { gap: 4rem; }
.home > section { width: 100%; max-width: 1400px; }

.about {
    background-color: var(--primary);
    color: var(--secondary);
    border-radius: var(--smaller-radius);
}

.gallery-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}
.gallery-title { text-align: center; }
.gallery-subtitle {
    font-style: italic;
    margin-bottom: 1.5rem;
    text-align: center;
}
.menu-gallery {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
}
.menu-gallery > a {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    aspect-ratio: 16 / 11;
    transition: transform 0.3s;
}
.menu-gallery > a:hover { transform: translateY(-4px); }
.menu-gallery > a > img {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    object-fit: cover;
}
.menu-gallery > a > .slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 1s ease-in-out;
}
.menu-gallery > a > .slide.active { opacity: 1; }
.menu-gallery > a::after {
    content: attr(data-label);
    font-family: "Artistic", serif;
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);
    font-size: 2.5rem;
    text-align: center;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 6px;
}
.menu-gallery > a:hover::after { opacity: 1; }
.slide-placeholder {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.08);
}

.values { width: 100%; }
.values-title {
    text-align: center;
    margin-bottom: 2rem;
}
.values-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
}
.value {
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.7rem;
    transition: transform 0.3s ease;
}
.value:hover { transform: translateY(-4px); }
.value-icon {
    width: 56px;
    height: 56px;
    color: var(--headers);
    display: flex;
    align-items: center;
    justify-content: center;
}
.value-icon svg { width: 100%; height: 100%; }
.value h3 { font-size: 1.4rem; }
.value p { line-height: 1.5; font-size: 0.98rem; }

.events-teaser {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    overflow: hidden;
    align-items: stretch;
    min-height: 320px;
}
.events-content {
    padding: 2.5rem 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
    align-items: flex-start;
}
.events-content p { line-height: 1.6; }
.events-image {
    background-size: cover;
    background-position: center;
    min-height: 280px;
}

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
    .values-grid { grid-template-columns: repeat(2, 1fr); }
    .events-teaser { grid-template-columns: 1fr; }
    .events-image { min-height: 220px; }
}
@media (max-width: 800px) {
    .menu-gallery {
        grid-template-columns: 1fr;
        padding-bottom: 20px;
    }
    .menu-gallery > a {
        border-radius: 14px;
        aspect-ratio: 16 / 10;
    }
    .events-content { padding: 1.8rem 1.5rem; }
}
@media (max-width: 600px) {
    .values-grid { grid-template-columns: 1fr; }
}
@media (hover: none), (pointer: coarse) {
    .menu-gallery > a::after { opacity: 1; }
}
</style>
