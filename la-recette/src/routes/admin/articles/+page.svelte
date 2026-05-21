<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData, PageData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();

    let search = $state('');
    let creating = $state(false);
    let editingId = $state<number | null>(null);

    let filtered = $derived.by(() => {
        const q = search.trim().toLowerCase();
        if (!q) return data.articles;
        return data.articles.filter((a: any) =>
            (a.title ?? '').toLowerCase().includes(q) ||
            (a.slug ?? '').toLowerCase().includes(q) ||
            (a.category_name ?? '').toLowerCase().includes(q)
        );
    });

    function imgFor(article: any) {
        return article.cover_image_key
            ? `/uploads/${article.cover_image_key}`
            : `/images/${article.slug}.webp`;
    }
    function fmtPrice(n: any) {
        return Number(n ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
    }
</script>

<div class="admin-card card">
    <div class="head">
        <h2>Articles ({data.articles.length})</h2>
        <div class="head-actions">
            <input type="search" placeholder="Rechercher..." bind:value={search} />
            <button type="button" onclick={() => { creating = !creating; editingId = null; }}>
                {creating ? 'Annuler' : 'Nouvel article'}
            </button>
        </div>
    </div>

    {#if form?.message}<p class="alert ok">{form.message}</p>{/if}
    {#if form?.error}<p class="alert error">{form.error}</p>{/if}

    {#if creating}
        <form method="POST" action="?/create" use:enhance={() => async ({ result, update }) => {
            if (result.type === 'success') creating = false;
            await update();
        }} enctype="multipart/form-data" class="form-card">
            <h3>Nouvel article</h3>
            <div class="form">
                <label>
                    Slug*
                    <input type="text" name="slug" required placeholder="ex: tarte-au-citron" />
                </label>
                <label>
                    Catégorie
                    <select name="category_id">
                        <option value="">—</option>
                        {#each data.categories as cat}
                            <option value={cat.id}>{cat.name}</option>
                        {/each}
                    </select>
                </label>
                <label class="wide">
                    Titre*
                    <input type="text" name="title" required maxlength="150" />
                </label>
                <label class="wide">
                    Sous-titre*
                    <input type="text" name="subtitle" required maxlength="300" />
                </label>
                <label>
                    Parts (séparées par virgules)*
                    <input type="text" name="slices" required placeholder="8,10,12" />
                </label>
                <label>
                    Prix par part (€)*
                    <input type="number" step="0.01" min="0" name="price" required />
                </label>
                <label class="wide">
                    Image (JPEG/PNG/WEBP/GIF)
                    <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" />
                </label>
                <label class="wide">
                    Description (HTML)
                    <textarea name="details_html" rows="4"></textarea>
                </label>
                <div class="actions">
                    <button type="submit">Créer</button>
                </div>
            </div>
        </form>
    {/if}

    {#if !filtered.length}
        <p>Aucun article.</p>
    {:else}
        <ul class="articles">
            {#each filtered as article (article.id)}
                <li class:open={editingId === article.id}>
                    <button type="button" class="row" onclick={() => { editingId = editingId === article.id ? null : article.id; creating = false; }}>
                        <img src={imgFor(article)} alt="" onerror={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = 'hidden')} />
                        <span class="info">
                            <strong>{article.title}</strong>
                            <em>{article.subtitle}</em>
                            <span class="meta">{article.category_name ?? '—'} · {fmtPrice(article.price)} / part · {article.slices} parts</span>
                        </span>
                        <span class="slug"><code>{article.slug}</code></span>
                    </button>

                    {#if editingId === article.id}
                        <div class="edit">
                            <form method="POST" action="?/update" use:enhance={() => async ({ result, update }) => {
                                if (result.type === 'success') editingId = null;
                                await update();
                            }} enctype="multipart/form-data" class="form">
                                <input type="hidden" name="id" value={article.id} />
                                <label>
                                    Slug*
                                    <input type="text" name="slug" value={article.slug} required />
                                </label>
                                <label>
                                    Catégorie
                                    <select name="category_id">
                                        <option value="">—</option>
                                        {#each data.categories as cat}
                                            <option value={cat.id} selected={cat.id === article.category_id}>{cat.name}</option>
                                        {/each}
                                    </select>
                                </label>
                                <label class="wide">
                                    Titre*
                                    <input type="text" name="title" value={article.title} required maxlength="150" />
                                </label>
                                <label class="wide">
                                    Sous-titre*
                                    <input type="text" name="subtitle" value={article.subtitle} required maxlength="300" />
                                </label>
                                <label>
                                    Parts*
                                    <input type="text" name="slices" value={article.slices} required />
                                </label>
                                <label>
                                    Prix par part (€)*
                                    <input type="number" step="0.01" min="0" name="price" value={article.price} required />
                                </label>
                                <label class="wide">
                                    Image (laisser vide pour conserver)
                                    <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" />
                                    {#if article.cover_image_key}
                                        <span class="hint">Actuelle : <code>{article.cover_image_key}</code></span>
                                    {/if}
                                </label>
                                <label class="wide">
                                    Description (HTML)
                                    <textarea name="details_html" rows="4">{article.details_html ?? ''}</textarea>
                                </label>
                                <div class="actions">
                                    <button type="submit">Enregistrer</button>
                                </div>
                            </form>
                            <form method="POST" action="?/delete" use:enhance class="delete-form">
                                <input type="hidden" name="id" value={article.id} />
                                <button class="danger" type="submit"
                                    onclick={(e) => { if (!confirm('Supprimer cet article ?')) e.preventDefault(); }}>
                                    Supprimer l'article
                                </button>
                            </form>
                        </div>
                    {/if}
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
.admin-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.head { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
.head h2 { font-family: "Artistic", serif; font-size: 1.7rem; color: var(--headers); }
.head-actions { display: flex; gap: 0.7rem; align-items: center; }
.head-actions input { min-width: 220px; }

.alert { padding: 0.6rem 0.9rem; border-radius: var(--smaller-radius); font-family: "Visibility", serif; }
.alert.ok { background-color: #d6efd6; color: #245524; }
.alert.error { background-color: #f6d6d6; color: #6b1f1f; }

.form-card {
    background-color: var(--tertiary);
    border-radius: var(--smaller-radius);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}
.form-card h3 { font-family: "Artistic", serif; font-size: 1.3rem; color: var(--headers); }

.articles { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.articles li {
    border: 2px solid var(--secondary);
    border-radius: var(--smaller-radius);
    overflow: hidden;
    padding: 0;
}
.row {
    width: 100%;
    background-color: transparent;
    color: var(--secondary);
    border: none;
    padding: 0.6rem 1rem;
    display: grid;
    grid-template-columns: 64px 1fr auto;
    gap: 0.8rem;
    align-items: center;
    text-align: left;
    cursor: pointer;
    font-family: "Visibility", serif;
    border-radius: 0;
}
.row:hover { background-color: var(--tertiary); color: var(--secondary); }
.row img {
    width: 64px;
    height: 64px;
    object-fit: cover;
    border-radius: var(--smaller-radius);
    background-color: var(--tertiary);
}
.row .info { display: flex; flex-direction: column; gap: 0.2rem; }
.row .info em { opacity: 0.8; font-size: 0.85rem; }
.row .info .meta { font-size: 0.8rem; opacity: 0.7; }
.row .slug code { font-family: monospace; font-size: 0.85rem; opacity: 0.8; }

.edit { padding: 1rem; border-top: 2px solid var(--secondary); background-color: var(--tertiary); }
.form { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.8rem; }
.form label { display: flex; flex-direction: column; gap: 0.3rem; font-family: "Visibility", serif; font-size: 0.9rem; color: var(--secondary); }
.form .wide { grid-column: 1 / -1; }
.form textarea {
    padding: 0.5rem;
    border: solid 2px var(--secondary);
    border-radius: var(--smaller-radius);
    background-color: transparent;
    font-size: 1rem;
    color: var(--secondary);
    font-family: "Visibility", serif;
    resize: vertical;
}
.actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; }
.delete-form { margin-top: 0.7rem; display: flex; justify-content: flex-end; }
.danger { background-color: #a83232; border-color: #a83232; }
.danger:hover { background-color: var(--primary); color: #a83232; border-color: #a83232; }
.hint { font-size: 0.8rem; opacity: 0.7; }
@media (max-width: 800px) {
    .row { grid-template-columns: 56px 1fr; }
    .row .slug { display: none; }
    .form { grid-template-columns: 1fr; }
}
</style>
