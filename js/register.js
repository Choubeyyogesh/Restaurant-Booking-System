document.addEventListener("DOMContentLoaded", function () {

    const registerForm = document.getElementById("registerForm");

    const nameInput = document.getElementById("registerName");
    const emailInput = document.getElementById("registerEmail");
    const passwordInput = document.getElementById("registerPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    const message = document.getElementById("registerMessage");

    registerForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Check password length
        if (password.length < 6) {
            showMessage("Password must contain at least 6 characters.");
            return;
        }

        // Check password matching
        if (password !== confirmPassword) {
            showMessage("Passwords do not match.");
            return;
        }

        // Get existing users
        let users = JSON.parse(localStorage.getItem("restroUsers")) || [];

        // Check duplicate email
        const existingUser = users.find(function (user) {
            return user.email.toLowerCase() === email;
        });

        if (existingUser) {
            showMessage("This email is already registered. Please login.");
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);

        // Save users
        localStorage.setItem("restroUsers", JSON.stringify(users));

        message.textContent = "Account created successfully! Redirecting to login...";
        message.classList.add("success");

        registerForm.reset();

        setTimeout(function () {
            window.location.href = "login.html";
        }, 1500);

    });

    function showMessage(text) {
        message.textContent = text;
        message.classList.remove("success");
    }

});