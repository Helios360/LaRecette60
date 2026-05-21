<script lang="ts">
    import Hero from '$lib/components/hero.svelte';
    import Card from '$lib/components/card.svelte';
    import type { PageData } from '../$types';
    import { enhance } from '$app/forms';
    let { data } : { data: PageData } = $props();

    let search = $state('');
    let selectedCategory = $state('');
    function normalize(value: string) { return value.toLowerCase().trim(); }

    let filteredArticles = $derived.by(() => {
        const q = normalize(search);
        return data.articles.filter((article) => {
            const title = normalize(article.title ?? '');
            const subtitle = normalize(article.subtitle ?? '');
            const slug = normalize(article.slug ?? '');

            const matchesSearch = !q || title.includes(q) || subtitle.includes(q) || slug.includes(q);
            const matchesCategory = !selectedCategory || article.category_id === Number(selectedCategory);
            return matchesSearch && matchesCategory;
        })
    })
</script>
<Hero 
    title="Commande" 
    subtitle="Feuilletez, Trouvez, commandez." 
    background="/images/boutique-irl.webp"
    />
    
<div class="page-content">
    <aside>
        <div class="search">
            <h3 for="search">Recherche :</h3>
            <input
                id="search"
                type="search"
                placeholder="Recherchez un article..."
                bind:value={search}
            />
            <select id="category-search" bind:value={selectedCategory}>
                <option value="">Toutes les catégories</option>
            {#each data.categories as category}
                <option value={category.id}>{category.name}</option>
            {/each}
            </select>
        </div>
        <div class="cart">
            <span><p>Panier :</p><hr></span>
            <div>
                {#if !data.cart?.items?.length}
                    <h3>Votre panier est vide</h3>
                {:else}
                    {#each data.cart.items as item}
                    {@const article = data.articles.find(a=>a.id === item.article_id)}
                    <span class="cart-item">
                        <p>{item.quantity} {article?.title}</p>
                        <p>{item.slices} parts</p>
                        <span class="buttons-holder">
                            <form method="POST" action="?/deleteFromCart" use:enhance>
                                <input type="hidden" name="articleId" value={item.article_id}/>
                                <input type="hidden" name="slices" value={item.slices}/>
                                <input type="hidden" name="quantity" value={item.quantity}/>
                                <button class="common-button" type="submit">-</button>
                            </form>
                            <form method="POST" action="?/addToCart" use:enhance>
                                <input type="hidden" name="articleId" value={item.article_id}/>
                                <input type="hidden" name="slices" value={item.slices}/>
                                <input type="hidden" name="quantity" value={item.quantity}/>
                                <button class="common-button" type="submit">+</button>
                            </form>
                        </span>
                    </span>
                    {/each}
                {/if}
            </div>
            <br><a class="order-link" href="/cart">Commander</a>
        </div>

    </aside>
    <div class="contain-cards">
        {#if filteredArticles.length === 0}
            <p>Aucun article n'as été trouvé...</p>
        {:else}
            {#each filteredArticles as article (article.id)}
            <Card
                itemId={article.id}
                img={article.cover_image_key ? `/uploads/${article.cover_image_key}` : `/images/${article.slug}.webp`}
                title={article.title}
                subtitle={article.subtitle}
                ration={article.slices.match(/\d+/g)?.map(Number) || []}
                seemore={article.slug}
            />
            {/each}
        {/if}
    </div>
</div>
<style>
.page-content {
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    gap: 2rem;
}
.contain-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
}
aside {
    z-index: 5;
    min-width: 250px;
    height: 700px;
    padding: 1rem;
    border-radius: 14px;
    overflow: hidden;
    background-color: var(--primary);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.search,
.cart > div {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.search { gap: 0.7rem; }
.cart-item {
    width: 100%;
    padding: 0.5rem;
    border: solid 2px var(--secondary);
    border-radius: var(--smaller-radius);
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}
.common-button {
    width: 100%;
    padding: 0;
    font-size: 25px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}
form { width: 100%; }
.order-link {
    display: block;
    text-align: center;
    font-weight: 600;
    padding: 0.6rem 1rem;
    border: 2px solid var(--secondary);
    background-color: var(--secondary);
    color: var(--primary);
    border-radius: var(--smaller-radius);
    transition: all 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
}
.order-link:hover { background-color: var(--primary); color: var(--secondary); }
@media (max-width:614px){
    .page-content{
        flex-direction: column;
    }
    aside{
        width: 100%;
        height: 500px;
    }
    .cart > div {
        height:200px;
        overflow: scroll;
    }
}
</style>