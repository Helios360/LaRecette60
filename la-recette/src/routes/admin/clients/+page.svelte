<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData, PageData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();

    let search = $state('');
    let expandedId = $state<string | null>(null);

    let filtered = $derived.by(() => {
        const q = search.trim().toLowerCase();
        if (!q) return data.clients;
        return data.clients.filter((c: any) =>
            (c.name ?? '').toLowerCase().includes(q) ||
            (c.fname ?? '').toLowerCase().includes(q) ||
            (c.email ?? '').toLowerCase().includes(q) ||
            (c.phone ?? '').toLowerCase().includes(q) ||
            (c.city ?? '').toLowerCase().includes(q)
        );
    });

    function toggle(id: string) { expandedId = expandedId === id ? null : id; }
    function fmtDate(d: any) {
        if (!d) return '';
        try { return new Date(d).toLocaleDateString('fr-FR'); } catch { return String(d); }
    }
</script>

<div class="admin-card card">
    <div class="head">
        <h2>Clients ({data.clients.length})</h2>
        <input type="search" placeholder="Rechercher..." bind:value={search} />
    </div>

    {#if form?.message}<p class="alert ok">{form.message}</p>{/if}
    {#if form?.error}<p class="alert error">{form.error}</p>{/if}

    {#if !filtered.length}
        <p>Aucun client.</p>
    {:else}
        <ul class="clients">
            {#each filtered as client (client.id)}
                <li class:open={expandedId === client.id}>
                    <button class="row" type="button" onclick={() => toggle(client.id)}>
                        <span class="who">
                            <strong>{client.fname ?? ''} {client.name ?? ''}</strong>
                            <em>{client.email}</em>
                        </span>
                        <span class="phone">{client.phone ?? ''}</span>
                        <span class="city">{client.city ?? ''}</span>
                        <span class="orders">{client.total_orders} cmd.</span>
                        <span class="role-tag" class:admin={Number(client.role) === 1}>
                            {Number(client.role) === 1 ? 'Admin' : 'Client'}
                        </span>
                    </button>

                    {#if expandedId === client.id}
                        <div class="edit">
                            <p class="meta">
                                Membre depuis {fmtDate(client.createdAt)} —
                                ID : <code>{client.id}</code>
                            </p>
                            <form method="POST" action="?/update" use:enhance class="form">
                                <input type="hidden" name="id" value={client.id} />
                                <label>
                                    Nom
                                    <input type="text" name="name" value={client.name ?? ''} />
                                </label>
                                <label>
                                    Prénom
                                    <input type="text" name="fname" value={client.fname ?? ''} />
                                </label>
                                <label>
                                    Téléphone
                                    <input type="tel" name="phone" value={client.phone ?? ''} />
                                </label>
                                <label>
                                    Ville
                                    <input type="text" name="city" value={client.city ?? ''} />
                                </label>
                                <label class="wide">
                                    Adresse
                                    <input type="text" name="address" value={client.address ?? ''} />
                                </label>
                                <label>
                                    Rôle
                                    <select name="role">
                                        <option value="0" selected={Number(client.role) !== 1}>Client</option>
                                        <option value="1" selected={Number(client.role) === 1}>Admin</option>
                                    </select>
                                </label>
                                <div class="actions">
                                    <button type="submit">Enregistrer</button>
                                </div>
                            </form>
                            <form method="POST" action="?/delete" use:enhance class="delete-form">
                                <input type="hidden" name="id" value={client.id} />
                                <button class="danger" type="submit"
                                    onclick={(e) => { if (!confirm('Supprimer définitivement ce client ?')) e.preventDefault(); }}>
                                    Supprimer le client
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
.head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}
.head h2 { font-family: "Artistic", serif; font-size: 1.7rem; color: var(--headers); }
.head input { min-width: 220px; }
.alert { padding: 0.6rem 0.9rem; border-radius: var(--smaller-radius); font-family: "Visibility", serif; }
.alert.ok { background-color: #d6efd6; color: #245524; }
.alert.error { background-color: #f6d6d6; color: #6b1f1f; }
.clients { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.clients li {
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
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 0.7fr 0.8fr;
    gap: 0.8rem;
    align-items: center;
    font-family: "Visibility", serif;
    text-align: left;
    cursor: pointer;
    border-radius: 0;
}
.row:hover { background-color: var(--tertiary); color: var(--secondary); }
.row .who { display: flex; flex-direction: column; gap: 0.2rem; }
.row em { opacity: 0.8; font-size: 0.85rem; }
.role-tag {
    padding: 0.15rem 0.6rem;
    border-radius: 999px;
    font-size: 0.8rem;
    text-align: center;
    background-color: #e0e0e0;
    color: #444;
}
.role-tag.admin { background-color: var(--secondary); color: var(--primary); }
.edit { padding: 1rem; border-top: 2px solid var(--secondary); background-color: var(--tertiary); }
.meta { font-family: "Visibility", serif; font-size: 0.85rem; opacity: 0.8; margin-bottom: 0.7rem; }
.meta code { font-family: monospace; }
.form {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
}
.form label { display: flex; flex-direction: column; gap: 0.3rem; font-family: "Visibility", serif; font-size: 0.9rem; }
.form .wide { grid-column: 1 / -1; }
.actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; }
.delete-form { margin-top: 0.7rem; display: flex; justify-content: flex-end; }
.danger { background-color: #a83232; border-color: #a83232; }
.danger:hover { background-color: var(--primary); color: #a83232; border-color: #a83232; }
@media (max-width: 800px) {
    .row { grid-template-columns: 1fr 1fr; }
    .row .city, .row .phone { display: none; }
    .form { grid-template-columns: 1fr; }
}
</style>
