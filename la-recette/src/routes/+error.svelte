<script lang="ts">
    import { page } from "$app/state";
    import Hero from "$lib/components/hero.svelte";
    let data = $props();
</script>
<svelte:head>
    <title>{page.status} - Error</title>
</svelte:head>
<Hero title={page.status} subtitle={page.error?.message}/>
