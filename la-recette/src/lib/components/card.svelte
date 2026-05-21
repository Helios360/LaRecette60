<script lang="ts">
    import { enhance } from "$app/forms";
    let data = $props()
    let popup: HTMLDialogElement;
</script>
<div class="card">
    <dialog bind:this={popup}>
        <h3>Combien de parts ?</h3>
        {#each data.ration as nb}
        <form 
            method="POST" 
            action="?/addToCart" 
            use:enhance={() => {
                return async ({result, update}) => {
                    if(result.type === 'success'){
                        popup.close();
                        await update();
                    }
                };
            }}>
            <input type="hidden" name="articleId" value={data.itemId}/>
            <input type="hidden" name="slices" value={nb}/>
            <button type="submit">{nb}</button>
        </form>
        {/each}
        <button onclick={()=>popup.close()}>Retour</button>
    </dialog>
    <img src="{data.img}" alt="{data.title}" class="card-img">
    <span class="infos">
        <h3>{data.title}</h3>
        <h4>{data.subtitle}</h4>
        <p>Taille : {data.ration}</p>
        <span class="buttons-holder">
            <a class="cta seemore" href="/articles/{data.seemore}">VOIR PLUS</a>
            <button onclick={()=>popup.showModal()}>AJOUTER</button>
        </span>
    </span>
</div>
<style>
.card {
    z-index: 5;
    width: 300px;
    border-radius: var(--smaller-radius);
    overflow: hidden;
    background-color: var(--primary);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.card-img {
    height: 200px;
    object-fit: cover;
}
.infos {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height:100%;
    justify-content: space-between;
}
button { width: 100%; }
.seemore {
    font-size: 13px;
    font-weight: 600;
    padding: 0.5rem 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--primary)
}
.seemore:hover {color:var(--secondary)}
@media (max-width:614px){
    .card {
        width: 100%;
    }
}
</style>