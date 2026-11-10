document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");
    const passwordInput = document.getElementById("loginPassword");
    const togglePassword = document.getElementById("togglePassword");
    const message = document.getElementById("loginMessage");

    // Show / Hide Password
    togglePassword.addEventListener("click", function () {

        const showPassword = passwordInput.type === "password";

        passwordInput.type = showPassword ? "text" : "password";

        togglePassword.setAttribute(
            "data-lucide",
            showPassword ? "eye-off" : "eye"
        );

        lucide.createIcons();
    });

    // Login Functionality
    loginForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = passwordInput.value;
        const remember = document.getElementById("rememberMe").checked;

        const users = JSON.parse(localStorage.getItem("restroUsers")) || [];

        const user = users.find(function (u) {
            return u.email.toLowerCase() === email &&
                   u.password === password;
        });

        if (!user) {
            message.textContent = "Invalid email or password. Please register first.";
            message.classList.remove("success");
            return;
        }

        const session = {
            name: user.name,
            email: user.email,
            loggedIn: true
        };

        if (remember) {
            localStorage.setItem("restroSession", JSON.stringify(session));
        } else {
            sessionStorage.setItem("restroSession", JSON.stringify(session));
            localStorage.removeItem("restroSession");
        }

        message.textContent = "Login successful! Redirecting...";
        message.classList.add("success");

        setTimeout(function () {
            window.location.href = "index1.html";
        }, 700);

    });

    // Forgot Password
    document.getElementById("forgotPassword").addEventListener("click", function (e) {
        e.preventDefault();
        alert("Password reset functionality will be available soon.");
    });

});