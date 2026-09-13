<script lang="ts">
    let email = $state('');
    let err = $state('');
    let busy = $state(false);
    let done = $state(false);

    async function doSubmit(e: Event) {
        e.preventDefault();
        err = '';
        if (!email.trim()) { err = 'Veuillez saisir votre email.'; return; }
        busy = true;
        try {
            const res = await fetch('/api/auth/request-password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json();
            busy = false;
            if (!res.ok) { err = data?.message ?? data?.error ?? 'Erreur lors de l\'envoi.'; return; }
            done = true;
        } catch {
            busy = false;
            err = 'Erreur réseau. Réessayez.';
        }
    }
</script>

<svelte:head>
    <title>Mot de passe oublié | La Recette</title>
</svelte:head>

<div class="page-content">
    <section class="account-card card">
        {#if done}
            <h2 class="section-title">Email envoyé</h2>
            <p>Si un compte existe avec cette adresse, vous recevrez un email pour réinitialiser votre mot de passe dans quelques minutes.</p>
            <a class="cta" href="/account">Retour à la connexion</a>
        {:else}
            <h2 class="section-title">Mot de passe oublié</h2>
            <p>Saisissez l'email associé à votre compte pour recevoir un lien de réinitialisation.</p>
            {#if err}<p class="alert error">{err}</p>{/if}
            <form onsubmit={doSubmit} class="forgot-form" novalidate>
                <label>
                    Email
                    <input type="email" bind:value={email} required autocomplete="email">
                </label>
                <button type="submit" disabled={busy}>{busy ? 'Envoi…' : 'Envoyer'}</button>
            </form>
            <a class="link" href="/account">← Retour à la connexion</a>
        {/if}
    </section>
</div>

<style>
    .account-card {
        width: 100%;
        max-width: 500px;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .forgot-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .forgot-form label {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        font-family: "Visibility", serif;
        font-size: 0.95rem;
    }
    .forgot-form button[type="submit"] {
        width: 100%;
    }
    .alert {
        width: 100%;
        padding: 0.75rem 1rem;
        border-radius: var(--smaller-radius);
        font-family: "Visibility", serif;
    }
    .alert.error { background-color: #f6d6d6; color: #6b1f1f; }
    .link { text-decoration: underline; }
</style>