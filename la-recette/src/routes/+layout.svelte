<script lang="ts">
    import '../styles/app.css';
    import { page } from '$app/state';
    let { children, data } = $props();
    let menuOpen = $state(false);
    $effect(() => { void page.url.pathname; menuOpen = false; });
    function isActive(href: string) {
        const path = page.url.pathname;
        if (href === '/') return path === '/';
        return path === href || path.startsWith(href + '/');
    }

    const SITE_URL = 'https://www.larecette60.com';
    const SITE_NAME = 'La Recette';
    const DEFAULT_TITLE = "Pâtisseries artisanales dans l'Oise | La Recette";
    const DEFAULT_DESCRIPTION = "Pâtisseries artisanales dans l'Oise : number cakes, gâteaux à thèmes, petits fours sucrés/salés. Ingrédients de qualité et décors faits main. Commandez en ligne.";
    const OG_IMAGE = `${SITE_URL}/images/larecette.webp`;

    let canonical = $derived(`${SITE_URL}${page.url.pathname === '/' ? '/' : page.url.pathname.replace(/\/$/, '')}`);

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Bakery',
        name: SITE_NAME,
        url: SITE_URL,
        image: OG_IMAGE,
        description: DEFAULT_DESCRIPTION,
        priceRange: '€€',
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Canny-sur-Matz',
            addressRegion: 'Oise',
            addressCountry: 'FR'
        },
        areaServed: { '@type': 'AdministrativeArea', name: "Oise" },
        sameAs: [
            'https://www.facebook.com/larecette60/',
            'https://www.instagram.com/larecette_60',
            'https://www.tiktok.com/@mimimacaron60'
        ]
    };
</script>

<svelte:head>
    <title>{DEFAULT_TITLE}</title>
    <meta name="description" content={DEFAULT_DESCRIPTION}>
    <link rel="canonical" href={canonical}>
    <meta name="author" content={SITE_NAME}>
    <meta name="keywords" content="La recette, Larecette, larecette60, patisserie, oise, compiegne, gourmandises, number cake, cake topper, gateaux a themes, petits fours, artisan, salé, sucré">

    <link rel="icon" type="image/webp" sizes="180x180" href="/images/larecette.webp">
    <link rel="shortcut icon" href="/images/larecetteIcon.ico">
    <link rel="apple-touch-icon" href="/images/larecette.webp">

    <meta property="og:type" content="website">
    <meta property="og:locale" content="fr_FR">
    <meta property="og:site_name" content={SITE_NAME}>
    <meta property="og:title" content={DEFAULT_TITLE}>
    <meta property="og:description" content={DEFAULT_DESCRIPTION}>
    <meta property="og:url" content={canonical}>
    <meta property="og:image" content={OG_IMAGE}>
    <meta property="og:image:alt" content="La Recette — pâtisseries artisanales">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content={DEFAULT_TITLE}>
    <meta name="twitter:description" content={DEFAULT_DESCRIPTION}>
    <meta name="twitter:image" content={OG_IMAGE}>

    <link rel="preload" as="image" href="/images/Boutique.png">

    {@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</` + `script>`}
</svelte:head>

<header>
    <a href="/"><img src="/images/larecette.webp" height="90" width="90" alt="La Recette - pâtisserie artisanale" decoding="async"></a>
    <nav class="desktop-nav">
        <a href="/events" class:active={isActive('/events')} aria-current={isActive('/events') ? 'page' : undefined}>Evenements</a>
        <a href="/articles" class:active={isActive('/articles')} aria-current={isActive('/articles') ? 'page' : undefined}>Articles</a>
        <a href="/about" class:active={isActive('/about')} aria-current={isActive('/about') ? 'page' : undefined}>A propos</a>
        <a href="/cart" class:active={isActive('/cart')} aria-current={isActive('/cart') ? 'page' : undefined}>Panier</a>
        {#if data?.isAdmin}
            <a href="/admin" class:active={isActive('/admin')} aria-current={isActive('/admin') ? 'page' : undefined}>Admin</a>
        {/if}
        <a href="/account" aria-label="Mon compte" class="account-link" class:active={isActive('/account')} aria-current={isActive('/account') ? 'page' : undefined}>
            <svg width="50" height="50" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true">
                <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5m0-8a3 3 0 1 1-3 3 3 3 0 0 1 3-3m9 17v-1a7 7 0 0 0-7-7h-4a7 7 0 0 0-7 7v1h2v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1Z"/>
            </svg>
        </a>
    </nav>
    <button
        type="button"
        class="burger-toggle"
        class:open={menuOpen}
        aria-label="Ouvrir le menu"
        aria-expanded={menuOpen}
        aria-controls="burger-menu"
        onclick={() => (menuOpen = !menuOpen)}
    >
        <span></span><span></span><span></span>
    </button>
    <nav class="burger-menu" class:open={menuOpen} id="burger-menu">
        <a href="/events" class:active={isActive('/events')} aria-current={isActive('/events') ? 'page' : undefined}>Evenements</a>
        <a href="/articles" class:active={isActive('/articles')} aria-current={isActive('/articles') ? 'page' : undefined}>Commander</a>
        <a href="/account" class:active={isActive('/account')} aria-current={isActive('/account') ? 'page' : undefined}>Mon compte</a>
        <a href="/about" class:active={isActive('/about')} aria-current={isActive('/about') ? 'page' : undefined}>A propos</a>
        <a href="/cart" class:active={isActive('/cart')} aria-current={isActive('/cart') ? 'page' : undefined}>Panier</a>
        {#if data?.isAdmin}
            <a href="/admin" class:active={isActive('/admin')} aria-current={isActive('/admin') ? 'page' : undefined}>Admin</a>
        {/if}
    </nav>
</header>

<main>
{@render children()}
</main>

<footer>
    <img src="/images/larecette.webp" width="120" height="120" alt="La Recette" loading="lazy" decoding="async">
    <div class="socials">
        <h3>Réseaux sociaux</h3><br>
        <div class="social-footer">
            <a href="https://www.facebook.com/larecette60/" aria-label="Facebook LaRecette60">
            <svg width="50" height="50" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" fill="var(--secondary)">
                <path d="M20.9 2H3.1A1.1 1.1 0 0 0 2 3.1v17.8A1.1 1.1 0 0 0 3.1 22h9.58v-7.75h-2.6v-3h2.6V9a3.64 3.64 0 0 1 3.88-4 20 20 0 0 1 2.33.12v2.7H17.3c-1.26 0-1.5.6-1.5 1.47v1.93h3l-.39 3H15.8V22h5.1a1.1 1.1 0 0 0 1.1-1.1V3.1A1.1 1.1 0 0 0 20.9 2"/>
            </svg>
            </a>
            <a href="https://www.instagram.com/larecette_60?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" aria-label="Instagram LaRecette60">
            <svg width="50" height="50" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" fill="var(--secondary)">
                <path d="M17.34 5.46a1.2 1.2 0 1 0 1.2 1.2 1.2 1.2 0 0 0-1.2-1.2m4.6 2.42a7.6 7.6 0 0 0-.46-2.43 4.9 4.9 0 0 0-1.16-1.77 4.7 4.7 0 0 0-1.77-1.15 7.3 7.3 0 0 0-2.43-.47C15.06 2 14.72 2 12 2s-3.06 0-4.12.06a7.3 7.3 0 0 0-2.43.47 4.8 4.8 0 0 0-1.77 1.15 4.7 4.7 0 0 0-1.15 1.77 7.3 7.3 0 0 0-.47 2.43C2 8.94 2 9.28 2 12s0 3.06.06 4.12a7.3 7.3 0 0 0 .47 2.43 4.7 4.7 0 0 0 1.15 1.77 4.8 4.8 0 0 0 1.77 1.15 7.3 7.3 0 0 0 2.43.47C8.94 22 9.28 22 12 22s3.06 0 4.12-.06a7.3 7.3 0 0 0 2.43-.47 4.7 4.7 0 0 0 1.77-1.15 4.85 4.85 0 0 0 1.16-1.77 7.6 7.6 0 0 0 .46-2.43c0-1.06.06-1.4.06-4.12s0-3.06-.06-4.12M20.14 16a5.6 5.6 0 0 1-.34 1.86 3.06 3.06 0 0 1-.75 1.15 3.2 3.2 0 0 1-1.15.75 5.6 5.6 0 0 1-1.86.34c-1 .05-1.37.06-4 .06s-3 0-4-.06a5.7 5.7 0 0 1-1.94-.3 3.3 3.3 0 0 1-1.1-.75 3 3 0 0 1-.74-1.15 5.5 5.5 0 0 1-.4-1.9c0-1-.06-1.37-.06-4s0-3 .06-4a5.5 5.5 0 0 1 .35-1.9A3 3 0 0 1 5 5a3.1 3.1 0 0 1 1.1-.8A5.7 5.7 0 0 1 8 3.86c1 0 1.37-.06 4-.06s3 0 4 .06a5.6 5.6 0 0 1 1.86.34 3.06 3.06 0 0 1 1.19.8 3.1 3.1 0 0 1 .75 1.1 5.6 5.6 0 0 1 .34 1.9c.05 1 .06 1.37.06 4s-.01 3-.06 4M12 6.87A5.13 5.13 0 1 0 17.14 12 5.12 5.12 0 0 0 12 6.87m0 8.46A3.33 3.33 0 1 1 15.33 12 3.33 3.33 0 0 1 12 15.33"/>
            </svg>
            </a>
            <a href="https://www.tiktok.com/@mimimacaron60?is_from_webapp=1&sender_device=pc" aria-label="TikTok LaRecette60">
                <svg width="50" height="50" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="var(--secondary)">
                    <path d="M21 2H3a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1m-3.281 8.725a4 4 0 0 1-.328.017A3.57 3.57 0 0 1 14.4 9.129v5.493a4.061 4.061 0 1 1-4.06-4.06c.085 0 .167.008.251.013v2a2.067 2.067 0 1 0-.251 4.119 2.123 2.123 0 0 0 2.16-2.045l.02-9.331h1.914A3.564 3.564 0 0 0 17.719 8.5Z"/>
                </svg>
            </a>
        </div>
    </div>
    <div class="mentions">
        <a href="mentions-legales">Mentions Légales</a>
        <a href="cgu">Conditions Générales d'utilisations</a>
        <a href="cgv">Conditions Générales de ventes</a>
    </div>
</footer>

<style>
.desktop-nav > a {
    transition: color 0.2s ease;
}
.desktop-nav > a.active {
    color: var(--tertiary);
    text-decoration: underline;
    text-underline-offset: 6px;
}
.account-link {
    display: inline-flex;
    align-items: center;
    transition: transform 0.3s ease;
}
.account-link:hover { transform: scale(1.1); }
.account-link.active {
    color: var(--tertiary);
    text-decoration: none;
}

.burger-toggle {
    display: none;
    background: transparent;
    border: none;
    padding: 0.5rem;
    width: 44px;
    height: 44px;
    flex-direction: column;
    justify-content: space-between;
    align-items: stretch;
    cursor: pointer;
}
.burger-toggle:hover { background: transparent; }
.burger-toggle > span {
    display: block;
    height: 3px;
    background: var(--primary);
    border-radius: 2px;
    transition: transform 0.3s ease, opacity 0.3s ease;
    transform-origin: center;
}
.burger-toggle.open > span:nth-child(1) { transform: translateY(12.5px) rotate(45deg); }
.burger-toggle.open > span:nth-child(2) { opacity: 0; }
.burger-toggle.open > span:nth-child(3) { transform: translateY(-12.5px) rotate(-45deg); }

.burger-menu {
    position: absolute;
    right: 25px;
    top: 110px;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background-color: var(--headers);
    align-items: end;
    gap: 15px;
    padding:1rem;
    border-radius: var(--smaller-radius);
    text-align: right;
    font-size: 30px;
    font-weight: 600;
    transition: max-height 0.5s ease, opacity 0.3s ease;
    pointer-events: none;
}
.burger-menu.open {
    max-height: 80vh;
    opacity: 1;
    pointer-events: auto;
}
.burger-menu > a {
    color: var(--primary);
    transition: color 0.2s ease;
}
.burger-menu > a.active {
    color: var(--tertiary);
    text-decoration: underline;
    text-underline-offset: 6px;
}
.social-footer {
    display: flex;
    gap: 10px;
    justify-content: center;
}
.mentions {
    font-family: "Visibility", serif;
    display: flex;
    flex-direction: column;
    gap: 10px;
    text-align: right;
}

@media (max-width: 800px), (hover: none), (pointer: coarse) {
    .desktop-nav { display: none; }
    .burger-toggle { display: flex; }
}

@media (max-width: 640px) {
    footer {
        flex-direction: column;
        justify-content: center;
        text-align: center;
        gap: 30px;
    }
    .mentions { text-align: center; }
}
</style>