<script lang="ts">
    import { base } from '$app/paths';
    let {
        title,
        subtitle,
        cta = '',
        link = '',
        img = '',
        background = `${base}/images/cakesHero.webp`
    }: {
        title: string;
        subtitle: string;
        cta?: string;
        link?: string;
        img?: string;
        background?: string;
    } = $props();

    let bg = $derived(background.startsWith('/') ? `${base}${background}` : background);
</script>

<div class="hero" style="--hero-bg: url('{bg}')">
    <div class="hero-overlay"></div>
    <div class="hero-body">
        <h1>{title}</h1>
        <p class="hero-sub">{subtitle}</p>
        {#if cta}
            <a class="cta" href="{base}/{link}">{cta}</a>
        {/if}
    </div>
</div>

<style>
    .hero {
        position: relative;
        min-height: 65svh;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-image: var(--hero-bg);
        background-size: cover;
        background-position: center 30%;
        background-repeat: no-repeat;
        overflow: hidden;
    }

    .hero-overlay {
        position: absolute;
        inset: 0;
        background:
            linear-gradient(to bottom,
                rgba(255,224,197,0.15) 0%,
                rgba(195,106,62,0.55) 50%,
                rgba(97,44,18,0.70) 100%);
        pointer-events: none;
    }

    .hero-body {
        position: relative;
        z-index: 2;
        text-align: center;
        padding: 7rem 1.5rem 3rem;
        max-width: 720px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.2rem;
    }

    .hero-body h1 {
        font-family: "Artistic", "Pacifico", cursive;
        font-size: clamp(2.4rem, 6vw, 4.2rem);
        font-weight: 500;
        color: #fff;
        text-shadow: 0 2px 12px rgba(0,0,0,0.25);
        line-height: 1.1;
        margin: 0;
    }

    .hero-sub {
        font-family: "Visibility", "Arimo", sans-serif;
        font-size: clamp(1.1rem, 2.5vw, 1.6rem);
        color: rgba(255,255,255,0.92);
        text-shadow: 0 1px 8px rgba(0,0,0,0.20);
        line-height: 1.5;
        max-width: 560px;
        margin: 0;
    }

    .hero-body :global(.cta) {
        display: inline-block;
        font-family: "Visibility", "Arimo", sans-serif;
        font-size: clamp(1rem, 1.8vw, 1.2rem);
        font-weight: 600;
        padding: 0.75rem 2.2rem;
        margin-top: 0.5rem;
        border: 2px solid #fff;
        border-radius: 50px;
        background: rgba(255,255,255,0.12);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        color: #fff;
        text-decoration: none;
        transition: all 0.3s ease;
        letter-spacing: 0.02em;
    }

    .hero-body :global(.cta:hover) {
        background: #fff;
        color: var(--secondary, #c36a3e);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }

    @media (max-width: 800px), (hover: none), (pointer: coarse) {
        .hero {
            min-height: 58svh;
            background-position: center 20%;
        }
        .hero-body {
            padding: 6rem 1.2rem 2.5rem;
        }
        .hero-body :global(.cta) {
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            background: rgba(0,0,0,0.20);
        }
    }
</style>