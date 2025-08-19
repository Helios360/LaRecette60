const burgerMenu = document.getElementById('burger-menu');
const burger = document.getElementById('burger');
burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    burgerMenu.classList.toggle('open');
});