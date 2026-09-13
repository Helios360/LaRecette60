<script lang="ts">
    import type { PageData } from "./$types";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";

    let { data }: { data: PageData } = $props();

    function fmtPrice(n: any) {
        return Number(n ?? 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
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

    let items = $derived(data.production);
    let totalItems = $derived(items.reduce((s: number, g: any) => s + g.quantity, 0));
    let totalRevenue = $derived(items.reduce((s: number, g: any) => s + g.totalPrice, 0));
</script>

<svelte:head>
    <title>Production du jour — La Recette</title>
</svelte:head>

<div class="page">
    <div class="no-print controls">
        <button onclick={() => navDay(-1)}>← Jour précédent</button>
        <button onclick={today}>Aujourd'hui</button>
        <button onclick={() => navDay(1)}>Jour suivant →</button>
        <button class="print-btn" onclick={() => window.print()}>🖨 Imprimer</button>
    </div>

    <h1>Production du {fmtDate(data.date)}</h1>
    {#if data.error}
        <p class="error">{data.error}</p>
    {/if}

    <div class="summary">
        <span><strong>{items.length}</strong> article{items.length > 1 ? "s" : ""} différents</span>
        <span><strong>{totalItems}</strong> unité{totalItems > 1 ? "s" : ""} à produire</span>
        <span><strong>{fmtPrice(totalRevenue)}</strong> total</span>
    </div>

    {#if !items.length}
        <p class="empty">Aucune production pour ce jour.</p>
    {:else}
        {#each items as group, i}
            <div class="prod-card">
                <div class="prod-head">
                    <span class="prod-rank">#{i + 1}</span>
                    <span class="prod-title">{group.title}</span>
                    <span class="prod-qty">{group.quantity}</span>
                    <span class="prod-total">{fmtPrice(group.totalPrice)}</span>
                </div>
                <div class="prod-detail">
                    <span class="prod-slices">{group.slicesList.join(", ")}</span>
                    <span class="prod-clients">{group.clients.map((c: any) => c.name + " (" + c.time + ")").join(", ")}</span>
                    {#each group.clients as c}
                        {#if c.message}
                            <p class="prod-msg">📝 {c.name} : {c.message}</p>
                        {/if}
                        {#if c.options && Object.keys(c.options).length > 0}
                            <div class="prod-opts">
                                {#each Object.entries(c.options) as [k, v]}
                                    {@const label = {extras: "Options", theme_description: "Thème", colors: "Couleurs"}[k] ?? k}
                                    <span class="opt"><strong>{label}:</strong> {Array.isArray(v) ? v.join(", ") : v}</span>
                                {/each}
                            </div>
                        {/if}
                    {/each}
                </div>
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

    .prod-card {
        border: 2px solid var(--secondary);
        border-radius: var(--smaller-radius);
        padding: 0.8rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        break-inside: avoid;
    }
    .prod-head {
        display: grid;
        grid-template-columns: auto 1fr auto auto;
        gap: 0.8rem;
        align-items: center;
        font-family: "Visibility", serif;
        font-size: 1.05rem;
        color: var(--secondary);
    }
    .prod-rank { font-weight: 600; color: var(--headers); font-size: 0.9rem; }
    .prod-title { font-weight: 600; color: var(--headers); }
    .prod-qty {
        font-size: 1.3rem;
        font-weight: 700;
        color: var(--secondary);
        text-align: center;
        background-color: var(--tertiary);
        padding: 0.15rem 0.6rem;
        border-radius: var(--smaller-radius);
        min-width: 2rem;
        text-align: center;
    }
    .prod-total { font-weight: 600; text-align: right; }
    .prod-detail {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        font-family: "Visibility", serif;
        font-size: 0.85rem;
        color: var(--secondary);
        opacity: 0.85;
    }
    .prod-slices { display: none; }
    .prod-clients { display: none; }
    .prod-msg {
        font-style: italic;
        margin: 0.15rem 0;
        padding: 0.2rem 0.5rem;
        background-color: var(--tertiary);
        border-radius: var(--smaller-radius);
    }
    .prod-opts {
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem 0.8rem;
        margin: 0.15rem 0;
        padding: 0.2rem 0.5rem;
        font-size: 0.8rem;
    }
    .opt {
        background-color: #e8e0f0;
        color: #4a3055;
        padding: 0.1rem 0.5rem;
        border-radius: var(--smaller-radius);
    }

    @media print {
        .no-print { display: none; }
        .page { border-radius: 0; padding: 0; }
        .prod-card { break-inside: avoid; border-color: #ccc; }
        .summary { font-size: 0.95rem; }
        h1 { font-size: 1.4rem; }
        .prod-qty { font-size: 1.1rem; }
    }
</style>