document.addEventListener('DOMContentLoaded', () => {
    // Selected Form display logic
    const register = document.getElementById('register');
    const connexion = document.getElementById('connexion');

    document.getElementById('register-form').style.display = "none";

    register.addEventListener('click',(e)=> {
        e.preventDefault();
        document.getElementById('connexion-form').style.display = "none";
        document.getElementById('register-form').style.display = "flex";
    });
    connexion.addEventListener('click',(e)=> {
        e.preventDefault();
        document.getElementById('connexion-form').style.display = "flex";
        document.getElementById('register-form').style.display = "none";
    });
    function showFormError(form, message){
        let errorBox = form.querySelector('.form-error');
        if(!errorBox){
            errorBox = document.createElement('div');
            errorBox.className = 'form-error';
            form.prepend(errorBox);
        }
        errorBox.innerHTML = message;
    }
    // Connexion fields verif
    if (connexion){
        connexion.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = connexion.querySelector('input[name="email"]');
            const password = connexion.querySelector('input[name="password"]');
            const errors = [];

            if(!email.value.trim()) error.push('Veuillez renseigner votre email.');
            if(!password.value.trim()) error.push('Veuillez renseigner votre mot de passe.');
            if(errors.lenght > 0){
                e.preventDefault();
                showFormError(connexion, errors.join('<br>'));
            }
            connexion.submit();
        })
    }
    // Registration fields verif
    if (register) {
        register.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = register.querySelector('input[name="email"]');
            const password = register.querySelector('input[name="password"]');
            const streetNumber = register.querySelector('input[name="street-number"]');
            const street = register.querySelector('input[name="street"]');
            const city = register.querySelector('input[name="city"]');
            const tel = register.querySelector('input[name="tel"]');

            const errors = [];

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(email.value.trim()))errors.push('Adresse email invalide.');
            if(password.value.lenght < 8)errors.push('Le mot de passe doit contenir au moins 8 charactères.');
            if(!/^[0-9]+$/.test(streetNumber.value.trim()))errors.push('Le numéro de rue doit être composé uniquement de chiffres.');
            if(!street.value.trim())errors.push('Veuillez renseigner votre rue.');
            if(!city.value.trim())errors.push('Veuillez renseigner votre ville.');
            if(!/^[0-9]{10}$/.test(tel.value.trim()))errors.push('Le numéro doit contenir 10 chiffres');
            if (errors.lenght > 0) {
                e.preventDefault();
                showFormError(register, errors.join('<br>'));
            }
            register.submit();
        })
    }
})