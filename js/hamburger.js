const hamburger = document.querySelector('.hamburger');
const navList = document.querySelector('nav ul');
const icon = document.querySelector('.hamburger-icon');

hamburger.addEventListener('click', () => {
    navList.classList.toggle('is-active');
    icon.classList.toggle('open');
});
