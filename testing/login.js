const togglePassword = document.querySelector('#togglePassword');
const password = document.querySelector('#password');

togglePassword.addEventListener('click', function() {
    // Toggle the password input type
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    
    // Toggle the eye icon
    this.classList.toggle('fa-eye-slash');
    this.classList.toggle('fa-eye');
});