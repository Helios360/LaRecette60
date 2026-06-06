<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import type { ActionData, PageData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();

    const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    // Used in the Artistic-font h2 (Nickainley misses è/û/é glyphs).
    const MONTHS_ASCII = ['Janvier','Fevrier','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre'];
    const WEEKDAYS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

    function buildMatrix(year: number, month: number, orders: any[]) {
        const byDay = new Map<string, any[]>();
        for (const o of orders) {
            if (!o.delivery_date) continue;
            const d = new Date(o.delivery_date);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            const arr = byDay.get(key) ?? [];
            arr.push(o);
            byDay.set(key, arr);
        }
        const first = new Date(year, month, 1);
        const startOffset = (first.getDay() + 6) % 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const cells: { date: Date | null; orders: any[] }[] = [];
        for (let i = 0; i < startOffset; i++) cells.push({ date: null, orders: [] });
        for (let d = 1; d <= daysInMonth; d++) {
            const dt = new Date(year, month, d);
            const key = `${year}-${month}-${d}`;
            cells.push({ date: dt, orders: byDay.get(key) ?? [] });
        }
        while (cells.length % 7 !== 0) cells.push({ date: null, orders: [] });
        return cells;
    }

    let cells = $derived(buildMatrix(data.year, data.month, data.orders));
    let today = new Date();

    function navMonth(delta: number) {
        let m = data.month + delta;
        let y = data.year;
        if (m < 0) { m = 11; y -= 1; }
        if (m > 11) { m = 0; y += 1; }
        const u = new URL(page.url);
        u.searchParams.set('year', String(y));
        u.searchParams.set('month', String(m));
        u.searchParams.delete('selected');
        goto(u.pathname + '?' + u.searchParams.toString(), { keepFocus: true, noScroll: true });
    }
    function openOrder(id: string) {
        const u = new URL(page.url);
        u.searchParams.set('selected', id);
        goto(u.pathname + '?' + u.searchParams.toString(), { keepFocus: true, noScroll: true });
    }
    function closeOrder() {
        const u = new URL(page.url);
        u.searchParams.delete('selected');
        goto(u.pathname + (u.searchParams.toString() ? '?' + u.searchParams.toString() : ''), { keepFocus: true, noScroll: true });
    }
    function fmtTime(d: any) {
        if (!d) return '';
        try { return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
    }
    function fmtDateTimeLocal(d: any) {
        if (!d) return '';
        try {
            const dt = new Date(d);
            const pad = (n: number) => String(n).padStart(2, '0');
            return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
        } catch { return ''; }
    }
    function fmtPrice(n: any) {
        return Number(n ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
    }
    function isToday(d: Date) {
        return d.getFullYear() === today.getFullYear()
            && d.getMonth() === today.getMonth()
            && d.getDate() === today.getDate();
    }
</script>

<div class="admin-card card">
    <div class="head">
        <h2>Calendrier des commandes</h2>
        <div class="month-nav">
            <button type="button" onclick={() => navMonth(-1)}>‹</button>
            <span>{MONTHS[data.month]} {data.year}</span>
            <button type="button" onclick={() => navMonth(1)}>›</button>
        </div>
    </div>

    {#if form?.message}<p class="alert ok">{form.message}</p>{/if}
    {#if form?.error}<p class="alert error">{form.error}</p>{/if}

    <div class="weekdays">
        {#each WEEKDAYS as wd}<span>{wd}</span>{/each}
    </div>
    <div class="grid">
        {#each cells as cell}
            <div class="cell" class:empty={!cell.date} class:today={cell.date && isToday(cell.date)}>
                {#if cell.date}
                    <span class="day">{cell.date.getDate()}</span>
                    <ul class="cell-orders">
                        {#each cell.orders as o}
                            <li>
                                <button type="button" class="order-chip {o.status}" onclick={() => openOrder(o.id)}>
                                    <span class="time">{fmtTime(o.delivery_date)}</span>
                                    <span class="who">{o.user_name ?? o.user_email ?? 'Invité'}</span>
                                </button>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </div>
        {/each}
    </div>
</div>

<div class="admin-card card">
    <div class="head">
        <h2>Agenda — {MONTHS_ASCII[data.month]} → {MONTHS_ASCII[(data.month + data.agendaMonths - 1) % 12]}</h2>
        <span class="head-count">{data.agenda.length} commande{data.agenda.length > 1 ? 's' : ''}</span>
    </div>
    {#if !data.agenda.length}
        <p>Aucune commande sur cette période.</p>
    {:else}
        <ul class="agenda">
            {#each data.agenda as o (o.id)}
                <li>
                    <button type="button" class="agenda-row" onclick={() => openOrder(o.id)}>
                        <span class="agenda-date">
                            {o.delivery_date ? new Date(o.delivery_date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' }) : '—'}
                        </span>
                        <span class="agenda-time">{fmtTime(o.delivery_date)}</span>
                        <span class="agenda-who">{o.user_fname ?? ''} {o.user_name ?? o.user_email ?? 'Invité'}</span>
                        <span class="agenda-amount">{fmtPrice(o.total_amount)}</span>
                        <span class="status {o.status}">{o.status}</span>
                    </button>
                </li>
            {/each}
        </ul>
    {/if}
</div>

{#if data.selected}
    {@const o = data.selected}
    <div class="modal-backdrop" role="presentation" onclick={closeOrder}></div>
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="order-title">
        <div class="modal-head">
            <h3 id="order-title">Commande #{o.id.slice(0, 8)}</h3>
            <button type="button" class="ghost" onclick={closeOrder}>Fermer</button>
        </div>

        <section class="modal-section">
            <p><strong>Client :</strong> {o.user_fname ?? ''} {o.user_name ?? 'Invité'} ({o.user_email ?? '—'})</p>
            {#if o.user_phone}<p><strong>Téléphone :</strong> {o.user_phone}</p>{/if}
            <p><strong>Créée le :</strong> {new Date(o.created_at).toLocaleString('fr-FR')}</p>
            <p><strong>Total :</strong> {fmtPrice(o.total_amount)}</p>
            {#if o.photos_folder}
                <p><strong>Photos :</strong> <code>{o.photos_folder}</code></p>
            {/if}
        </section>

        <section class="modal-section">
            <h4>Articles</h4>
            {#if !o.items?.length}
                <p>Aucun article.</p>
            {:else}
                <ul class="items">
                    {#each o.items as it}
                        <li>
                            <span>{it.quantity}× {it.title ?? `#${it.article_id}`} <em>({it.slices} parts)</em></span>
                            <span>{fmtPrice(it.unit_price)}</span>
                        </li>
                    {/each}
                </ul>
            {/if}
        </section>

        <form method="POST" action="?/update" use:enhance class="modal-form">
            <input type="hidden" name="id" value={o.id} />
            <label>
                Statut
                <select name="status">
                    <option value="pending" selected={o.status === 'pending'}>En attente</option>
                    <option value="completed" selected={o.status === 'completed'}>Terminée</option>
                    <option value="cancelled" selected={o.status === 'cancelled'}>Annulée</option>
                </select>
            </label>
            <label>
                Date de livraison
                <input type="datetime-local" name="delivery_date" value={fmtDateTimeLocal(o.delivery_date)} />
            </label>
            <label class="wide">
                Message client
                <textarea name="customer_message" rows="3">{o.customer_message ?? ''}</textarea>
            </label>
            <div class="actions">
                <button type="submit">Enregistrer</button>
            </div>
        </form>
    </div>
{/if}

<style>
.admin-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.head { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
.head h2 { font-family: "Artistic", serif; font-size: 1.7rem; color: var(--headers); }
.month-nav { display: flex; align-items: center; gap: 0.7rem; }
.month-nav span { font-family: "Visibility", serif; min-width: 170px; text-align: center; color: var(--secondary); }
.month-nav button { padding: 0.3rem 0.8rem; font-size: 1.2rem; }

.alert { padding: 0.6rem 0.9rem; border-radius: var(--smaller-radius); font-family: "Visibility", serif; }
.alert.ok { background-color: #d6efd6; color: #245524; }
.alert.error { background-color: #f6d6d6; color: #6b1f1f; }

.weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.4rem;
    font-family: "Visibility", serif;
    color: var(--secondary);
    font-weight: 600;
    text-align: center;
    font-size: 0.9rem;
}
.grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.4rem;
}
.cell {
    min-height: 110px;
    background-color: var(--tertiary);
    border: 2px solid transparent;
    border-radius: var(--smaller-radius);
    padding: 0.4rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}
.cell.empty { background-color: transparent; }
.cell.today { border-color: var(--secondary); }
.day { font-family: "Visibility", serif; font-size: 0.85rem; color: var(--headers); font-weight: 600; }
.cell-orders { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.25rem; }
.cell-orders li { padding: 0; }
.order-chip {
    width: 100%;
    text-align: left;
    padding: 0.25rem 0.4rem;
    border-radius: var(--smaller-radius);
    font-family: "Visibility", serif;
    font-size: 0.78rem;
    line-height: 1.15;
    display: flex;
    flex-direction: column;
    border: 2px solid transparent;
    cursor: pointer;
}
.order-chip .time { font-weight: 600; }
.order-chip .who { opacity: 0.85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.order-chip.pending { background-color: #f0e0a0; color: #6b5a1f; border-color: #cdb868; }
.order-chip.completed { background-color: #d6efd6; color: #245524; border-color: #88c188; }
.order-chip.cancelled { background-color: #e0e0e0; color: #444; border-color: #aaa; }
.order-chip:hover { filter: brightness(0.95); }

.head-count { font-family: "Visibility", serif; color: var(--secondary); opacity: 0.8; }
.agenda { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.4rem; }
.agenda li { padding: 0; border: 2px solid var(--secondary); border-radius: var(--smaller-radius); }
.agenda-row {
    width: 100%;
    background-color: transparent;
    color: var(--secondary);
    border: none;
    text-align: left;
    cursor: pointer;
    padding: 0.6rem 1rem;
    display: grid;
    grid-template-columns: 1.4fr 0.6fr 1.6fr 0.8fr 0.9fr;
    gap: 0.8rem;
    align-items: center;
    font-family: "Visibility", serif;
    border-radius: 0;
}
.agenda-row:hover { background-color: var(--tertiary); color: var(--secondary); }
.agenda-date { font-weight: 600; text-transform: capitalize; }
.agenda-time { opacity: 0.85; }
.agenda-who { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.agenda-amount { text-align: right; font-weight: 600; }
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

.modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.45);
    z-index: 20;
}
.modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 21;
    width: min(92vw, 640px);
    max-height: 88vh;
    overflow: auto;
    background-color: var(--primary);
    border-radius: var(--smaller-radius);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.modal-head { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.modal-head h3 { font-family: "Artistic", serif; font-size: 1.5rem; color: var(--headers); }
.modal-section { display: flex; flex-direction: column; gap: 0.4rem; font-family: "Visibility", serif; color: var(--secondary); }
.modal-section h4 { font-family: "Artistic", serif; font-size: 1.1rem; color: var(--headers); }
.items { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.3rem; }
.items li {
    display: flex;
    justify-content: space-between;
    padding: 0.4rem 0.6rem;
    border: 2px solid var(--secondary);
    border-radius: var(--smaller-radius);
    font-family: "Visibility", serif;
    color: var(--secondary);
}
.modal-form { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.8rem; }
.modal-form label { display: flex; flex-direction: column; gap: 0.3rem; font-family: "Visibility", serif; font-size: 0.9rem; color: var(--secondary); }
.modal-form .wide { grid-column: 1 / -1; }
.modal-form textarea {
    padding: 0.5rem;
    border: solid 2px var(--secondary);
    border-radius: var(--smaller-radius);
    background-color: transparent;
    font-size: 1rem;
    color: var(--secondary);
    font-family: "Visibility", serif;
    resize: vertical;
}
.modal-form .actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; }
.ghost { background-color: transparent; color: var(--secondary); }
.ghost:hover { background-color: var(--secondary); color: var(--primary); }

@media (max-width: 800px) {
    .cell { min-height: 80px; }
    .order-chip .who { display: none; }
    .modal-form { grid-template-columns: 1fr; }
    .agenda-row { grid-template-columns: 1fr auto; row-gap: 0.2rem; }
    .agenda-time, .agenda-amount { display: none; }
}
</style>
