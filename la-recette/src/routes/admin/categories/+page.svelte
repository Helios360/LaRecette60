<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData, PageData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();

    let search = $state('');
    let creating = $state(false);
    let editingId = $state<number | null>(null);

    let filtered = $derived.by(() => {
        const q = search.trim().toLowerCase();
        if (!q) return data.categories;
        return data.categories.filter((c: any) => (c.name ?? '').toLowerCase().includes(q));
    });
</script>

<div class="admin-card card">
    <div class="head">
        <h2>Categories ({data.categories.length})</h2>
        <div class="head-actions">
            <input type="search" placeholder="Rechercher..." bind:value={search} />
            <button type="button" onclick={() => { creating = !creating; editingId = null; }}>
                {creating ? 'Annuler' : 'Nouvelle catégorie'}
            </button>
        </div>
    </div>

    {#if form?.message}<p class="alert ok">{form.message}</p>{/if}
    {#if form?.error}<p class="alert error">{form.error}</p>{/if}

    {#if creating}
        <form method="POST" action="?/create" use:enhance={() => async ({ result, update }) => {
            if (result.type === 'success') creating = false;
            await update();
        }} class="form-card">
            <h3>Nouvelle categorie</h3>
            <div class="form">
                <label class="wide">
                    Nom*
                    <input type="text" name="name" required maxlength="150" placeholder="ex: Number cakes" />
                </label>
                <div class="actions">
                    <button type="submit">Créer</button>
                </div>
            </div>
        </form>
    {/if}

    {#if !filtered.length}
        <p>Aucune catégorie.</p>
    {:else}
        <ul class="categories">
            {#each filtered as cat (cat.id)}
                <li class:open={editingId === cat.id}>
                    <button type="button" class="row" onclick={() => { editingId = editingId === cat.id ? null : cat.id; creating = false; }}>
                        <span class="info">
                            <strong>{cat.name}</strong>
                            <span class="meta">{cat.article_count} article{Number(cat.article_count) > 1 ? 's' : ''}</span>
                        </span>
                    </button>

                    {#if editingId === cat.id}
                        <div class="edit">
                            <form method="POST" action="?/update" use:enhance={() => async ({ result, update }) => {
                                if (result.type === 'success') editingId = null;
                                await update();
                            }} class="form">
                                <input type="hidden" name="id" value={cat.id} />
                                <label class="wide">
                                    Nom*
                                    <input type="text" name="name" value={cat.name} required maxlength="150" />
                                </label>
                                <div class="actions">
                                    <button type="submit">Enregistrer</button>
                                </div>
                            </form>
                            <form method="POST" action="?/delete" use:enhance class="delete-form">
                                <input type="hidden" name="id" value={cat.id} />
                                <button class="danger" type="submit"
                                    onclick={(e) => { if (!confirm('Supprimer cette catégorie ?')) e.preventDefault(); }}>
                                    Supprimer la catégorie
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

.categories { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.categories li {
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
    padding: 0.7rem 1rem;
    display: flex;
    gap: 0.8rem;
    align-items: center;
    text-align: left;
    cursor: pointer;
    font-family: "Visibility", serif;
    border-radius: 0;
}
.row:hover { background-color: var(--tertiary); color: var(--secondary); }
.row .info { display: flex; flex-direction: column; gap: 0.2rem; }
.row .info .meta { font-size: 0.8rem; opacity: 0.7; }

.edit { padding: 1rem; border-top: 2px solid var(--secondary); background-color: var(--tertiary); }
.form { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.8rem; }
.form label { display: flex; flex-direction: column; gap: 0.3rem; font-family: "Visibility", serif; font-size: 0.9rem; color: var(--secondary); }
.form .wide { grid-column: 1 / -1; }
.actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; }
.delete-form { margin-top: 0.7rem; display: flex; justify-content: flex-end; }
.danger { background-color: #a83232; border-color: #a83232; }
.danger:hover { background-color: var(--primary); color: #a83232; border-color: #a83232; }
@media (max-width: 800px) {
    .form { grid-template-columns: 1fr; }
}
</style>
