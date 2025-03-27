document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    document.getElementById('register-form').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        let username = document.getElementById('username').value;
        let password = document.getElementById('password').value;
        let confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            document.getElementById('register-message').innerText = "Passwords do not match!";
            return;
        }

        // Send data to backend for registration
        fetch('https://your-backend-domain.com/register', { // Change this to your backend's domain
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = 'login.html'; // Redirect to login page
                } else {
                    document.getElementById('register-message').innerText = data.message;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('register-message').innerText = "An error occurred.";
            });
    });


    // Login
    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            let username = document.getElementById("username").value;
            let password = document.getElementById("password").value;
            let message = document.getElementById("login-message");

            try {
                let response = await fetch("https://your-backend-domain.com/login", { // Update this URL
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                let data = await response.json();
                message.innerText = data.message || data.error;
                message.style.color = response.ok ? "green" : "red";

                if (response.ok) {
                    // If login is successful, redirect to the dashboard
                    setTimeout(() => window.location.href = "dashboard.html", 1000);
                }
            } catch (error) {
                message.innerText = "Error connecting to server.";
            }
        });
    }
});
