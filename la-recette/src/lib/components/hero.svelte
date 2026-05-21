<script lang="ts">
    let {
        title,
        subtitle,
        cta = '',
        link = '',
        img = '',
        background = "/images/Boutique.png"
    }: {
        title: string;
        subtitle: string;
        cta?: string;
        link?: string;
        img?: string;
        background?: string;
    } = $props();
</script>

<div class="hero" class:has-img={!!img} style="--hero-bg: url('{background}')">
    <div id="infos">
        <h1>{title}</h1>
        <h2>{subtitle}</h2>
		{#if cta}
			<a class="cta" href="/{link}">{cta}</a>
		{/if}
    </div>
    <span>
		{#if img}
        	<img src="{img}" alt="Hero" width="200px" height="200px">
		{/if}
    </span>
</div>

<style>
h1, h2 { color: var(--primary); }
.hero {
	background-image:
		linear-gradient(rgba(97, 44, 18, 0.8), rgba(102, 60, 60, 0.4)),
		var(--hero-bg);
	background-size: cover;
	background-position: 50%;
	background-repeat: no-repeat;
	background-attachment: fixed;
	min-height: 90svh;
	height: 90vh;
	padding: 0 2rem;
	width: 100%;
	color: var(--primary);
	display: flex;
	justify-content: space-around;
	align-items: center;
}
.hero > div {
	width: 50vw;
	height: 50%;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	gap: 1.5rem;
}
.hero > span > img {
	position: absolute;
	top: 40%;
	left: 40%;
	z-index: 2;
	width: 60%;
	height: auto;
	border-radius: 40px;
	object-fit: contain;
}
.hero :global(.cta) {
	border-color: var(--primary);
	background-color: transparent;
	color: var(--primary);
	font-size: 1.5rem;
	padding: 20px;
	margin: 20px 0;
	width: 50%;
}
.hero :global(.cta:hover) {
	background-color: var(--primary);
	color: var(--secondary);
}

@media (max-width: 800px), (hover: none), (pointer: coarse) {
	.hero {
		text-align: center;
	}
	.hero > div {
		width: 100%;
		justify-content: center;
	}
	.hero.has-img > div { height: 50%; justify-content: space-around; }
	.hero > span > img {
		top: 65%;
		left: 10%;
		width: 80%;
	}
	.hero :global(.cta) { width: 100%; }
}
@media (max-width: 400px) {
	.hero > span > img { top: 70%; }
}
</style>