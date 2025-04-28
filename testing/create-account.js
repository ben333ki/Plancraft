const togglePassword = document.querySelector('#togglePassword');
const toggleConfirmPassword = document.querySelector('#toggleConfirmPassword');
const password = document.querySelector('#password');
const confirmPassword = document.querySelector('#confirm-password');

// Function to handle password toggle
function handlePasswordToggle(toggle, input) {
    toggle.addEventListener('click', function() {
        // Toggle the password input type
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        
        // Toggle the eye icon
        this.classList.toggle('fa-eye-slash');
        this.classList.toggle('fa-eye');
    });
}

// Initialize both password toggles
handlePasswordToggle(togglePassword, password);
handlePasswordToggle(toggleConfirmPassword, confirmPassword);