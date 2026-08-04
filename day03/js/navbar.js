let m = document.getElementById('menu');
let mIcon = document.getElementById('menuIcon');
let cIcon = document.getElementById('closeIcon');

function openMenu() {
    m.style.display = 'block';
    cIcon.style.display = 'block';
    mIcon.style.display = 'none';
}

function closeMenu() {
    m.style.display = 'none';
    cIcon.style.display = 'none';
    mIcon.style.display = 'block';
}