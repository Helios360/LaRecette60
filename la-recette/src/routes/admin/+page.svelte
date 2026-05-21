<script lang="ts">
    import type { PageData } from './$types';
    let { data } : { data: PageData } = $props();

    function fmtDate(d: any) {
        if (!d) return '—';
        try { return new Date(d).toLocaleString('fr-FR'); } catch { return String(d); }
    }
    function fmtPrice(n: any) {
        return Number(n ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
    }
</script>

<div class="admin-card card">
    <h2>Tableau de bord</h2>
    <div class="stats">
        <a class="stat" href="/admin/clients">
            <span class="num">{data.stats.clients}</span>
            <span class="label">Clients</span>
        </a>
        <a class="stat" href="/admin/articles">
            <span class="num">{data.stats.articles}</span>
            <span class="label">Articles</span>
        </a>
        <a class="stat" href="/admin/calendar">
            <span class="num">{data.stats.pending}</span>
            <span class="label">Commandes à venir</span>
        </a>
        <a class="stat" href="/admin/calendar">
            <span class="num">{data.stats.completed}</span>
            <span class="label">Commandes terminées</span>
        </a>
    </div>
</div>

<div class="admin-card card">
    <h2>Prochaines livraisons</h2>
    {#if !data.upcoming.length}
        <p>Aucune livraison prévue.</p>
    {:else}
        <ul class="upcoming">
            {#each data.upcoming as order}
                <li>
                    <a href="/admin/calendar?selected={order.id}">
                        <span class="when">{fmtDate(order.delivery_date)}</span>
                        <span class="who">{order.user_name ?? order.user_email ?? 'Invité'}</span>
                        <span class="amount">{fmtPrice(order.total_amount)}</span>
                        <span class="status {order.status}">{order.status}</span>
                    </a>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
.admin-card {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.admin-card h2 {
    font-family: "Artistic", serif;
    font-size: 1.7rem;
    color: var(--headers);
}
.stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
}
.stat {
    background-color: var(--tertiary);
    border-radius: var(--smaller-radius);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    text-align: center;
    color: var(--secondary);
    transition: transform 0.2s ease;
}
.stat:hover { transform: translateY(-2px); }
.stat .num {
    font-family: "Artistic", serif;
    font-size: 2.2rem;
    color: var(--headers);
}
.stat .label { font-family: "Visibility", serif; font-size: 0.95rem; }
.upcoming { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.upcoming li {
    padding: 0;
    border: 2px solid var(--secondary);
    border-radius: var(--smaller-radius);
}
.upcoming a {
    display: grid;
    grid-template-columns: 1.5fr 1.5fr 0.8fr 0.8fr;
    gap: 0.5rem;
    align-items: center;
    padding: 0.7rem 1rem;
    color: var(--secondary);
    font-family: "Visibility", serif;
}
.status {
    padding: 0.15rem 0.6rem;
    border-radius: 999px;
    font-size: 0.8rem;
    text-transform: uppercase;
    text-align: center;
}
.status.pending { background-color: #f0e0a0; color: #6b5a1f; }
.status.completed { background-color: #d6efd6; color: #245524; }
.status.cancelled { background-color: #e0e0e0; color: #444; }
@media (max-width: 600px) {
    .upcoming a { grid-template-columns: 1fr 1fr; }
}
</style>
