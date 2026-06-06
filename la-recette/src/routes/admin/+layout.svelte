<script lang="ts">
    import Hero from '$lib/components/hero.svelte';
    import { page } from '$app/state';
    let { children } = $props();
    function isActive(href: string) {
        const path = page.url.pathname;
        if (href === '/admin') return path === '/admin';
        return path === href || path.startsWith(href + '/');
    }
</script>
<Hero 
    title="La Recette Pâtisserie"
    subtitle="INTERFACE ADMIN"
    background="/images/Boutique.png"
    />
<div class="admin-shell">
    <aside class="admin-nav">
        <h2>Administration</h2>
        <nav>
            <a href="/admin" class:active={isActive('/admin')}>Tableau de bord</a>
            <a href="/admin/clients" class:active={isActive('/admin/clients')}>Clients</a>
            <a href="/admin/calendar" class:active={isActive('/admin/calendar')}>Calendrier</a>
            <a href="/admin/articles" class:active={isActive('/admin/articles')}>Articles</a>
            <a href="/admin/categories" class:active={isActive('/admin/categories')}>Catégories</a>
        </nav>
    </aside>
    <section class="admin-content">
        {@render children()}
    </section>
</div>

<style>
.admin-shell {
    width: 100%;
    min-height: 100svh;
    padding: 110px 2rem 3rem;
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 2rem;
    align-items: start;
    background-color: var(--tertiary);
}
.admin-nav {
    position: sticky;
    top: 110px;
    background-color: var(--primary);
    border-radius: var(--smaller-radius);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.admin-nav h2 {
    font-family: "Artistic", serif;
    font-size: 1.4rem;
    color: var(--headers);
}
.admin-nav nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
}
.admin-nav nav a {
    padding: 0.6rem 0.9rem;
    border-radius: var(--smaller-radius);
    color: var(--secondary);
    font-family: "Visibility", serif;
    border: 2px solid transparent;
    width:100%;
    transition: background-color 0.2s ease, color 0.2s ease;
}
.admin-nav nav a:hover { background-color: var(--tertiary); }
.admin-nav nav a.active {
    background-color: var(--secondary);
    color: var(--primary);
}
.admin-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}
@media (max-width: 800px) {
    .admin-shell {
        grid-template-columns: 1fr;
        padding-top: 90px;
    }
    .admin-nav { position: static; }
    .admin-nav nav { flex-direction: row; flex-wrap: wrap; }
}
</style>
