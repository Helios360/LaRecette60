register = document.getElementById('register');
connexion = document.getElementById('connexion');

document.getElementById('register-form').style.display = "none";

register.addEventListener('click',()=> {
    document.getElementById('connexion-form').style.display = "none";
    document.getElementById('register-form').style.display = "flex";
});
connexion.addEventListener('click',()=> {
    document.getElementById('connexion-form').style.display = "flex";
    document.getElementById('register-form').style.display = "none";
});