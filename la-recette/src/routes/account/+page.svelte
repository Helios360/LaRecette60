<script lang="ts">
    import Hero from '$lib/components/hero.svelte';
    import { enhance } from '$app/forms';
    import { invalidateAll, goto } from '$app/navigation';
    import { untrack } from 'svelte';
    import { authClient } from '$lib/auth-client';
    import {
        validateEmail,
        validatePassword,
        validatePasswordConfirm,
        validateName,
        validatePhone,
        validateAddress,
        validateCity,
        hasErrors,
        type FieldError
    } from '$lib/validation';
    import type { PageData, ActionData } from './$types';

    let { data, form } : { data: PageData, form: ActionData } = $props();

    let mode = $state<'signin' | 'signup'>('signin');
    let err = $state('');
    let msg = $state('');
    let busy = $state(false);

    let signin = $state({ email: '', password: '' });
    let signinErrors = $state<Record<keyof typeof signin, FieldError>>({ email: null, password: null });

    let signup = $state({
        email: '', password: '', name: '',
        phone: '', fname: '', address: '', city: ''
    });
    let signupErrors = $state<Record<keyof typeof signup, FieldError>>({
        email: null, password: null, name: null,
        phone: null, fname: null, address: null, city: null
    });

    function profileFromUser(u: any) {
        return {
            name: u?.name ?? '',
            fname: u?.fname ?? '',
            phone: u?.phone ?? '',
            address: u?.address ?? '',
            city: u?.city ?? ''
        };
    }
    let profile = $state(untrack(() => profileFromUser(data.user)));
    let profileErrors = $state<Record<keyof typeof profile, FieldError>>({
        name: null, fname: null, phone: null, address: null, city: null
    });
    let lastUserId = $state(untrack(() => data.user?.id ?? null));
    $effect(() => {
        if (data.user?.id !== lastUserId) {
            profile = profileFromUser(data.user);
            profileErrors = { name: null, fname: null, phone: null, address: null, city: null };
            lastUserId = data.user?.id ?? null;
        }
    });
    let pwd = $state({ current: '', next: '', confirm: '' });
    let pwdErrors = $state<Record<keyof typeof pwd, FieldError>>({ current: null, next: null, confirm: null });
    let confirmDelete = $state(false);
    let deletePwd = $state('');
    let deletePwdError = $state<FieldError>(null);

    function validateSignin(): boolean {
        signinErrors.email = validateEmail(signin.email);
        signinErrors.password = signin.password ? null : 'Mot de passe requis';
        return !hasErrors(signinErrors);
    }

    function validateSignup(): boolean {
        signupErrors.email = validateEmail(signup.email);
        signupErrors.password = validatePassword(signup.password, { isNew: true });
        signupErrors.name = validateName(signup.name, { required: true });
        signupErrors.fname = validateName(signup.fname, { required: false });
        signupErrors.phone = validatePhone(signup.phone, { required: true });
        signupErrors.address = validateAddress(signup.address, { required: false });
        signupErrors.city = validateCity(signup.city, { required: false });
        return !hasErrors(signupErrors);
    }

    function validateProfile(): boolean {
        profileErrors.name = validateName(profile.name, { required: false });
        profileErrors.fname = validateName(profile.fname, { required: false });
        profileErrors.phone = validatePhone(profile.phone, { required: false });
        profileErrors.address = validateAddress(profile.address, { required: false });
        profileErrors.city = validateCity(profile.city, { required: false });
        return !hasErrors(profileErrors);
    }

    function validatePwd(): boolean {
        pwdErrors.current = pwd.current ? null : 'Mot de passe actuel requis';
        pwdErrors.next = validatePassword(pwd.next, { isNew: true });
        pwdErrors.confirm = validatePasswordConfirm(pwd.next, pwd.confirm);
        if (!pwdErrors.next && !pwdErrors.current && pwd.next === pwd.current) {
            pwdErrors.next = 'Le nouveau mot de passe doit être différent';
        }
        return !hasErrors(pwdErrors);
    }

    function validateDeletePwd(): boolean {
        deletePwdError = deletePwd ? null : 'Mot de passe requis pour confirmer';
        return !deletePwdError;
    }

    async function doSignIn(e: Event) {
        e.preventDefault();
        err = ''; msg = '';
        if (!validateSignin()) { err = 'Corrigez les champs en erreur'; return; }
        busy = true;
        const { error } = await authClient.signIn.email({ email: signin.email.trim(), password: signin.password });
        busy = false;
        if (error) { err = error.message ?? 'Connexion impossible'; return; }
        await invalidateAll();
        msg = 'Connecté';
    }

    async function doSignUp(e: Event) {
        e.preventDefault();
        err = ''; msg = '';
        if (!validateSignup()) { err = 'Corrigez les champs en erreur'; return; }
        busy = true;
        const { error } = await authClient.signUp.email({
            email: signup.email.trim(),
            password: signup.password,
            name: signup.name.trim(),
            phone: signup.phone.trim(),
            fname: signup.fname.trim(),
            address: signup.address.trim(),
            city: signup.city.trim()
        } as any);
        busy = false;
        if (error) { err = error.message ?? 'Inscription impossible'; return; }
        await invalidateAll();
        msg = 'Compte créé';
    }

    async function doSignOut() {
        err = ''; msg = ''; busy = true;
        await authClient.signOut();
        busy = false;
        await invalidateAll();
        await goto('/account');
    }

    async function doUpdate(e: Event) {
        e.preventDefault();
        err = ''; msg = '';
        if (!validateProfile()) { err = 'Corrigez les champs en erreur'; return; }
        busy = true;
        const { error } = await authClient.updateUser({
            name: profile.name.trim(),
            fname: profile.fname.trim(),
            phone: profile.phone.trim(),
            address: profile.address.trim(),
            city: profile.city.trim()
        } as any);
        busy = false;
        if (error) { err = error.message ?? 'Mise à jour impossible'; return; }
        await invalidateAll();
        msg = 'Profil mis à jour';
    }

    async function doChangePwd(e: Event) {
        e.preventDefault();
        err = ''; msg = '';
        if (!validatePwd()) { err = 'Corrigez les champs en erreur'; return; }
        busy = true;
        const { error } = await authClient.changePassword({
            currentPassword: pwd.current,
            newPassword: pwd.next,
            revokeOtherSessions: true
        });
        busy = false;
        if (error) { err = error.message ?? 'Changement impossible'; return; }
        pwd = { current: '', next: '', confirm: '' };
        pwdErrors = { current: null, next: null, confirm: null };
        msg = 'Mot de passe changé';
    }

    async function doDelete() {
        err = ''; msg = '';
        if (!validateDeletePwd()) return;
        busy = true;
        const { error } = await authClient.deleteUser({ password: deletePwd });
        busy = false;
        if (error) { err = error.message ?? 'Suppression impossible'; return; }
        await invalidateAll();
        confirmDelete = false; deletePwd = ''; deletePwdError = null;
        await goto('/');
    }

    function downloadExport() {
        if (!form?.export) return;
        const blob = new Blob([JSON.stringify(form.export, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `la-recette-export-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function fmtDate(d: any) {
        if (!d) return '';
        try { return new Date(d).toLocaleString('fr-FR'); } catch { return String(d); }
    }
    function fmtPrice(n: any) {
        const v = Number(n ?? 0);
        return v.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
    }

    $effect(() => {
        if (form?.export) downloadExport();
    });
</script>

<Hero
    title="Mon Compte"
    subtitle={data.user ? `Bonjour ${data.user.name ?? ''}` : 'Connectez-vous ou créez un compte'}
    background="/images/boutique-irl.webp"
/>

<div class="page-content">
    {#if err}<p class="alert error">{err}</p>{/if}
    {#if msg}<p class="alert ok">{msg}</p>{/if}
    {#if form?.message}<p class="alert ok">{form.message}</p>{/if}
    {#if form?.error}<p class="alert error">{form.error}</p>{/if}

    {#if !data.user}
        <section class="account-card card">
            <div class="tabs">
                <button class:active={mode === 'signin'} onclick={() => (mode = 'signin')}>Connexion</button>
                <button class:active={mode === 'signup'} onclick={() => (mode = 'signup')}>Inscription</button>
            </div>

            {#if mode === 'signin'}
                <form onsubmit={doSignIn} class="form" novalidate>
                    <label>
                        Email
                        <input type="email" bind:value={signin.email} autocomplete="email"
                            class:invalid={signinErrors.email}
                            aria-invalid={signinErrors.email ? 'true' : undefined}
                            onblur={() => signinErrors.email = validateEmail(signin.email)}
                            oninput={() => { if (signinErrors.email) signinErrors.email = validateEmail(signin.email); }}/>
                        {#if signinErrors.email}<span class="field-error">{signinErrors.email}</span>{/if}
                    </label>
                    <label>
                        Mot de passe
                        <input type="password" bind:value={signin.password} autocomplete="current-password"
                            class:invalid={signinErrors.password}
                            aria-invalid={signinErrors.password ? 'true' : undefined}
                            onblur={() => signinErrors.password = signin.password ? null : 'Mot de passe requis'}
                            oninput={() => { if (signinErrors.password) signinErrors.password = signin.password ? null : 'Mot de passe requis'; }}/>
                        {#if signinErrors.password}<span class="field-error">{signinErrors.password}</span>{/if}
                    </label>
                    <button type="submit" disabled={busy}>Se connecter</button>
                </form>
            {:else}
                <form onsubmit={doSignUp} class="form" novalidate>
                    <label>
                        Email*
                        <input type="email" bind:value={signup.email} autocomplete="email"
                            class:invalid={signupErrors.email}
                            aria-invalid={signupErrors.email ? 'true' : undefined}
                            onblur={() => signupErrors.email = validateEmail(signup.email)}
                            oninput={() => { if (signupErrors.email) signupErrors.email = validateEmail(signup.email); }}/>
                        {#if signupErrors.email}<span class="field-error">{signupErrors.email}</span>{/if}
                    </label>
                    <label>
                        Mot de passe*
                        <input type="password" bind:value={signup.password} autocomplete="new-password"
                            class:invalid={signupErrors.password}
                            aria-invalid={signupErrors.password ? 'true' : undefined}
                            onblur={() => signupErrors.password = validatePassword(signup.password, { isNew: true })}
                            oninput={() => { if (signupErrors.password) signupErrors.password = validatePassword(signup.password, { isNew: true }); }}/>
                        {#if signupErrors.password}<span class="field-error">{signupErrors.password}</span>
                        {:else}<span class="field-hint">8+ caractères, une lettre et un chiffre</span>{/if}
                    </label>
                    <label>
                        Nom*
                        <input type="text" bind:value={signup.name} autocomplete="family-name"
                            class:invalid={signupErrors.name}
                            aria-invalid={signupErrors.name ? 'true' : undefined}
                            onblur={() => signupErrors.name = validateName(signup.name, { required: true })}
                            oninput={() => { if (signupErrors.name) signupErrors.name = validateName(signup.name, { required: true }); }}/>
                        {#if signupErrors.name}<span class="field-error">{signupErrors.name}</span>{/if}
                    </label>
                    <label>
                        Prénom
                        <input type="text" bind:value={signup.fname} autocomplete="given-name"
                            class:invalid={signupErrors.fname}
                            aria-invalid={signupErrors.fname ? 'true' : undefined}
                            onblur={() => signupErrors.fname = validateName(signup.fname, { required: false })}
                            oninput={() => { if (signupErrors.fname) signupErrors.fname = validateName(signup.fname, { required: false }); }}/>
                        {#if signupErrors.fname}<span class="field-error">{signupErrors.fname}</span>{/if}
                    </label>
                    <label>
                        Téléphone*
                        <input type="tel" bind:value={signup.phone} autocomplete="tel"
                            class:invalid={signupErrors.phone}
                            aria-invalid={signupErrors.phone ? 'true' : undefined}
                            onblur={() => signupErrors.phone = validatePhone(signup.phone, { required: true })}
                            oninput={() => { if (signupErrors.phone) signupErrors.phone = validatePhone(signup.phone, { required: true }); }}/>
                        {#if signupErrors.phone}<span class="field-error">{signupErrors.phone}</span>{/if}
                    </label>
                    <label>
                        Adresse
                        <input type="text" bind:value={signup.address} autocomplete="street-address"
                            class:invalid={signupErrors.address}
                            aria-invalid={signupErrors.address ? 'true' : undefined}
                            onblur={() => signupErrors.address = validateAddress(signup.address)}
                            oninput={() => { if (signupErrors.address) signupErrors.address = validateAddress(signup.address); }}/>
                        {#if signupErrors.address}<span class="field-error">{signupErrors.address}</span>{/if}
                    </label>
                    <label>
                        Ville
                        <input type="text" bind:value={signup.city} autocomplete="address-level2"
                            class:invalid={signupErrors.city}
                            aria-invalid={signupErrors.city ? 'true' : undefined}
                            onblur={() => signupErrors.city = validateCity(signup.city)}
                            oninput={() => { if (signupErrors.city) signupErrors.city = validateCity(signup.city); }}/>
                        {#if signupErrors.city}<span class="field-error">{signupErrors.city}</span>{/if}
                    </label>
                    <button type="submit" disabled={busy}>Créer mon compte</button>
                </form>
            {/if}
        </section>
    {:else}
        <section class="account-card card">
            <div class="next-to-one-another"><h2>Mes informations</h2><button class="ghost" onclick={doSignOut} disabled={busy}>Se déconnecter</button></div>
            <p class="meta">Email : <strong>{data.user.email}</strong></p>
            <p class="meta">Membre depuis : {fmtDate(data.user.createdAt)}</p>

            <form onsubmit={doUpdate} class="form" novalidate>
                <label>
                    Nom
                    <input type="text" bind:value={profile.name} autocomplete="family-name"
                        class:invalid={profileErrors.name}
                        aria-invalid={profileErrors.name ? 'true' : undefined}
                        onblur={() => profileErrors.name = validateName(profile.name, { required: false })}
                        oninput={() => { if (profileErrors.name) profileErrors.name = validateName(profile.name, { required: false }); }}/>
                    {#if profileErrors.name}<span class="field-error">{profileErrors.name}</span>{/if}
                </label>
                <label>
                    Prénom
                    <input type="text" bind:value={profile.fname} autocomplete="given-name"
                        class:invalid={profileErrors.fname}
                        aria-invalid={profileErrors.fname ? 'true' : undefined}
                        onblur={() => profileErrors.fname = validateName(profile.fname, { required: false })}
                        oninput={() => { if (profileErrors.fname) profileErrors.fname = validateName(profile.fname, { required: false }); }}/>
                    {#if profileErrors.fname}<span class="field-error">{profileErrors.fname}</span>{/if}
                </label>
                <label>
                    Téléphone
                    <input type="tel" bind:value={profile.phone} autocomplete="tel"
                        class:invalid={profileErrors.phone}
                        aria-invalid={profileErrors.phone ? 'true' : undefined}
                        onblur={() => profileErrors.phone = validatePhone(profile.phone, { required: false })}
                        oninput={() => { if (profileErrors.phone) profileErrors.phone = validatePhone(profile.phone, { required: false }); }}/>
                    {#if profileErrors.phone}<span class="field-error">{profileErrors.phone}</span>{/if}
                </label>
                <label>
                    Adresse
                    <input type="text" bind:value={profile.address} autocomplete="street-address"
                        class:invalid={profileErrors.address}
                        aria-invalid={profileErrors.address ? 'true' : undefined}
                        onblur={() => profileErrors.address = validateAddress(profile.address)}
                        oninput={() => { if (profileErrors.address) profileErrors.address = validateAddress(profile.address); }}/>
                    {#if profileErrors.address}<span class="field-error">{profileErrors.address}</span>{/if}
                </label>
                <label>
                    Ville
                    <input type="text" bind:value={profile.city} autocomplete="address-level2"
                        class:invalid={profileErrors.city}
                        aria-invalid={profileErrors.city ? 'true' : undefined}
                        onblur={() => profileErrors.city = validateCity(profile.city)}
                        oninput={() => { if (profileErrors.city) profileErrors.city = validateCity(profile.city); }}/>
                    {#if profileErrors.city}<span class="field-error">{profileErrors.city}</span>{/if}
                </label>
                <button type="submit" disabled={busy}>Mettre à jour</button>
            </form>
        </section>

        <section class="account-card card">
            <h2>Changer mon mot de passe</h2>
            <form onsubmit={doChangePwd} class="form" novalidate>
                <label>
                    Mot de passe actuel
                    <input type="password" bind:value={pwd.current} autocomplete="current-password"
                        class:invalid={pwdErrors.current}
                        aria-invalid={pwdErrors.current ? 'true' : undefined}
                        onblur={() => pwdErrors.current = pwd.current ? null : 'Mot de passe actuel requis'}
                        oninput={() => { if (pwdErrors.current) pwdErrors.current = pwd.current ? null : 'Mot de passe actuel requis'; }}/>
                    {#if pwdErrors.current}<span class="field-error">{pwdErrors.current}</span>{/if}
                </label>
                <label>
                    Nouveau mot de passe
                    <input type="password" bind:value={pwd.next} autocomplete="new-password"
                        class:invalid={pwdErrors.next}
                        aria-invalid={pwdErrors.next ? 'true' : undefined}
                        onblur={() => pwdErrors.next = validatePassword(pwd.next, { isNew: true })}
                        oninput={() => {
                            if (pwdErrors.next) pwdErrors.next = validatePassword(pwd.next, { isNew: true });
                            if (pwdErrors.confirm) pwdErrors.confirm = validatePasswordConfirm(pwd.next, pwd.confirm);
                        }}/>
                    {#if pwdErrors.next}<span class="field-error">{pwdErrors.next}</span>
                    {:else}<span class="field-hint">8+ caractères, une lettre et un chiffre</span>{/if}
                </label>
                <label>
                    Confirmation
                    <input type="password" bind:value={pwd.confirm} autocomplete="new-password"
                        class:invalid={pwdErrors.confirm}
                        aria-invalid={pwdErrors.confirm ? 'true' : undefined}
                        onblur={() => pwdErrors.confirm = validatePasswordConfirm(pwd.next, pwd.confirm)}
                        oninput={() => { if (pwdErrors.confirm) pwdErrors.confirm = validatePasswordConfirm(pwd.next, pwd.confirm); }}/>
                    {#if pwdErrors.confirm}<span class="field-error">{pwdErrors.confirm}</span>{/if}
                </label>
                <button type="submit" disabled={busy}>Changer</button>
            </form>
        </section>

        <section class="account-card card">
            <h2>Mes données (RGPD)</h2>
            <p>Exportez l'ensemble de vos données personnelles (article 20 du RGPD) ou supprimez définitivement votre compte (article 17).</p>
            <div class="actions">
                <form method="POST" action="?/exportData" use:enhance>
                    <button type="submit">Télécharger mes données</button>
                </form>
                {#if !confirmDelete}
                    <button class="danger" onclick={() => (confirmDelete = true)}>Supprimer mon compte</button>
                {:else}
                    <div class="confirm">
                        <p><strong>Cette action est définitive.</strong> Saisissez votre mot de passe pour confirmer.</p>
                        <input type="password" bind:value={deletePwd} placeholder="Mot de passe" autocomplete="current-password"
                            class:invalid={deletePwdError}
                            aria-invalid={deletePwdError ? 'true' : undefined}
                            onblur={() => deletePwdError = deletePwd ? null : 'Mot de passe requis pour confirmer'}
                            oninput={() => { if (deletePwdError) deletePwdError = deletePwd ? null : 'Mot de passe requis pour confirmer'; }}/>
                        {#if deletePwdError}<span class="field-error">{deletePwdError}</span>{/if}
                        <div class="buttons-holder">
                            <button class="ghost" onclick={() => { confirmDelete = false; deletePwd = ''; deletePwdError = null; }}>Annuler</button>
                            <button class="danger" onclick={doDelete} disabled={busy || !deletePwd}>Confirmer la suppression</button>
                        </div>
                    </div>
                {/if}
            </div>
        </section>
    {/if}

    <section class="account-card card">
        <h2 class="headers">Mon panier</h2>
        {#if !data.currentCart?.items?.length}
            <p>Votre panier est vide. <a class="link" href="/articles">Voir les articles</a></p>
        {:else}
            <ul class="cart-list">
                {#each data.currentCart.items as item}
                    <li>
                        <span>{item.quantity}× {item.title ?? `Article #${item.article_id}`} <em>({item.slices} parts)</em></span>
                        <span>{fmtPrice(item.unit_price)}</span>
                    </li>
                {/each}
            </ul>
            <p class="total">Total : <strong>{fmtPrice(data.currentCart.items.reduce((s: number, i: any) => s + Number(i.unit_price), 0))}</strong></p>
            <div class="actions">
                <a class="link-button" href="/articles">Modifier</a>
                <form method="POST" action="?/clearCurrentCart" use:enhance>
                    <button type="submit" class="ghost">Vider</button>
                </form>
                <form method="POST" action="?/cancelCurrentCart" use:enhance>
                    <button type="submit" class="danger">Annuler le panier</button>
                </form>
            </div>
        {/if}
        {#if !data.user}
            <p class="hint">Astuce : votre panier est conservé sur cet appareil. Connectez-vous pour le retrouver partout.</p>
        {/if}
    </section>

    {#if data.user && data.history.length}
        <section class="account-card card">
            <h2>Historique des paniers</h2>
            <ul class="history">
                {#each data.history as cart}
                    <li>
                        <header>
                            <span>{fmtDate(cart.created_at)}</span>
                            <span class="status {cart.status}">{cart.status}</span>
                            <span>{fmtPrice(cart.total)}</span>
                        </header>
                        {#if cart.items?.length}
                            <ul>
                                {#each cart.items as i}
                                    <li>{i.quantity}× {i.title ?? `Article #${i.article_id}`} ({i.slices} parts) — {fmtPrice(i.unit_price)}</li>
                                {/each}
                            </ul>
                        {/if}
                    </li>
                {/each}
            </ul>
        </section>
    {/if}
</div>

<style>
.account-card {
    width: 100%;
    max-width: 900px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.account-card h2 {
    font-family: "Artistic", serif;
    font-size: 1.7rem;
}
.tabs {
    display: flex;
    gap: 0.5rem;
}
.tabs button {
    flex: 1;
    background-color: transparent;
    color: var(--secondary);
    border: 2px solid var(--secondary);
}
.tabs button.active {
    background-color: var(--secondary);
    color: var(--primary);
}
.form {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}
.form label {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-family: "Visibility", serif;
    font-size: 0.95rem;
}
.form input.invalid,
.confirm input.invalid {
    border-color: #a83232;
    outline-color: #a83232;
}
.field-error {
    font-family: "Visibility", serif;
    font-size: 0.85rem;
    color: #a83232;
}
.field-hint {
    font-family: "Visibility", serif;
    font-size: 0.8rem;
    opacity: 0.7;
}
.form button[type="submit"] {
    grid-column: 1 / -1;
}
.meta { font-family: "Visibility", serif; }
.alert {
    width: 100%;
    max-width: 900px;
    padding: 0.75rem 1rem;
    border-radius: var(--smaller-radius);
    font-family: "Visibility", serif;
}
.alert.ok { background-color: #d6efd6; color: #245524; }
.alert.error { background-color: #f6d6d6; color: #6b1f1f; }
.actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    align-items: center;
}
.danger { background-color: #a83232; border-color: #a83232; }
.danger:hover { background-color: var(--primary); color: #a83232; border-color: #a83232; }
.ghost { background-color: transparent; color: var(--secondary); }
.ghost:hover { background-color: var(--secondary); color: var(--primary); }
.confirm {
    width: 100%;
    border: 2px solid #a83232;
    border-radius: var(--smaller-radius);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}
.cart-list, .history {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    list-style: none;
    padding: 0;
}
.cart-list li, .history > li {
    border: 2px solid var(--secondary);
    border-radius: var(--smaller-radius);
    padding: 0.6rem 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-family: "Visibility", serif;
    color: var(--secondary);
}
.cart-list li {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}
.history > li > header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-weight: bold;
}
.status {
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    font-size: 0.85rem;
    text-transform: uppercase;
}
.status.pending { background-color: #f0e0a0; color: #6b5a1f; }
.status.completed { background-color: #d6efd6; color: #245524; }
.status.cancelled { background-color: #e0e0e0; color: #444; }
.history li ul { padding-left: 1rem; font-size: 0.95rem; }
.history li li { border: none; padding: 0.1rem 0; }
.total { font-family: "Visibility", serif; align-self: flex-end; }
.link { text-decoration: underline; }
.link-button {
    font-family: "Visibility", serif;
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: var(--smaller-radius);
    border: 2px solid var(--secondary);
    color: var(--secondary);
    font-weight: 600;
}
.link-button:hover { background-color: var(--secondary); color: var(--primary); }
.hint { font-style: italic; opacity: 0.8; font-family: "Visibility", serif; }
.next-to-one-another {
    display: flex;
    width: 100%;
    justify-content: space-between;
}
@media (max-width: 800px) {
    .form { grid-template-columns: 1fr; }
}
</style>
