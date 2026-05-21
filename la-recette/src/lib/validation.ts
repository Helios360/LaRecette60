export type FieldError = string | null;

const NAME_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(value: string): FieldError {
    const v = (value ?? '').trim();
    if (!v) return 'Email requis';
    if (v.length > 254) return 'Email trop long';
    if (!EMAIL_RE.test(v)) return 'Email invalide';
    return null;
}

export function validatePassword(value: string, { isNew = false }: { isNew?: boolean } = {}): FieldError {
    if (!value) return 'Mot de passe requis';
    if (isNew) {
        if (value.length < 8) return 'Au moins 8 caractères';
        if (value.length > 128) return 'Trop long (max 128)';
        if (!/[A-Za-z]/.test(value)) return 'Doit contenir au moins une lettre';
        if (!/\d/.test(value)) return 'Doit contenir au moins un chiffre';
    }
    return null;
}

export function validatePasswordConfirm(next: string, confirm: string): FieldError {
    if (!confirm) return 'Confirmation requise';
    if (next !== confirm) return 'Les mots de passe ne correspondent pas';
    return null;
}

export function validateName(value: string, { required = true }: { required?: boolean } = {}): FieldError {
    const v = (value ?? '').trim();
    if (!v) return required ? 'Champ requis' : null;
    if (v.length < 2) return 'Au moins 2 caractères';
    if (v.length > 50) return 'Trop long (max 50)';
    if (!NAME_RE.test(v)) return 'Caractères invalides';
    return null;
}

export function validatePhone(value: string, { required = true }: { required?: boolean } = {}): FieldError {
    const v = (value ?? '').trim();
    if (!v) return required ? 'Téléphone requis' : null;
    const cleaned = v.replace(/[\s.\-()]/g, '');
    if (!/^\+?\d{8,15}$/.test(cleaned)) return 'Téléphone invalide';
    return null;
}

export function validateAddress(value: string, { required = false }: { required?: boolean } = {}): FieldError {
    const v = (value ?? '').trim();
    if (!v) return required ? 'Adresse requise' : null;
    if (v.length < 3) return 'Au moins 3 caractères';
    if (v.length > 200) return 'Trop long (max 200)';
    return null;
}

export function validateCity(value: string, { required = false }: { required?: boolean } = {}): FieldError {
    const v = (value ?? '').trim();
    if (!v) return required ? 'Ville requise' : null;
    if (v.length < 2) return 'Au moins 2 caractères';
    if (v.length > 100) return 'Trop long (max 100)';
    if (!NAME_RE.test(v)) return 'Caractères invalides';
    return null;
}

export function hasErrors(errors: Record<string, FieldError>): boolean {
    return Object.values(errors).some((e) => e !== null);
}
