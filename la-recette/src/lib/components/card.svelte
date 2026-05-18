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
            <button onclick={()=>window.location.href=data.seemore}>VOIR PLUS</button>
            <button onclick={()=>popup.showModal()}>AJOUTER</button>
        </span>
    </span>
</div>
<style>
.card{
    z-index: 5;
    border-radius: var(--smaller-radius);
    border: 4px dashed var(--secondary);
    overflow: hidden;
    background-color: var(--primary);
    width: 300px;
}
.card-img{
    width: 100%;
}

.infos{
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap:1rem;
}
button{
    width:100%;
}
</style>