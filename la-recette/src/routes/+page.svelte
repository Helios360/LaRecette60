<script lang="ts">
    import Hero from '$lib/components/hero.svelte';
    import { onMount } from 'svelte';
    let data = $props();
    let canvas: HTMLCanvasElement;
    onMount(() => {
        let ctx = canvas.getContext("2d");
        function drawDots(){
            const parent = canvas.parentElement;
            if(!parent) return;
            if(!ctx) return;
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
    title="La Recette Pâtisserie" 
    subtitle="Bienvenue dans un monde de douceur et de gourmandises" 
    cta="Commander" 
    link="articles" 
    img="/images/cakesHero.webp"
    background="/images/Boutique.png"
    />
<div class="page-content">
    <canvas bind:this={canvas} class="bg-canvas"></canvas>
    <div class="about">
        <h2>A propos .</h2>
        <span>
        <p>À La Recette, chaque pâtisserie est faite avec passion et souci du détail.</p>
        <p>J’accorde une attention particulière aux décors faits main, la partie la plus créative et joyeuse de mon travail.</p>
        <p>Je choisis des ingrédients de qualité, adaptables à vos envies, pour vous garantir des saveurs qui vous ressemblent.</p>
        <p>Toujours à l’écoute, je prends le temps de comprendre vos demandes afin de créer des douceurs uniques, pour vos occasions spéciales ou simplement pour le plaisir.</p>
        </span>
    </div>
    <div class="menu-gallery">
        <a href="gateaux-a-themes" class="div1" alt="Gâteaux à thèmes">
            <img src="../images/rabbit.webp" 
                alt="Gâteaux à thèmes" 
                height="200px" 
                width="auto" 
                loading="lazy" 
                decoding="async">
        </a>
        <a href="entremets" class="div2" alt="Les entremets">
            <img src="../images/fraisier.webp" 
                alt="Les entremets" 
                height="200px" 
                width="auto" 
                loading="lazy" 
                decoding="async">
        </a>
        <a href="mignardises" class="div3" alt="Les mignardises">
            <img src="../images/mignardises.webp" 
                alt="Les mignardises" 
                height="200px" 
                width="auto" 
                loading="lazy" 
                decoding="async">
        </a>
        <a href="classiques" class="div4" alt="Les classiques">
            <img src="../images/classique.webp" 
                alt="Les classiques" 
                height="200px" 
                width="auto" 
                loading="lazy" 
                decoding="async">
        </a>
        <a href="number-cakes" class="div5" alt="Number cakes">
            <img src="../images/numberCakeE.webp" 
                alt="Number cakes" 
                height="200px" 
                width="auto" 
                loading="lazy" 
                decoding="async">
        </a>
        <a href="traiteur" class="div6" alt="Le traiteur">
            <img src="../images/traiteur.webp" 
                alt="Le traiteur" 
                height="200px" 
                width="auto" 
                loading="lazy" 
                decoding="async">
        </a>
    </div>
</div>
<style>
.page-content{
    position:relative;
	width: 100%;
	background-color: var(--tertiary);
	margin-top: -25px;
	border-radius: 30px 30px 0 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding:4rem 3rem;
	gap:1rem;
}
.page-content > div{
    max-width: 1400px;
}
.about{
    padding:5%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    gap:2rem;
    border-radius: 15px;
    color: var(--secondary);
    background-color: var(--primary);
}
.about p {
    margin: 0 0 1rem 0;
    line-height: 1.6;
}
.about h2 {
	font-family: 'Artistic', sans-serif;
	font-size: 2rem;
}
.about > * {
  	flex:1 1 100px;
  	min-width:200px;
}
.about > *:nth-child(2) {
	flex: 2 1 400px;
	min-width: 200px;
}

@media (max-width:800px), (hover: none), (pointer: coarse){
	.page-content{padding: 2rem 1rem;}
}
@media (max-width:800px){
    .menu-gallery{
        grid-template-columns: repeat(1, 1fr);
        padding-bottom:60px;
    }
    .menu-gallery > a{
        border-radius: 14px;
    }
    .menu-gallery > a > img{
        height: 500px;
    }
}
@media (hover: none), (pointer: coarse) {
    .menu-gallery > a::after {
        opacity: 1;
    }
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