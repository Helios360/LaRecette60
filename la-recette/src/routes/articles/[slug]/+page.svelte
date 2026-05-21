<script lang="ts">
    import Hero from '$lib/components/hero.svelte';
    import { enhance } from '$app/forms';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    let article = $derived(data.article);
    let rations = $derived(article.slices.match(/\d+/g)?.map(Number) ?? []);

    let popup: HTMLDialogElement;

    const SITE_URL = 'https://www.larecette60.com';
    let imageUrl = $derived(
        `${SITE_URL}${article.cover_image_key ? `/uploads/${article.cover_image_key}` : `/images/${article.slug}.webp`}`
    );
    let productSchema = $derived({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: article.title,
        description: article.subtitle,
        image: imageUrl,
        brand: { '@type': 'Brand', name: 'La Recette' },
        offers: {
            '@type': 'Offer',
            url: `${SITE_URL}/articles/${article.slug}`,
            priceCurrency: 'EUR',
            price: String(article.price),
            availability: 'https://schema.org/InStock'
        }
    });
</script>

<svelte:head>
    <title>{article.title} — La Recette</title>
    <meta name="description" content={article.subtitle} />
    <meta property="og:type" content="product">
    <meta property="og:title" content={`${article.title} — La Recette`}>
    <meta property="og:description" content={article.subtitle}>
    <meta property="og:image" content={imageUrl}>
    <meta name="twitter:title" content={`${article.title} — La Recette`}>
    <meta name="twitter:description" content={article.subtitle}>
    <meta name="twitter:image" content={imageUrl}>
    {@html `<script type="application/ld+json">${JSON.stringify(productSchema)}</` + `script>`}
</svelte:head>

<Hero
    title={article.title}
    subtitle={article.subtitle}
    background="/images/boutique-irl.webp"
/>

<div class="page-content">
    <article class="detail">
        <img class="detail-img" src={article.cover_image_key ? `/uploads/${article.cover_image_key}` : `/images/${article.slug}.webp`} alt={article.title} />
        <div class="detail-body">
            <h1 class="section-title">{article.title}</h1>
            <h3>{article.subtitle}</h3>
            <p class="meta"><strong>Tailles disponibles :</strong> {article.slices}</p>
            <p class="meta"><strong>Prix :</strong> {article.price} € / part</p>

            {#if article.details_html}
                <div class="details">
                    {@html article.details_html}
                </div>
            {/if}

            <div class="actions">
                <a class="back" href="/articles">RETOUR</a>
                <button class="add" onclick={() => popup.showModal()}>AJOUTER AU PANIER</button>
            </div>
        </div>
    </article>

    <dialog bind:this={popup}>
        <h3>Combien de parts ?</h3>
        {#each rations as nb}
            <form
                method="POST"
                action="?/addToCart"
                use:enhance={() => {
                    return async ({ result, update }) => {
                        if (result.type === 'success') {
                            popup.close();
                            await update();
                        }
                    };
                }}
            >
                <input type="hidden" name="articleId" value={article.id} />
                <input type="hidden" name="slices" value={nb} />
                <button type="submit">{nb}</button>
            </form>
        {/each}
        <button onclick={() => popup.close()}>Retour</button>
    </dialog>
</div>

<style>
.detail {
    z-index: 5;
    width: 100%;
    max-width: 1200px;
    padding: 2rem;
    background-color: var(--primary);
    border-radius: var(--smaller-radius);
    display: flex;
    gap: 2rem;
}
.detail-img {
    width: 40%;
    max-width: 450px;
    object-fit: cover;
    border-radius: var(--smaller-radius);
}
.detail-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.meta { margin: 0; }
.details {
    line-height: 1.6;
    margin-top: 0.5rem;
}
.actions {
    display: flex;
    gap: 1rem;
    margin-top: auto;
    padding-top: 1.5rem;
}
.actions > * { flex: 1; }
.back {
    font-family: "Visibility", serif;
    color: var(--secondary);
    font-size: 0.9rem;
    font-weight: 600;
    padding: 0.75rem 1rem;
    border: 2px solid var(--secondary);
    border-radius: var(--smaller-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
}
.back:hover { background-color: var(--secondary); color: var(--primary); }

@media (max-width: 800px), (hover: none), (pointer: coarse) {
    .detail { flex-direction: column; padding: 1rem; }
    .detail-img { width: 100%; max-width: none; }
}
</style>
