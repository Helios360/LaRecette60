<script lang="ts">
    import Hero from '$lib/components/hero.svelte';
    import { enhance } from '$app/forms';
    import type { ActionData } from './$types';

    let { form } : { form: ActionData | null } = $props();
    let err = $state('');
    let success = $state(false);
    let busy = $state(false);

    let fields = $state({ name: '', email: '', phone: '', message: '' });
    let photos = $state<File[]>([]);
    let photoError = $state('');

    const MAX_PHOTOS = 3;
    const MAX_FILE_SIZE = 5_000_000;

    function addPhotos(e: Event) {
        const input = e.target as HTMLInputElement;
        const files = Array.from(input.files ?? []);
        photoError = '';
        const combined = [...photos, ...files].slice(0, MAX_PHOTOS);
        const oversized = combined.find((f) => f.size > MAX_FILE_SIZE);
        if (oversized) { photoError = 'Photo trop lourde (5 Mo max)'; return; }
        photos = combined;
        input.value = '';
    }

    function removePhoto(i: number) { photos = photos.filter((_, idx) => idx !== i); }

    async function doSend(e: Event) {
        e.preventDefault();
        err = '';
        if (!fields.name.trim() || !fields.email.trim() || !fields.message.trim()) {
            err = 'Veuillez remplir les champs obligatoires.';
            return;
        }
        busy = true;
        const fd = new FormData();
        fd.append('name', fields.name.trim());
        fd.append('email', fields.email.trim());
        fd.append('phone', fields.phone.trim());
        fd.append('message', fields.message.trim());
        for (const p of photos) fd.append('photos', p);

        const res = await fetch('/contact', { method: 'POST', body: fd });
        busy = false;
        if (!res.ok) { err = 'Erreur d\'envoi. Réessayez ou contactez-nous par téléphone.'; return; }
        success = true;
        fields = { name: '', email: '', phone: '', message: '' };
        photos = [];
    }
</script>

<svelte:head>
    <title>Nous contacter | La Recette</title>
    <meta name="description" content="Demandez un devis personnalisé pour vos événements (mariage, baptême, anniversaire) avec photos à l'appui. La Recette vous répond sous 48h.">
</svelte:head>

<Hero
    title="Nous contacter"
    subtitle="Demandez un devis personnalisé pour vos événements"
    background="/images/macaron-tower.webp"
/>

<div class="page-content">
    {#if success}
        <section class="card contact-success">
            <h2>Message envoyé !</h2>
            <p>Merci pour votre demande. Je vous répondrai par email dans les plus brefs délais.</p>
            <a class="cta" href="/">Retour à l'accueil</a>
        </section>
    {:else}
        <section class="card">
            <h2 class="section-title">Par téléphone ou email .</h2>
            <p><a href="tel:0659723666">06 59 72 36 66</a> · <a href="tel:0344309034">03 44 30 90 34</a></p>
            <p><a href="mailto:larecette60@gmail.com">larecette60@gmail.com</a></p>
        </section>

        <section class="card contact-form-section">
            <h2 class="section-title">Ou via le formulaire .</h2>
            {#if err}<p class="alert error">{err}</p>{/if}
            {#if form?.error}<p class="alert error">{form.error}</p>{/if}

            <form onsubmit={doSend} class="form" novalidate>
                <label>Nom *<input type="text" bind:value={fields.name} required></label>
                <label>Email *<input type="email" bind:value={fields.email} required></label>
                <label class="full">Téléphone<input type="tel" bind:value={fields.phone}></label>
                <label class="full">Message *<textarea bind:value={fields.message} rows="5" required></textarea></label>

                <div class="full photo-section">
                    <p class="label">Photos (3 max, 5 Mo chacune)</p>
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple onchange={addPhotos}>
                    {#if photoError}<p class="field-error">{photoError}</p>{/if}
                    {#if photos.length}
                        <ul class="photo-list">
                            {#each photos as p, i}
                                <li>{p.name} <button type="button" class="ghost" onclick={() => removePhoto(i)}>×</button></li>
                            {/each}
                        </ul>
                    {/if}
                </div>

                <button type="submit" disabled={busy} class="cta full">
                    {busy ? 'Envoi…' : 'Envoyer la demande'}
                </button>
            </form>
        </section>
    {/if}
</div>

<style>
    .contact-success { text-align: center; padding: 3rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .contact-success h2 { font-family: "Artistic", serif; font-size: 2rem; }
    .form { display: flex; flex-wrap: wrap; gap: 1rem; max-width: 700px; }
    .form label { display: flex; flex-direction: column; gap: 0.3rem; flex: 1 1 200px; }
    .form label.full { flex-basis: 100%; }
    .form input, .form textarea { padding: 0.6rem; border: 1px solid #ccc; border-radius: var(--smaller-radius); }
    .photo-section { display: flex; flex-direction: column; gap: 0.5rem; }
    .photo-section .label { font-weight: 600; margin: 0; }
    .photo-list { list-style: none; display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .photo-list li { background: var(--headers); padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; }
    .photo-list .ghost { background: none; border: none; cursor: pointer; color: #a33; font-size: 1.2rem; padding: 0; }
    .cta.full { width: 100%; text-decoration: none; text-align: center; border: 2px solid var(--secondary); background: transparent; color: var(--secondary); padding: 0.75rem; border-radius: var(--smaller-radius); cursor: pointer; }
    .cta.full:hover { background: var(--secondary); color: #fff; }
    .cta.full:disabled { opacity: 0.5; cursor: not-allowed; }
</style>