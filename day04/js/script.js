let m = document.getElementById('menu');
let mIcon = document.getElementById('menuIcon');
let cIcon = document.getElementById('closeIcon');

function openMenu() {
    m.style.display = 'block';
    mIcon.style.display = 'none';
    cIcon.style.display = 'block';
}

function closeMenu() {
    m.style.display = 'none';
    mIcon.style.display = 'block';
    cIcon.style.display = 'none';
}
const authModal = document.getElementById('authModal')
const loginForm = document.getElementById('loginFormContainer');
const registerForm = document.getElementById('registerFormContainer');

function openAuthModal(type) {
    authModal.style.display = 'flex';
    toggleForm(type);
}

function closeAuthModal() {
    authModal.style.display = 'none';
}

function toggleForm(type) {
    if(type === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else if(type === 'register'){
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
}

function login() {
    openAuthModal('login');
}

function register() {
    openAuthModal('register');
}

function handleLogin(event) {
    event.preventDefault();

    showAlert("Success", "Login Successful!", 'closeModal');
    loginForm.querySelector('form').reset();
}

function handleRegister(event) {
    event.preventDefault();

    const registerForm = document.getElementById('registerFormContainer');
    const nameInput = registerForm.querySelector('input[type="text"]').value;
    const emailInput = registerForm.querySelector('input[type="email"]').value;
    const passwordInput = registerForm.querySelector('input[type="password"]').value;
    
    showAlert("Account Created", `Welcome ${nameInput}!`, 'switchToLogin');
    registerForm.querySelector('form').reset();
}
let postAlertAction = null;

function showAlert(title, message, actionOnClose = null) {
    document.getElementById('alertTitle').innerText = title ;
    document.getElementById('alertMessage').innerText = message ;
    postAlertAction = actionOnClose;
    document.getElementById('customAlert').style.display = 'flex';
    
}
function closeCustomAlert() {
    document.getElementById('customAlert').style.display = 'none';
    if (postAlertAction === 'closeModal') {
        closeAuthModal();
    } else if (postAlertAction === 'switchToLogin') {
        toggleForm('login');
    }
    postAlertAction = null;
}
