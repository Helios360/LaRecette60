<script lang="ts">
    import Hero from '$lib/components/hero.svelte';
    import { enhance } from '$app/forms';
    import type { PageData, ActionData } from './$types';

    let { data, form }: { data: PageData, form: ActionData } = $props();

    let items = $derived(data.items ?? []);
    let total = $derived(items.reduce((s: number, i: any) => s + Number(i.unit_price), 0));

    const MAX_PHOTOS = 3;
    const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
    const MAX_MESSAGE = 1000;
    const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    let photoError = $state('');
    let selectedPhotos = $state<File[]>([]);
    let photoInput = $state<HTMLInputElement | null>(null);
    let message = $state('');
    let deliveryDate = $state('');

    function syncInputFiles() {
        if (!photoInput) return;
        const dt = new DataTransfer();
        for (const f of selectedPhotos) dt.items.add(f);
        photoInput.files = dt.files;
    }

    function removePhoto(index: number) {
        selectedPhotos = selectedPhotos.filter((_, i) => i !== index);
        photoError = '';
        syncInputFiles();
    }

    const minDeliveryDate = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        d.setSeconds(0, 0);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    })();

    function fmtPrice(n: any) {
        const v = Number(n ?? 0);
        return v.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
    }

    function onPhotosChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const picked = Array.from(input.files ?? []);
        photoError = '';

        const merged = [...selectedPhotos];
        for (const f of picked) {
            if (!ACCEPTED_TYPES.includes(f.type)) {
                photoError = 'Format non supporté (JPEG, PNG, WEBP, GIF)';
                continue;
            }
            if (f.size > MAX_PHOTO_BYTES) {
                photoError = `Photo trop lourde (max ${MAX_PHOTO_BYTES / (1024 * 1024)} Mo)`;
                continue;
            }
            const isDuplicate = merged.some(
                (g) => g.name === f.name && g.size === f.size && g.lastModified === f.lastModified
            );
            if (isDuplicate) continue;
            if (merged.length >= MAX_PHOTOS) {
                photoError = `Maximum ${MAX_PHOTOS} photos`;
                break;
            }
            merged.push(f);
        }

        selectedPhotos = merged;
        syncInputFiles();
    }
</script>

<svelte:head>
    <title>Mon panier — La Recette</title>
</svelte:head>

<Hero
    title="Mon panier"
    subtitle="Vérifiez votre commande avant de la valider."
    background="/images/boutique-irl.webp"
/>

<div class="page-content">
    {#if form?.error}<p class="alert error">{form.error}</p>{/if}
    {#if form?.message}<p class="alert ok">{form.message}</p>{/if}

    <section class="card cart-panel">
        <h2 class="section-title">Recapitulatif</h2>

        {#if !items.length}
            <p>Votre panier est vide.</p>
            <a class="cta" href="/articles">Voir les articles</a>
        {:else}
            <ul class="cart-list">
                {#each items as item}
                    <li class="cart-row">
                        <img
                            class="thumb"
                            src="/images/{item.slug}.webp"
                            alt={item.title ?? `Article #${item.article_id}`}
                        />
                        <div class="info">
                            <h3>{item.title ?? `Article #${item.article_id}`}</h3>
                            <p class="meta">{item.slices} parts</p>
                            <p class="meta unit">{fmtPrice(Number(item.unit_price) / item.quantity)} / pièce</p>
                        </div>
                        <div class="qty">
                            <form method="POST" action="?/deleteFromCart" use:enhance>
                                <input type="hidden" name="articleId" value={item.article_id} />
                                <input type="hidden" name="slices" value={item.slices} />
                                <button class="step" type="submit" aria-label="Diminuer">-</button>
                            </form>
                            <span class="qty-value">{item.quantity}</span>
                            <form method="POST" action="?/addToCart" use:enhance>
                                <input type="hidden" name="articleId" value={item.article_id} />
                                <input type="hidden" name="slices" value={item.slices} />
                                <button class="step" type="submit" aria-label="Augmenter">+</button>
                            </form>
                        </div>
                        <div class="line">
                            <strong>{fmtPrice(item.unit_price)}</strong>
                            <form method="POST" action="?/removeItem" use:enhance>
                                <input type="hidden" name="itemId" value={item.id} />
                                <button class="remove" type="submit">Retirer</button>
                            </form>
                        </div>
                    </li>
                {/each}
            </ul>

            <div class="totals">
                <span>Total</span>
                <strong>{fmtPrice(total)}</strong>
            </div>

            {#if !data.user}
                <p class="hint">Connectez-vous pour finaliser votre commande. <a class="link" href="/account">Se connecter</a></p>
            {/if}

            <form
                id="checkoutForm"
                method="POST"
                action="?/checkout"
                enctype="multipart/form-data"
                use:enhance
                class="extras"
            >
                <label class="field">
                    <span>Date et heure de livraison *</span>
                    <input
                        type="datetime-local"
                        name="deliveryDate"
                        required
                        min={minDeliveryDate}
                        bind:value={deliveryDate}
                    />
                    <small class="hint-counter">Choisissez au moins 48 h à l'avance</small>
                </label>

                <label class="field">
                    <span>Message pour la pâtissière (optionnel)</span>
                    <textarea
                        name="message"
                        rows="3"
                        maxlength={MAX_MESSAGE}
                        placeholder="Précisions, allergies, thème…"
                        bind:value={message}
                    ></textarea>
                    <small class="hint-counter">{message.length}/{MAX_MESSAGE}</small>
                </label>

                <label class="field">
                    <span>Photos d'inspiration (jusqu'à {MAX_PHOTOS}, {MAX_PHOTO_BYTES / (1024 * 1024)} Mo max chacune)</span>
                    <input
                        type="file"
                        name="photos"
                        accept={ACCEPTED_TYPES.join(',')}
                        multiple
                        bind:this={photoInput}
                        onchange={onPhotosChange}
                        disabled={selectedPhotos.length >= MAX_PHOTOS}
                    />
                    {#if selectedPhotos.length}
                        <ul class="photo-list">
                            {#each selectedPhotos as photo, i}
                                <li class="photo-item">
                                    <span class="photo-name">{photo.name}</span>
                                    <button
                                        type="button"
                                        class="photo-remove"
                                        onclick={() => removePhoto(i)}
                                        aria-label="Retirer la photo"
                                    >×</button>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                    {#if photoError}
                        <small class="field-error">{photoError}</small>
                    {/if}
                    <small class="hint-counter">{selectedPhotos.length} / {MAX_PHOTOS} photo(s) sélectionnée(s)</small>
                </label>
            </form>

            <div class="actions">
                <a class="back" href="/articles">Continuer mes achats</a>
                <form method="POST" action="?/clearCart" use:enhance>
                    <button type="submit" class="ghost">Vider le panier</button>
                </form>
                <button
                    type="submit"
                    form="checkoutForm"
                    class="primary"
                    disabled={!data.user || !!photoError}
                >Valider la commande</button>
            </div>
        {/if}
    </section>
</div>

<style>
.cart-panel {
    width: 100%;
    max-width: 1000px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}
.cart-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    list-style: none;
    padding: 0;
}
.cart-row {
    display: grid;
    grid-template-columns: 90px 1fr auto auto;
    gap: 1rem;
    align-items: center;
    padding: 0.8rem;
    border: 2px solid var(--secondary);
    border-radius: var(--smaller-radius);
}
.thumb {
    width: 90px;
    height: 90px;
    object-fit: cover;
    border-radius: var(--smaller-radius);
}
.info { display: flex; flex-direction: column; gap: 0.3rem; }
.info h3 {
    font-family: "Artistic", serif;
    font-size: 1.3rem;
    color: var(--secondary);
}
.meta {
    font-family: "Visibility", serif;
    color: var(--secondary);
    margin: 0;
}
.unit { opacity: 0.75; font-size: 0.9rem; }
.qty {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.step {
    width: 36px;
    height: 36px;
    padding: 0;
    font-size: 1.3rem;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}
.qty-value {
    font-family: "Visibility", serif;
    color: var(--secondary);
    min-width: 1.5rem;
    text-align: center;
    font-weight: 600;
}
.line {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.4rem;
}
.line strong {
    font-family: "Visibility", serif;
    color: var(--secondary);
    font-size: 1.1rem;
}
.remove {
    background-color: transparent;
    color: var(--secondary);
    border: none;
    padding: 0;
    font-size: 0.85rem;
    text-decoration: underline;
}
.remove:hover { background-color: transparent; color: #a83232; }
.totals {
    display: flex;
    justify-content: flex-end;
    align-items: baseline;
    gap: 0.8rem;
    font-family: "Visibility", serif;
    color: var(--secondary);
    font-size: 1.2rem;
    padding-top: 0.5rem;
    border-top: 2px solid var(--secondary);
}
.actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
}
.back {
    font-family: "Visibility", serif;
    color: var(--secondary);
    font-weight: 600;
    padding: 0.5rem 1rem;
    border: 2px solid var(--secondary);
    border-radius: var(--smaller-radius);
    transition: all 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
}
.back:hover { background-color: var(--secondary); color: var(--primary); }
.ghost { background-color: transparent; color: var(--secondary); }
.ghost:hover { background-color: var(--secondary); color: var(--primary); }
.primary { font-size: 1.05rem; padding: 0.6rem 1.4rem; }
.primary:disabled { opacity: 0.5; cursor: not-allowed; }
.alert {
    width: 100%;
    max-width: 1000px;
    padding: 0.75rem 1rem;
    border-radius: var(--smaller-radius);
    font-family: "Visibility", serif;
}
.alert.ok { background-color: #d6efd6; color: #245524; }
.alert.error { background-color: #f6d6d6; color: #6b1f1f; }
.hint { font-style: italic; opacity: 0.85; font-family: "Visibility", serif; }
.link { text-decoration: underline; }
.extras {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 0.5rem;
    border-top: 2px solid var(--secondary);
}
.field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-family: "Visibility", serif;
    color: var(--secondary);
    font-size: 0.95rem;
}
.field > span { font-weight: 600; }
.field textarea {
    padding: 0.5rem;
    border: solid 2px var(--secondary);
    border-radius: var(--smaller-radius);
    background-color: transparent;
    font-family: inherit;
    color: var(--secondary);
    resize: vertical;
}
.field textarea:focus { outline: none; }
.field input[type="datetime-local"] {
    padding: 0.5rem;
    border: solid 2px var(--secondary);
    border-radius: var(--smaller-radius);
    background-color: transparent;
    font-family: inherit;
    color: var(--secondary);
}
.field input[type="datetime-local"]:focus { outline: none; }
.field input[type="file"] {
    padding: 0.4rem;
    background-color: transparent;
    border: dashed 2px var(--secondary);
    color: var(--secondary);
    font-family: inherit;
    cursor: pointer;
}
.hint-counter {
    font-family: "Visibility", serif;
    font-size: 0.8rem;
    opacity: 0.7;
    align-self: flex-end;
}
.field-error {
    font-family: "Visibility", serif;
    font-size: 0.85rem;
    color: #a83232;
}
.photo-list {
    list-style: none;
    padding: 0;
    margin: 0.3rem 0 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}
.photo-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.3rem 0.6rem;
    border: solid 1px var(--secondary);
    border-radius: var(--smaller-radius);
    font-size: 0.9rem;
}
.photo-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.photo-remove {
    background-color: transparent;
    color: var(--secondary);
    border: none;
    padding: 0 0.3rem;
    font-size: 1.2rem;
    line-height: 1;
    cursor: pointer;
}
.photo-remove:hover { color: #a83232; background-color: transparent; }

@media (max-width: 800px) {
    .cart-row {
        grid-template-columns: 80px 1fr;
        gap: 0.8rem;
    }
    .qty, .line { grid-column: 1 / -1; flex-direction: row; justify-content: space-between; }
}
</style>
