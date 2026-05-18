<script lang="ts">
    import Hero from '$lib/components/hero.svelte';
    import Card from '$lib/components/card.svelte';
    import { onMount } from 'svelte';
    import type { PageData } from '../$types';
    import { enhance } from '$app/forms';
    let { data } : { data: PageData } = $props();

    let canvas: HTMLCanvasElement;
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

    onMount(() => {
        let ctx = canvas.getContext("2d");
        if (!ctx) return;
        function drawDots(){
            const parent = canvas.parentElement;
            if(!parent) return;
            const rect = parent.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, rect.width, rect.height);
            const spacing = 28;
            const radius = 2;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            for(let y = spacing / 2; y < rect.height; y += spacing){
                for (let x = spacing; x < rect.width; x+= spacing){
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2 );
                    ctx.fill();
                }
            }
        }
        drawDots();
        window.addEventListener('resize', drawDots);
        return () => { window.removeEventListener('resize', drawDots) };
    });
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
    </aside>
    <canvas bind:this={canvas} class="bg-canvas"></canvas>
    <div class="contain-cards">
        {#if filteredArticles.length === 0}
            <p>Aucun article n'as été trouvé...</p>
        {:else}
            {#each filteredArticles as article (article.id)}
            <Card
                itemId={article.id}
                img="/images/{article.slug}.webp"
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
.page-content{
    position:relative;
	width: 100%;
	background-color: var(--tertiary);
	margin-top: -25px;
	border-radius: var(--bigger-radius) var(--bigger-radius) 0 0;
	display: flex;
	flex-direction: row;
    justify-content: center;
	padding:4rem 3rem;
	gap:2rem;
}
.page-content > div{
    max-width: 1400px;
}
.contain-cards{
    display: flex;
    flex-wrap: wrap;
    gap:2rem;
}
aside {
    z-index: 5;
    border-radius: 14px;
    border: 4px dashed var(--secondary);
    overflow: hidden;
    background-color: var(--primary);
    min-width: 250px;
    padding:1rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.search{
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
}
.cart{
    display: flex;
    flex-direction: column;
    gap:1rem;
}
.cart-item{
    display: flex;
    flex-direction: column;
    gap:0.2rem;
    padding:0.5rem;
    border: solid 2px var(--secondary);
    border-radius: var(--smaller-radius);
    width: 100%;
}
.common-button{
    display: flex;
    width: 100%;
    font-size: 25px;
    padding: 0;
    line-height: 1;
    align-items: center;
    justify-content: center;
}
form{width: 100%;}
@media (max-width:800px), (hover: none), (pointer: coarse){
	.page-content{padding: 2rem 1rem;}
}
/* Canvas */
.bg-canvas{
    position:absolute;
    width: 100%;
    height: 100%;
    top:0;
    left:-10px;
    z-index: 0;
    pointer-events: none;
}
.page-content > *:not(.bg-canvas){
    position: relative;
    z-index: 1;
}
</style>