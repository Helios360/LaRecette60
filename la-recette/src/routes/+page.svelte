<script lang="ts">
    import Hero from '$lib/components/hero.svelte';
    import { base } from '$app/paths';
    import { onMount } from 'svelte';
    import type { PageData } from './$types';

    let { data } : { data: PageData } = $props();

    type Article = { id: number; category_id: number; slug: string; title: string; cover_image_key: string | null };
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
    title="La Recette Patisserie"
    subtitle="Bienvenue dans un monde de douceur et de gourmandises"
    cta="Commander"
    link="articles"
    background="/images/boutique-irl.webp"
    />
<div class="page-content home">
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
                                src={article.cover_image_key ? `${base}${article.cover_image_key.includes('/') ? '/uploads/' : '/images/'}${article.cover_image_key}` : `${base}/images/${article.slug}.webp`}
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

    <section class="events-teaser card">
        <div class="events-content">
            <h2 class="section-title">Mariages & Baptemes</h2>
            <p>De la pièce montée traditionnelle au wedding cake à étages, La Recette accompagne vos plus belles occasions avec des créations sur mesure.</p>
            <a class="cta" href="/events">Découvrir les prestations</a>
        </div>
        <div class="events-image" style="background-image: url('{base}/images/macaron-tower.webp')"></div>
    </section>

    <section class="about card split-content">
        <h2 class="section-title">A propos .</h2>
        <span>
            <p>À La Recette, chaque pâtisserie est faite avec passion et souci du détail.</p>
            <p>J'accorde une attention particulière aux décors faits main, la partie la plus créative et joyeuse de mon travail.</p>
            <p>Je choisis des ingrédients de qualité, adaptables à vos envies, pour vous garantir des saveurs qui vous ressemblent.</p>
            <p>Toujours à l'écoute, je prends le temps de comprendre vos demandes afin de créer des douceurs uniques, pour vos occasions spéciales ou simplement pour le plaisir.</p>
        </span>
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
                <p>Tout est fait maison dans notre atelier de Pâtisserie de Canny-sur-Matz.</p>
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

    <section class="social-section card">
        <h2 class="section-title">Suivez-nous sur les réseaux</h2>
        <p>Retrouvez La Recette sur Instagram, Facebook et TikTok pour suivre nos créations au quotidien.</p>
        <div class="social-links">
            <a href="https://www.facebook.com/larecette60/" aria-label="Facebook LaRecette60" class="social-link">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="var(--headers)">
                    <path d="M20.9 2H3.1A1.1 1.1 0 0 0 2 3.1v17.8A1.1 1.1 0 0 0 3.1 22h9.58v-7.75h-2.6v-3h2.6V9a3.64 3.64 0 0 1 3.88-4 20 20 0 0 1 2.33.12v2.7H17.3c-1.26 0-1.5.6-1.5 1.47v1.93h3l-.39 3H15.8V22h5.1a1.1 1.1 0 0 0 1.1-1.1V3.1A1.1 1.1 0 0 0 20.9 2"/>
                </svg>
                <span>Facebook</span>
            </a>
            <a href="https://www.instagram.com/larecette_60" aria-label="Instagram LaRecette60" class="social-link">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="var(--headers)">
                    <path d="M17.34 5.46a1.2 1.2 0 1 0 1.2 1.2 1.2 1.2 0 0 0-1.2-1.2m4.6 2.42a7.6 7.6 0 0 0-.46-2.43 4.9 4.9 0 0 0-1.16-1.77 4.7 4.7 0 0 0-1.77-1.15 7.3 7.3 0 0 0-2.43-.47C15.06 2 14.72 2 12 2s-3.06 0-4.12.06a7.3 7.3 0 0 0-2.43.47 4.8 4.8 0 0 0-1.77 1.15 4.7 4.7 0 0 0-1.15 1.77 7.3 7.3 0 0 0-.47 2.43C2 8.94 2 9.28 2 12s0 3.06.06 4.12a7.3 7.3 0 0 0 .47 2.43 4.7 4.7 0 0 0 1.15 1.77 4.8 4.8 0 0 0 1.77 1.15 7.3 7.3 0 0 0 2.43.47C8.94 22 9.28 22 12 22s3.06 0 4.12-.06a7.3 7.3 0 0 0 2.43-.47 4.7 4.7 0 0 0 1.77-1.15 4.85 4.85 0 0 0 1.16-1.77 7.6 7.6 0 0 0 .46-2.43c0-1.06.06-1.4.06-4.12s0-3.06-.06-4.12M20.14 16a5.6 5.6 0 0 1-.34 1.86 3.06 3.06 0 0 1-.75 1.15 3.2 3.2 0 0 1-1.15.75 5.6 5.6 0 0 1-1.86.34c-1 .05-1.37.06-4 .06s-3 0-4-.06a5.7 5.7 0 0 1-1.94-.3 3.3 3.3 0 0 1-1.1-.75 3 3 0 0 1-.74-1.15 5.5 5.5 0 0 1-.4-1.9c0-1-.06-1.37-.06-4s0-3 .06-4a5.5 5.5 0 0 1 .35-1.9A3 3 0 0 1 5 5a3.1 3.1 0 0 1 1.1-.8A5.7 5.7 0 0 1 8 3.86c1 0 1.37-.06 4-.06s3 0 4 .06a5.6 5.6 0 0 1 1.86.34 3.06 3.06 0 0 1 1.19.8 3.1 3.1 0 0 1 .75 1.1 5.6 5.6 0 0 1 .34 1.9c.05 1 .06 1.37.06 4s-.01 3-.06 4M12 6.87A5.13 5.13 0 1 0 17.14 12 5.12 5.12 0 0 0 12 6.87m0 8.46A3.33 3.33 0 1 1 15.33 12 3.33 3.33 0 0 1 12 15.33"/>
                </svg>
                <span>Instagram</span>
            </a>
            <a href="https://www.tiktok.com/@mimimacaron60" aria-label="TikTok LaRecette60" class="social-link">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="var(--headers)">
                    <path d="M21 2H3a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1m-3.281 8.725a4 4 0 0 1-.328.017A3.57 3.57 0 0 1 14.4 9.129v5.493a4.061 4.061 0 1 1-4.06-4.06c.085 0 .167.008.251.013v2a2.067 2.067 0 1 0-.251 4.119 2.123 2.123 0 0 0 2.16-2.045l.02-9.331h1.914A3.564 3.564 0 0 0 17.719 8.5Z"/>
                </svg>
                <span>TikTok</span>
            </a>
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

.social-section {
    text-align: center;
    padding: 3rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
}
.social-section p {
    max-width: 600px;
    line-height: 1.6;
}
.social-links {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 0.5rem;
}
.social-link {
    flex: 1;
    min-width: 160px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.2rem 1.8rem;
    border: 2px solid var(--headers);
    border-radius: var(--smaller-radius);
    transition: all 0.3s ease;
    text-decoration: none;
    color: var(--secondary);
    font-family: "Visibility", serif;
    font-weight: 600;
}
.social-link:hover {
    background-color: var(--headers);
    color: var(--primary);
    transform: translateY(-3px);
}
.social-link:hover svg { fill: var(--primary); }
.social-link svg { transition: fill 0.3s ease; }

@media (max-width: 800px) {
    .social-links { gap: 1rem; }
    .social-link { padding: 1rem 1.5rem; }
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
