<script lang="ts">
    let { title, subtitle, cta, link, img, background = "/images/Boutique.png" } = $props();
</script>

<div class="hero" style="--hero-bg: url('{background}')">
    <div id="infos">
        <h1>{title}</h1>
        <h2>{subtitle}</h2><br><br><br><br><br>
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
.hero{
	background-image: 
	linear-gradient(
		rgba(97, 44, 18, 0.8),
		rgba(102, 60, 60, 0.4)), 
	var(--hero-bg);
	background-size: cover;
	background-position: 50%;
	background-repeat: no-repeat;
	min-height: 90svh;
	height: 90vh;
	padding: 0rem 2rem;
	width: 100%;
	color: var(--primary);
	display: flex;
	justify-content: space-around;
	align-items: center;
	background-attachment: fixed;
}
.hero > div {
	width:50vw;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	height: 50%;
}
.hero > span > img{
	top:40%;
	left:40%;
	position: absolute;
	z-index: 2;
	width:60%;
	height: auto;
	border-radius: 40px;
	object-fit: contain;
}
.cta{
	font-family: "Visibility", serif;
	font-size: 1.5rem;
	border: 2px var(--primary) solid;
	padding:20px;
	margin:20px 0;
	border-radius: 12px;
	width: 50%;
	text-align: center;
	transition: all 0.5s ease-in-out;
}
.cta:hover{
	background-color: var(--primary);
	color: var(--secondary);
}


@media (max-width:640px) {
    .hero{
        background-position: 50% 50%;
    }
}
@media (max-width:1700px){
	.hero > span > img{
		top:40%;
	}
}
@media (max-width:800px), (hover: none), (pointer: coarse){
	.hero{
		text-align: center;
		background-attachment: scroll;
	}
	.hero > div{width: 100%;}
	.hero > span > img{
		top:65%;
		left:10%;
		width:80%;
	}
	.cta{width: 100%;}
}
@media (max-width:400px) {
	.hero > span > img{ top:70%; }
}
</style>