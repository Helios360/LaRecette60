<script lang="ts">
    import Hero from '$lib/components/hero.svelte';
    import { base } from '$app/paths';
    import { enhance } from '$app/forms';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    let article = $derived(data.article);
    let rations = $derived(article.slices.match(/\d+/g)?.map(Number) ?? []);
    let isConfigurable = $derived(['theme-cake', 'tinycake'].includes(article.slug));

    let popup: HTMLDialogElement;
    let selectedSlices = $state('');
    let themeDesc = $state('');
    let colors = $state('');
    let extras = $state<string[]>([]);

    function toggleExtra(val: string) {
        if (extras.includes(val)) extras = extras.filter((e) => e !== val);
        else extras = [...extras, val];
    }

    function submitForm(nb: number) {
        selectedSlices = String(nb);
        // Submit happens via form submit button below
    }

    const SITE_URL = 'https://www.larecette60.com';
    let imageUrl = $derived(
        `${SITE_URL}${base}${article.cover_image_key ? `${article.cover_image_key.includes('/') ? '/uploads/' : '/images/'}${article.cover_image_key}` : `/images/${article.slug}.webp`}`
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
            url: `${SITE_URL}${base}/articles/${article.slug}`,
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
        <img class="detail-img" src={article.cover_image_key ? `${base}${article.cover_image_key.includes('/') ? '/uploads/' : '/images/'}${article.cover_image_key}` : `${base}/images/${article.slug}.webp`} alt={article.title} />
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
        <form method="POST" action="?/addToCart" use:enhance={() => {
            return async ({ result, update }) => {
                if (result.type === 'success') {
                    popup.close();
                    themeDesc = '';
                    colors = '';
                    extras = [];
                    selectedSlices = '';
                    await update();
                }
            };
        }}>
            <h3>Configuration</h3>

            <label class="field">
                <span>Nombre de parts *</span>
                <div class="slice-grid">
                    {#each rations as nb}
                        <button
                            type="button"
                            class="slice-btn"
                            class:selected={selectedSlices === String(nb)}
                            onclick={() => selectedSlices = String(nb)}
                        >{nb}</button>
                    {/each}
                </div>
                <input type="hidden" name="slices" value={selectedSlices} />
            </label>

            {#if isConfigurable}
                <input type="hidden" name="articleId" value={article.id} />

                <label class="field">
                    <span>Décrivez votre thème</span>
                    <textarea
                        name="theme_description"
                        bind:value={themeDesc}
                        rows="2"
                        placeholder="Ex: Anniversaire 30 ans, thème jungle, personnalisé au prénom…"
                    ></textarea>
                </label>

                <label class="field">
                    <span>Couleurs souhaitées (optionnel)</span>
                    <input type="text" name="colors" bind:value={colors} placeholder="Ex: Rose, blanc, or" />
                </label>

                <fieldset class="extras">
                    <legend>Options supplémentaires</legend>
                    <label class="extra-row">
                        <input type="checkbox" name="extras" value="plaque-decor" checked={extras.includes('plaque-decor')} onchange={() => toggleExtra('plaque-decor')} />
                        <span>Plaque décor fait main <em>(+10 €)</em></span>
                    </label>
                    <label class="extra-row">
                        <input type="checkbox" name="extras" value="photo-sucre" checked={extras.includes('photo-sucre')} onchange={() => toggleExtra('photo-sucre')} />
                        <span>Photo en sucre / disque <em>(+10 €)</em></span>
                    </label>
                </fieldset>
            {:else}
                <input type="hidden" name="articleId" value={article.id} />
            {/if}

            <div class="actions">
                <button type="button" onclick={() => popup.close()}>Retour</button>
                <button type="submit" disabled={!selectedSlices}>Ajouter au panier</button>
            </div>
        </form>
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
.actions > * {
    flex: 1;
    min-width: 0;
}
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
.add { width: 100%; }

dialog {
    padding: 1.5rem;
    border: 2px solid var(--secondary);
    border-radius: var(--smaller-radius);
    max-width: 480px;
    width: min(92vw, 480px);
}
dialog form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
dialog h3 {
    font-family: "Artistic", serif;
    font-size: 1.3rem;
    color: var(--headers);
}
.field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-family: "Visibility", serif;
    font-size: 0.95rem;
    color: var(--secondary);
}
.field input, .field textarea {
    padding: 0.5rem;
    border: 2px solid var(--secondary);
    border-radius: var(--smaller-radius);
    font-family: "Visibility", serif;
    font-size: 0.9rem;
    background-color: transparent;
    color: var(--secondary);
}
.slice-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}
.slice-btn {
    padding: 0.5rem 1rem;
    min-width: 3rem;
    border: 2px solid var(--secondary);
    border-radius: var(--smaller-radius);
    background-color: transparent;
    color: var(--secondary);
    font-family: "Visibility", serif;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
}
.slice-btn.selected {
    background-color: var(--secondary);
    color: var(--primary);
}
.slice-btn:hover { background-color: var(--tertiary); }
fieldset.extras {
    border: 2px solid var(--secondary);
    border-radius: var(--smaller-radius);
    padding: 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
fieldset.extras legend {
    font-family: "Visibility", serif;
    font-size: 0.9rem;
    color: var(--secondary);
    padding: 0 0.3rem;
}
.extra-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: "Visibility", serif;
    font-size: 0.9rem;
    color: var(--secondary);
    cursor: pointer;
}
.extra-row em { font-size: 0.8rem; opacity: 0.8; }

@media (max-width: 800px), (hover: none), (pointer: coarse) {
    .detail { flex-direction: column; padding: 1rem; }
    .detail-img { width: 100%; max-width: none; }
}
</style>
