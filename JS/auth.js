const container = document.getElementById('container'); 
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
const formContainer = document.querySelector('.form-container'); // Select the form container

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});