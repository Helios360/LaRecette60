<script lang="ts">
    import type { PageData } from "./$types";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";

    let { data }: { data: PageData } = $props();

    function fmtPrice(n: any) {
        return Number(n ?? 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
    }
    function fmtTime(d: any) {
        if (!d) return "—";
        try { return new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); } catch { return "—"; }
    }
    function fmtDate(d: any) {
        if (!d) return "—";
        try { return new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }); } catch { return "—"; }
    }

    function navDay(delta: number) {
        const d = new Date(data.date);
        d.setDate(d.getDate() + delta);
        const u = new URL(page.url);
        u.searchParams.set("date", d.toISOString().slice(0, 10));
        goto(u.pathname + "?" + u.searchParams.toString(), { keepFocus: true, noScroll: true });
    }

    function today() {
        const u = new URL(page.url);
        u.searchParams.delete("date");
        goto(u.pathname + (u.searchParams.toString() ? "?" + u.searchParams.toString() : ""), { keepFocus: true, noScroll: true });
    }

    let orders = $derived(data.orders);

    // For the production table: flat list of all items across all orders
    let allItems = $derived(
        orders.flatMap((o: any) =>
            (o.items ?? []).map((it: any) => ({
                ...it,
                client: o.user_fname ?? o.user_name ?? o.user_email ?? "Invité",
                time: fmtTime(o.delivery_date),
                message: o.customer_message,
            }))
        )
    );

    let totalOrders = $derived(orders.length);
    let totalItems = $derived(allItems.reduce((s: number, i: any) => s + Number(i.quantity), 0));
    let totalRevenue = $derived(orders.reduce((s: number, o: any) => s + Number(o.total), 0));
</script>

<svelte:head>
    <title>Commandes du jour — La Recette</title>
</svelte:head>

<div class="page">
    <div class="no-print controls">
        <button onclick={() => navDay(-1)}>← Jour précédent</button>
        <button onclick={today}>Aujourd'hui</button>
        <button onclick={() => navDay(1)}>Jour suivant →</button>
        <button class="print-btn" onclick={() => window.print()}>🖨 Imprimer</button>
    </div>

    <h1>Commandes du {fmtDate(data.date)}</h1>
    {#if data.error}
        <p class="error">{data.error}</p>
    {/if}

    <div class="summary">
        <span><strong>{totalOrders}</strong> commande{totalOrders > 1 ? "s" : ""}</span>
        <span><strong>{totalItems}</strong> article{totalItems > 1 ? "s" : ""}</span>
        <span><strong>{fmtPrice(totalRevenue)}</strong> total</span>
    </div>

    {#if !orders.length}
        <p class="empty">Aucune commande pour ce jour.</p>
    {:else}
        {#each orders as order (order.id)}
            <div class="order-card">
                <div class="order-head">
                    <span class="order-time">{fmtTime(order.delivery_date)}</span>
                    <span class="order-client">{order.user_fname ?? ""} {order.user_name ?? order.user_email ?? "Invité"}</span>
                    <span class="order-total">{fmtPrice(order.total)}</span>
                    <span class="status {order.status}">{order.status}</span>
                </div>

                {#if order.customer_message}
                    <p class="message">📝 {order.customer_message}</p>
                {/if}

                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Qté</th>
                            <th>Article</th>
                            <th>Parts</th>
                            <th>Prix</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each order.items as item}
                            <tr>
                                <td>{item.quantity}</td>
                                <td>
                                    {item.title ?? `#${item.article_id}`}
                                    {#if item.options && Object.keys(item.options).length > 0}
                                        <div class="item-opts">
                                            {#each Object.entries(item.options) as [k, v]}
                                                <span class="opt-tag">
                                                    {k === 'extras' ? 'Options' : k}:
                                                    {Array.isArray(v) ? v.join(', ') : v}
                                                </span>
                                            {/each}
                                        </div>
                                    {/if}
                                </td>
                                <td>{item.slices}</td>
                                <td class="num">{fmtPrice(item.unit_price)}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>

                {#if order.photos_folder}
                    <p class="photos">📷 Dossier photos : <code>{order.photos_folder}</code></p>
                {/if}
            </div>
        {/each}
    {/if}
</div>

<style>
    .page {
        background-color: var(--primary);
        border-radius: var(--smaller-radius);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    h1 {
        font-family: "Artistic", serif;
        font-size: 1.7rem;
        color: var(--headers);
    }
    .controls {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        align-items: center;
    }
    .controls button {
        font-family: "Visibility", serif;
        padding: 0.4rem 0.8rem;
        border-radius: var(--smaller-radius);
        cursor: pointer;
        background-color: var(--tertiary);
        color: var(--secondary);
        border: 2px solid var(--secondary);
        transition: background-color 0.2s;
    }
    .controls button:hover { background-color: var(--secondary); color: var(--primary); }
    .print-btn { margin-left: auto; }
    .error { color: #6b1f1f; background-color: #f6d6d6; padding: 0.6rem 0.9rem; border-radius: var(--smaller-radius); font-family: "Visibility", serif; }
    .empty { font-family: "Visibility", serif; color: var(--secondary); opacity: 0.8; }
    .summary {
        display: flex;
        gap: 2rem;
        font-family: "Visibility", serif;
        color: var(--secondary);
        font-size: 1.1rem;
    }
    .summary strong { color: var(--headers); }

    .order-card {
        border: 2px solid var(--secondary);
        border-radius: var(--smaller-radius);
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        break-inside: avoid;
    }
    .order-head {
        display: grid;
        grid-template-columns: auto 1fr auto auto;
        gap: 0.8rem;
        align-items: center;
        font-family: "Visibility", serif;
        font-size: 1rem;
        color: var(--secondary);
    }
    .order-time { font-weight: 600; font-size: 1.1rem; }
    .order-client { font-weight: 500; }
    .order-total { font-weight: 600; text-align: right; }
    .message {
        font-family: "Visibility", serif;
        font-size: 0.9rem;
        color: var(--secondary);
        background-color: var(--tertiary);
        padding: 0.5rem 0.8rem;
        border-radius: var(--smaller-radius);
    }
    .photos {
        font-family: "Visibility", serif;
        font-size: 0.85rem;
        color: var(--secondary);
    }
    .photos code { background-color: var(--tertiary); padding: 0.1rem 0.3rem; border-radius: 3px; }
    .item-opts { display: flex; flex-wrap: wrap; gap: 0.2rem 0.4rem; margin-top: 0.2rem; }
    .opt-tag { background-color: #e8e0f0; color: #4a3055; padding: 0.05rem 0.4rem; border-radius: 3px; font-size: 0.75rem; white-space: nowrap; }
    .status {
        padding: 0.15rem 0.6rem;
        border-radius: 999px;
        font-size: 0.78rem;
        text-transform: uppercase;
        text-align: center;
    }
    .status.pending { background-color: #f0e0a0; color: #6b5a1f; }
    .status.completed { background-color: #d6efd6; color: #245524; }
    .status.cancelled { background-color: #e0e0e0; color: #444; }

    .items-table {
        width: 100%;
        border-collapse: collapse;
        font-family: "Visibility", serif;
        font-size: 0.9rem;
        color: var(--secondary);
    }
    .items-table th {
        text-align: left;
        padding: 0.3rem 0.5rem;
        border-bottom: 2px solid var(--secondary);
        font-weight: 600;
        color: var(--headers);
    }
    .items-table td {
        padding: 0.3rem 0.5rem;
        border-bottom: 1px solid var(--tertiary);
    }
    .items-table .num { text-align: right; }

    @media print {
        .no-print { display: none; }
        .page { border-radius: 0; padding: 0; }
        .order-card { break-inside: avoid; border-color: #ccc; }
        .items-table td { border-bottom-color: #ddd; }
        .summary { font-size: 0.95rem; }
        h1 { font-size: 1.4rem; }
    }
</style>