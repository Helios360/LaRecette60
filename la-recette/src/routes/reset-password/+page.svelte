<script lang="ts">
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { authClient } from '$lib/auth-client';
    import { validatePassword, validatePasswordConfirm } from '$lib/validation';

    let password = $state('');
    let confirm = $state('');
    let err = $state('');
    let msg = $state('');
    let busy = $state(false);
    let done = $state(false);

    const token = $derived(page.url.searchParams.get('token') ?? '');

    async function doReset(e: Event) {
        e.preventDefault();
        err = '';

        const pwdErr = validatePassword(password, { isNew: true });
        if (pwdErr) { err = pwdErr; return; }
        const confirmErr = validatePasswordConfirm(password, confirm);
        if (confirmErr) { err = confirmErr; return; }

        if (!token) { err = 'Lien de réinitialisation invalide ou expiré.'; return; }

        busy = true;
        const { error } = await authClient.resetPassword({ newPassword: password, token });
        busy = false;
        if (error) { err = error.message ?? 'Impossible de réinitialiser le mot de passe.'; return; }
        done = true;
    }
</script>

<svelte:head>
    <title>Réinitialiser mon mot de passe | La Recette</title>
</svelte:head>

<div class="page-content">
    <section class="card" style="max-width:500px;margin:3rem auto;padding:2rem">
        {#if !token}
            <h2 class="section-title">Lien invalide .</h2>
            <p>Ce lien de réinitialisation est invalide ou a expiré. Veuillez refaire une demande.</p>
            <a class="cta" href="/forgot-password">Nouvelle demande</a>
        {:else if done}
            <h2 class="section-title">Mot de passe réinitialisé .</h2>
            <p>Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.</p>
            <a class="cta" href="/account">Se connecter</a>
        {:else}
            <h2 class="section-title">Nouveau mot de passe .</h2>
            {#if err}<p class="alert error">{err}</p>{/if}
            <form onsubmit={doReset} class="form" novalidate>
                <label>
                    Nouveau mot de passe
                    <input type="password" bind:value={password} required autocomplete="new-password">
                </label>
                <label>
                    Confirmation
                    <input type="password" bind:value={confirm} required autocomplete="new-password">
                </label>
                <button type="submit" disabled={busy}>{busy ? 'Envoi…' : 'Réinitialiser'}</button>
            </form>
        {/if}
    </section>
</div>